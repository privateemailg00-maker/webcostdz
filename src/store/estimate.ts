import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Question, Analysis } from "@/lib/estimate.functions";
import type { PriceResult } from "@/lib/pricing";

export type AnswerEntry = { question: string; answer: string; category?: string };

export type EstimateResult = {
  id: string;
  pricing: PriceResult;
  analysis: Analysis;
  addons: { key: string; label: string; price: number }[];
  businessName: string;
  slug: string;
};

type State = {
  onboarded: boolean;
  slug: string | null;
  businessName: string | null;
  questions: Question[];
  questionsLang: string | null;
  questionsDone: boolean;
  answers: Record<number, string[]>;
  step: number;
  result: EstimateResult | null;
  leadSent: boolean;
  recent: { id: string; businessName: string; min: number; max: number; at: number }[];
  setOnboarded: () => void;
  selectBusiness: (slug: string, name: string) => void;
  setQuestions: (q: Question[], lang: string) => void;
  replaceQuestions: (q: Question[], lang: string, answers: Record<number, string[]>) => void;
  addQuestions: (q: Question[], lang: string) => void;
  setQuestionsDone: (v: boolean) => void;
  clearQuestions: () => void;
  setAnswer: (id: number, value: string[]) => void;
  setStep: (n: number) => void;
  setResult: (r: EstimateResult) => void;
  setLeadSent: (v: boolean) => void;
  reset: () => void;
};

export const useEstimateStore = create<State>()(
  persist(
    (set, get) => ({
      onboarded: false,
      slug: null,
      businessName: null,
      questions: [],
      questionsLang: null,
      questionsDone: false,
      answers: {},
      step: 0,
      result: null,
      leadSent: false,
      recent: [],
      setOnboarded: () => set({ onboarded: true }),
      selectBusiness: (slug, businessName) =>
        set({ slug, businessName, questions: [], questionsLang: null, questionsDone: false, answers: {}, step: 0, result: null, leadSent: false }),
      setQuestions: (questions, questionsLang) => set({ questions, questionsLang }),
      replaceQuestions: (questions, questionsLang, answers) =>
        set({ questions, questionsLang, answers }),
      addQuestions: (questions, questionsLang) =>
        set({
          questionsLang,
          questions: [
            ...get().questions,
            ...questions.filter((q) => !get().questions.some((e) => e.id === q.id)),
          ],
        }),
      setQuestionsDone: (questionsDone) => set({ questionsDone }),
      clearQuestions: () => set({ questions: [], questionsLang: null, questionsDone: false, answers: {}, step: 0 }),
      setAnswer: (id, value) => set({ answers: { ...get().answers, [id]: value } }),
      setStep: (step) => set({ step }),
      setResult: (result) =>
        set({
          result,
          leadSent: false,
          recent: [
            {
              id: result.id,
              businessName: result.businessName,
              min: result.pricing.minimumPrice,
              max: result.pricing.maximumPrice,
              at: Date.now(),
            },
            ...get().recent.filter((r) => r.id !== result.id),
          ].slice(0, 5),
        }),
      setLeadSent: (leadSent) => set({ leadSent }),
      reset: () =>
        set({ slug: null, businessName: null, questions: [], questionsLang: null, questionsDone: false, answers: {}, step: 0, result: null, leadSent: false }),
    }),
    { name: "webcostdz-estimate" },
  ),
);
