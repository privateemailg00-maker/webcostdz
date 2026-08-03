import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { calculatePrice, BACKEND_KEYS, SPEED_KEYS } from "./pricing";
import { langSchema, LANG_NAMES } from "./lang";


export type Question = {
  id: number;
  question: string;
  type: "radio" | "checkbox" | "text";
  options: string[];
  weight: number;
  category: string;
  help?: string;
  constKey?: "backend" | "speed";
  optionKeys?: string[];
};

export type Analysis = {
  project_summary: string;
  recommended_stack: string[];
  complexity: string;
  suggested_features: string[];
  development_phases: { name: string; description: string; duration: string }[];
  possible_future_features: string[];
};

export const ADAPTIVE_MAX = 8;
const ADAPTIVE_MIN = 5;

const nextInput = z.object({
  slug: z.string().min(1).max(60),
  businessName: z.string().min(1).max(80),
  lang: langSchema,
  asked: z
    .array(z.object({ question: z.string().max(400), answer: z.string().max(600) }))
    .max(20),
});

/** Returns the next question, chosen by AI based on everything answered so far. */
export const getNextQuestion = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => nextInput.parse(d))
  .handler(async ({ data }): Promise<{ question: Question | null; done: boolean }> => {
    const { callAiJson } = await import("./ai.server");

    if (data.asked.length >= ADAPTIVE_MAX) return { question: null, done: true };

    const history = data.asked.length
      ? data.asked.map((a) => `Q: ${a.question}\nA: ${a.answer}`).join("\n")
      : "(no questions answered yet)";

    const result = await callAiJson<{
      enough?: boolean;
      question?: Omit<Question, "id"> | null;
    }>(
      `You are an experienced software business analyst interviewing a non-technical client, ONE question at a time.
Return JSON only: {"enough": boolean, "question": {"question": string, "type": "radio"|"checkbox", "options": string[], "weight": number (1-5), "category": string} | null}.
Rules:
- Ask exactly ONE new question that follows logically from the previous answers and helps scope and price the website.
- Never repeat or rephrase a question already asked. Build on the answers given.
- Keep it simple, multiple choice, and only ask things that affect pricing or scope.
- Do NOT ask about backend technology, hosting platform, delivery speed, deadline or budget — those are asked separately at the end.
- Set "enough" to true (and "question" to null) only when you already have enough information to scope the project.
- At least ${ADAPTIVE_MIN} questions must be asked before "enough" can be true; a maximum of ${ADAPTIVE_MAX} questions total.
IMPORTANT: write the question text, options and category in ${LANG_NAMES[data.lang]}. Keep the JSON keys in English.`,
      `Business type: ${data.businessName}\nAnswers so far:\n${history}`,
    );

    const enough = Boolean(result.enough) && data.asked.length >= ADAPTIVE_MIN;
    if (enough || !result.question?.question) return { question: null, done: true };

    const q = result.question;
    return {
      question: {
        id: data.asked.length + 1,
        question: q.question,
        type: q.type === "checkbox" ? "checkbox" : "radio",
        options: Array.isArray(q.options) && q.options.length ? q.options : ["Yes", "No"],
        weight: typeof q.weight === "number" ? q.weight : 2,
        category: q.category ?? "",
      },
      done: false,
    };
  });


const translateInput = z.object({
  lang: langSchema,
  items: z
    .array(
      z.object({
        id: z.number(),
        question: z.string().max(400),
        category: z.string().max(120).default(""),
        options: z.array(z.string().max(300)).max(12),
      }),
    )
    .max(20),
});

/** Translates already-asked AI questions into another language, keeping ids and option order. */
export const translateQuestions = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => translateInput.parse(d))
  .handler(async ({ data }): Promise<{ items: { id: number; question: string; category: string; options: string[] }[] }> => {
    if (!data.items.length) return { items: [] };
    const { callAiJson } = await import("./ai.server");

    const result = await callAiJson<{
      items?: { id: number; question: string; category: string; options: string[] }[];
    }>(
      `You are a professional translator. Translate the given questionnaire items into ${LANG_NAMES[data.lang]}.
Return JSON only: {"items":[{"id": number, "question": string, "category": string, "options": string[]}]}.
Rules: keep the exact same ids, same number of options and the SAME option ORDER. Translate naturally, keep it short. Do not add or remove items.`,
      JSON.stringify(data.items),
    );

    const byId = new Map((result.items ?? []).map((i) => [i.id, i]));
    return {
      items: data.items.map((src) => {
        const tr = byId.get(src.id);
        const options =
          tr && Array.isArray(tr.options) && tr.options.length === src.options.length
            ? tr.options
            : src.options;
        return {
          id: src.id,
          question: tr?.question || src.question,
          category: tr?.category || src.category,
          options,
        };
      }),
    };
  });


