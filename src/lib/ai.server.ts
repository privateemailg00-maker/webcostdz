const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const XAI_URL =
  "https://api.x.ai/v1/chat/completions";

type AIProvider =
  | "gemini"
  | "openrouter-1"
  | "xai";

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

type XAIResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number) {
  return [408, 429, 500, 502, 503, 504].includes(status);
}

/* =========================================================
   GEMINI
   ========================================================= */

async function callGemini(
  system: string,
  user: string,
  key: string,
): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": key,
    },

    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: system }],
      },

      contents: [
        {
          role: "user",
          parts: [{ text: user }],
        },
      ],

      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  const body = await res.text();

  if (!res.ok) {
    console.error(`[Gemini] ${res.status}: ${body}`);

    const error = new Error(
      `Gemini request failed: ${res.status}`,
    );

    Object.assign(error, {
      status: res.status,
    });

    throw error;
  }

  const data = JSON.parse(body) as GeminiResponse;

  const content =
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!content) {
    throw new Error("Gemini returned an empty response.");
  }

  return content;
}

/* =========================================================
   OPENROUTER
   ========================================================= */

async function callOpenRouter(
  system: string,
  user: string,
  key: string,
): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://webcostdz.com",
      "X-Title": "WebCostDz",
    },

    body: JSON.stringify({
      model: "openrouter/free",

      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: user,
        },
      ],

      response_format: {
        type: "json_object",
      },
    }),
  });

  const body = await res.text();

  if (!res.ok) {
    console.error(`[OpenRouter] ${res.status}: ${body}`);

    const error = new Error(
      `OpenRouter request failed: ${res.status}`,
    );

    Object.assign(error, {
      status: res.status,
    });

    throw error;
  }

  const data = JSON.parse(body) as OpenRouterResponse;

  const content =
    data.choices?.[0]?.message?.content ?? "";

  if (!content) {
    throw new Error(
      "OpenRouter returned an empty response.",
    );
  }

  return content;
}

/* =========================================================
   GROK / XAI
   ========================================================= */

async function callXAI(
  system: string,
  user: string,
  key: string,
): Promise<string> {
  const res = await fetch(XAI_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },

    body: JSON.stringify({
      model: "grok-4.1-fast",

      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: user,
        },
      ],

      response_format: {
        type: "json_object",
      },
    }),
  });

  const body = await res.text();

  if (!res.ok) {
    console.error(`[xAI] ${res.status}: ${body}`);

    const error = new Error(
      `xAI request failed: ${res.status}`,
    );

    Object.assign(error, {
      status: res.status,
    });

    throw error;
  }

  const data = JSON.parse(body) as XAIResponse;

  const content =
    data.choices?.[0]?.message?.content ?? "";

  if (!content) {
    throw new Error(
      "xAI returned an empty response.",
    );
  }

  return content;
}

/* =========================================================
   JSON PARSER
   ========================================================= */

function parseJson<T>(content: string): T {
  const cleaned = content
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    console.error(
      "AI returned non-JSON:",
      content.slice(0, 500),
    );

    throw new Error(
      "The AI returned an unexpected response.",
    );
  }
}

/* =========================================================
   RETRY SYSTEM
   ========================================================= */

async function callWithRetry(
  provider: AIProvider,
  fn: () => Promise<string>,
): Promise<string> {
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[AI] ${provider} attempt ${attempt + 1}`,
      );

      return await fn();
    } catch (error) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error
          ? Number(
              (error as { status?: unknown }).status,
            )
          : undefined;

      /*
       * If the error isn't retryable, immediately
       * move to the next provider.
       */

      if (
        attempt === maxRetries ||
        (status !== undefined &&
          !isRetryableStatus(status))
      ) {
        throw error;
      }

      const delay = 1000 * 2 ** attempt;

      console.warn(
        `[AI] ${provider} failed (${status ?? "unknown"}). ` +
          `Retrying in ${delay}ms...`,
      );

      await sleep(delay);
    }
  }

  throw new Error(`${provider} failed.`);
}

/* =========================================================
   MAIN AI FUNCTION
   ========================================================= */

export async function callAiJson<T>(
  system: string,
  user: string,
): Promise<T> {
  /*
   * IMPORTANT:
   * These are SERVER-SIDE environment variables.
   *
   * Do NOT use VITE_ prefixes for these keys.
   */

  const geminiKey = process.env.GEMINI_API_KEY;

  const openRouterKey1 =
    process.env.OPENROUTER_API_KEY;

  const openRouterKey2 =
    process.env.OPENROUTER_API2_KEY;

  const xaiKey =
    process.env.XAI_API_KEY;

  /*
   * Build provider chain.
   *
   * Order:
   *
   * 1. Gemini
   * 2. OpenRouter #1
   * 3. OpenRouter #2
   * 4. xAI / Grok
   */

  const providers: Array<{
    name: AIProvider;
    call: () => Promise<string>;
  }> = [];

  /* ---------------- GEMINI ---------------- */

  if (geminiKey) {
    providers.push({
      name: "gemini",

      call: () =>
        callWithRetry(
          "gemini",
          () =>
            callGemini(
              system,
              user,
              geminiKey,
            ),
        ),
    });
  }

  /* ---------------- OPENROUTER #1 ---------------- */

  if (openRouterKey1) {
    providers.push({
      name: "openrouter-1",

      call: () =>
        callWithRetry(
          "openrouter-1",
          () =>
            callOpenRouter(
              system,
              user,
              openRouterKey1,
            ),
        ),
    });
  }
  /* ---------------- XAI / GROK ---------------- */

  if (xaiKey) {
    providers.push({
      name: "xai",
      call: () =>
        callWithRetry(
          "xai",
          () =>
            callXAI(
              system,
              user,
              xaiKey,
            ),
        ),
    });
  }

  /* ---------------- NO PROVIDERS ---------------- */

  if (providers.length === 0) {
    throw new Error(
      "AI is not configured. Please add at least one AI API key.",
    );
  }

  /*
   * Try providers sequentially.
   */

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      console.log(
        `[AI] Trying provider: ${provider.name}`,
      );

      const content = await provider.call();

      console.log(
        `[AI] ${provider.name} succeeded.`,
      );

      /*
       * Parse JSON here.
       *
       * If the provider technically responds with HTTP 200
       * but gives invalid JSON, we treat that provider as
       * failed and move to the next provider.
       */

      return parseJson<T>(content);

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        `[AI] ${provider.name} failed:`,
        message,
      );

      errors.push(
        `${provider.name}: ${message}`,
      );

      /*
       * IMPORTANT:
       * Continue to the next provider.
       */
      continue;
    }
  }

  /*
   * Every provider failed.
   */

  throw new Error(
    `All AI providers failed. ${errors.join(" | ")}`,
  );
}