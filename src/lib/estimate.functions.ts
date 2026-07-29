import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { calculatePrice, FEATURE_KEYS, OPTIONAL_ADDONS } from "./pricing";

export type Question = {
  id: number;
  question: string;
  type: "radio" | "checkbox" | "text";
  options: string[];
  weight: number;
  category: string;
};

export type Analysis = {
  project_summary: string;
  recommended_stack: string[];
  complexity: string;
  suggested_features: string[];
  development_phases: { name: string; description: string; duration: string }[];
  possible_future_features: string[];
};

const questionsInput = z.object({
  slug: z.string().min(1).max(60),
  businessName: z.string().min(1).max(80),
});

export const getQuestions = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => questionsInput.parse(d))
  .handler(async ({ data }): Promise<{ questions: Question[] }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { callAiJson } = await import("./ai.server");

    const cached = await supabaseAdmin
      .from("ai_questions")
      .select("questions_json")
      .eq("business_slug", data.slug)
      .maybeSingle();

    if (cached.data?.questions_json) {
      return { questions: cached.data.questions_json as unknown as Question[] };
    }

    const result = await callAiJson<{ questions: Question[] }>(
      `You are an experienced software business analyst. Return JSON only in the shape {"questions": [...]}.
Generate between 8 and 15 questions that help estimate the complexity of building a website for the selected business.
Rules: use multiple-choice questions whenever possible; keep them simple for non-technical users; only include questions that affect pricing.
Each question must contain: id (number), question (string), type ("radio" or "checkbox"), options (string array), weight (1-5), category (string).`,
      `Business type: ${data.businessName}`,
    );

    const questions = (result.questions ?? []).slice(0, 15).map((q, i) => ({
      ...q,
      id: i + 1,
      type: q.type === "checkbox" ? "checkbox" : "radio",
      options: Array.isArray(q.options) && q.options.length ? q.options : ["Yes", "No"],
    })) as Question[];

    if (!questions.length) throw new Error("Could not generate questions. Please try again.");

    await supabaseAdmin
      .from("ai_questions")
      .upsert({ business_slug: data.slug, questions_json: questions as never }, { onConflict: "business_slug" });

    return { questions };
  });

const estimateInput = z.object({
  slug: z.string().min(1).max(60),
  businessName: z.string().min(1).max(80),
  answers: z.array(
    z.object({
      question: z.string().max(400),
      answer: z.string().max(600),
      category: z.string().max(80).optional(),
    }),
  ).max(20),
});

export const createEstimate = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => estimateInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { callAiJson } = await import("./ai.server");

    const answersText = data.answers.map((a) => `Q: ${a.question}\nA: ${a.answer}`).join("\n");

    const extracted = await callAiJson<{ features: string[] }>(
      `You are a senior software architect. Given a client's answers, decide which website features the project requires.
Return JSON only: {"features": ["feature_key", ...]}.
You may ONLY use keys from this list: ${FEATURE_KEYS.join(", ")}.
Always include "landing_page". Never mention or calculate prices.`,
      `Business type: ${data.businessName}\n${answersText}`,
    );

    const pricing = calculatePrice([
      "landing_page",
      ...(extracted.features ?? []).filter((f) => FEATURE_KEYS.includes(f)),
    ]);

    const analysis = await callAiJson<Analysis>(
      `You are a senior software architect. Analyze the project and return JSON only with keys:
project_summary (string, 2-4 sentences), recommended_stack (string array), complexity (string),
suggested_features (string array), development_phases (array of {name, description, duration}),
possible_future_features (string array). Do NOT calculate or mention any price.`,
      `Business type: ${data.businessName}\nSelected features: ${pricing.features.map((f) => f.label).join(", ")}\nComplexity: ${pricing.complexity}\nTimeline: ${pricing.duration}\n${answersText}`,
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
      addons: OPTIONAL_ADDONS,
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