const estimateInput = z.object({
  slug: z.string().min(1).max(60),
  businessName: z.string().min(1).max(80),
  lang: langSchema,
  backend: z.enum(BACKEND_KEYS).default("managed"),
  speed: z.enum(SPEED_KEYS).default("standard"),
  answers: z
    .array(
      z.object({
        question: z.string().max(400),
        answer: z.string().max(600),
        category: z.string().max(80).optional(),
      }),
    )
    .max(25),
});

export const createEstimate = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => estimateInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { callAiJson } = await import("./ai.server");
    const { loadPriceRows, toRules, featureKeysOf, addonsOf } = await import("./pricing.server");

    const rows = await loadPriceRows();
    const featureKeys = featureKeysOf(rows);
    const answersText = data.answers.map((a) => `Q: ${a.question}\nA: ${a.answer}`).join("\n");

    const extracted = await callAiJson<{ features: string[] }>(
      `You are a senior software architect. Given a client's answers, decide which website features the project requires.
Return JSON only: {"features": ["feature_key", ...]}.
You may ONLY use keys from this list: ${featureKeys.join(", ")}.
Always include "landing_page". Never mention or calculate prices.`,
      `Business type: ${data.businessName}\n${answersText}`,
    );

    const pricing = calculatePrice(
      ["landing_page", ...(extracted.features ?? []).filter((f) => featureKeys.includes(f))],
      { rules: toRules(rows), speed: data.speed, backend: data.backend },
    );

    const analysis = await callAiJson<Analysis>(
      `You are a senior software architect. Analyze the project and return JSON only with keys:
project_summary (string, 2-4 sentences), recommended_stack (string array), complexity (string),
suggested_features (string array), development_phases (array of {name, description, duration}),
possible_future_features (string array). Do NOT calculate or mention any price.
IMPORTANT: write all human-readable text (project_summary, complexity, suggested_features, phase names/descriptions/durations, future features) in ${LANG_NAMES[data.lang]}. Keep JSON keys in English and keep technology names as-is.`,
      `Business type: ${data.businessName}\nBackend approach: ${data.backend === "custom" ? "custom coded backend" : "ready-made managed backend platform"}\nDelivery speed: ${data.speed}\nSelected features: ${pricing.features.map((f) => f.label).join(", ")}\nComplexity: ${pricing.complexity}\nTimeline: ${pricing.duration}\n${answersText}`,
    );

    const inserted = await supabaseAdmin
      .from("estimates")
      .insert({
        business_type: data.businessName,
        answers_json: data.answers as never,
        features_json: pricing.features as never,
        minimum_price: pricing.minimumPrice,
        maximum_price: pricing.maximumPrice,
        duration: pricing.duration,
        complexity: pricing.complexity,
        summary: analysis.project_summary ?? null,
        analysis_json: analysis as never,
      })
      .select("id")
      .single();

    if (inserted.error) {
      console.error("Failed to save estimate", inserted.error);
      throw new Error("Could not save your estimate. Please try again.");
    }

    return {
      id: inserted.data.id as string,
      pricing,
      analysis,
      addons: addonsOf(rows),
      businessName: data.businessName,
      slug: data.slug,
    };
  });

const leadInput = z.object({
  estimateId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(100),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(255),
  projectDetails: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => leadInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("estimates")
      .update({
        full_name: data.fullName,
        company: data.company || null,
        phone: data.phone,
        email: data.email,
        project_details: data.projectDetails || null,
      })
      .eq("id", data.estimateId);

    if (error) {
      console.error("Failed to save lead", error);
      throw new Error("Could not send your request. Please try again.");
    }
    return { ok: true };
  });
