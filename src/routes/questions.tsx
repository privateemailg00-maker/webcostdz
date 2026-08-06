import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  ADAPTIVE_MAX,
  createEstimate,
  getNextQuestion,
  translateQuestions,
  type Question,
} from "@/lib/estimate.functions";
import { constantQuestions } from "@/lib/constant-questions";
import { useEstimateStore } from "@/store/estimate";
import { SiteHeader } from "@/components/site-chrome";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/questions")({
  head: () => ({
    meta: [
      { title: "Project questions — WebCostDz" },
      {
        name: "description",
        content: "Answer a few tailored questions so we can scope and price your website.",
      },
      { property: "og:title", content: "Project questions — WebCostDz" },
      {
        property: "og:description",
        content: "Answer a few tailored questions so we can scope and price your website.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuestionWizard,
});

function QuestionWizard() {
  const navigate = useNavigate();
  const {
    slug,
    businessName,
    questions,
    questionsLang,
    questionsDone,
    answers,
    step,
    addQuestions,
    setQuestionsDone,
    replaceQuestions,
    setAnswer,
    setStep,
    setResult,
  } = useEstimateStore();
  const { t, lang, dir } = useI18n();
  const sign = dir === "rtl" ? -1 : 1;
  const nextQuestion = useServerFn(getNextQuestion);
  const buildEstimate = useServerFn(createEstimate);
  const [submitting, setSubmitting] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const busy = useRef(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !slug) navigate({ to: "/business" });
  }, [hydrated, slug, navigate]);

  const translate = useServerFn(translateQuestions);
  const translating = useRef(false);

  // Language changed mid-flow: translate in place instead of restarting.
  useEffect(() => {
    if (!hydrated || !questions.length || !questionsLang || questionsLang === lang) return;
    if (translating.current) return;
    translating.current = true;

    const run = async () => {
      const state = useEstimateStore.getState();
      const list = state.questions;
      const prevAnswers = state.answers;
      const aiItems = list
        .filter((q) => !q.constKey)
        .map((q) => ({
          id: q.id,
          question: q.question,
          category: q.category ?? "",
          options: q.options,
        }));

      let translated: Record<number, { question: string; category: string; options: string[] }> = {};
      try {
        const res = await translate({ data: { lang, items: aiItems } });
        translated = Object.fromEntries(res.items.map((i) => [i.id, i]));
      } catch {
        // keep original text if translation fails
      }

      const consts = constantQuestions(lang);
      const nextAnswers: Record<number, string[]> = {};

      const nextQuestions = list.map((q) => {
        const picked = prevAnswers[q.id] ?? [];
        if (q.constKey) {
          const c = consts.find((x) => x.constKey === q.constKey);
          if (!c) return q;
          const merged = { ...q, question: c.question, help: c.help, category: c.category, options: c.options, optionKeys: c.optionKeys } as Question;
          nextAnswers[q.id] = picked
            .map((p) => q.options.indexOf(p))
            .filter((i) => i >= 0)
            .map((i) => c.options[i]);
          return merged;
        }
        const tr = translated[q.id];
        if (!tr) {
          nextAnswers[q.id] = picked;
          return q;
        }
        nextAnswers[q.id] = picked
          .map((p) => q.options.indexOf(p))
          .filter((i) => i >= 0)
          .map((i) => tr.options[i] ?? q.options[i]);
        return { ...q, question: tr.question, category: tr.category || q.category, options: tr.options };
      });

      replaceQuestions(nextQuestions, lang, nextAnswers);
      translating.current = false;
    };

    setLoadingNext(true);
    void run().finally(() => {
      translating.current = false;
      setLoadingNext(false);
    });
  }, [hydrated, lang, questionsLang, questions.length, replaceQuestions, translate]);

  const loadNext = useCallback(async () => {
    if (busy.current) return false;
    busy.current = true;
    setLoadingNext(true);
    setFailed(null);
    try {
      const asked = useEstimateStore
        .getState()
        .questions.filter((q) => !q.constKey)
        .map((q) => ({
          question: q.question,
          answer: (useEstimateStore.getState().answers[q.id] ?? []).join(", "),
        }))
        .filter((a) => a.answer);

      const res = await nextQuestion({
        data: { slug: slug!, businessName: businessName!, lang, asked },
      });

      if (res.question) {
        addQuestions([res.question], lang);
      } else {
        const consts = constantQuestions(lang).map((c, i) => ({
          ...c,
          id: 900 + i,
        })) as unknown as Question[];
        addQuestions(consts, lang);
        setQuestionsDone(true);
      }
      return true;
    } catch (error) {
      setFailed(error instanceof Error ? error.message : t("q.fail.text"));
      return false;
    } finally {
      busy.current = false;
      setLoadingNext(false);
    }
  }, [addQuestions, businessName, lang, nextQuestion, setQuestionsDone, slug, t]);

  useEffect(() => {
    if (hydrated && slug && questions.length === 0 && !failed && !busy.current) void loadNext();
  }, [hydrated, slug, questions.length, failed, loadNext]);

  if (!hydrated) return <LoadingState label={t("q.loading")} />;

  if (!questions.length && !failed) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main className="relative mx-auto w-full max-w-2xl px-5 pt-12 pb-24">
          <div className="flex items-center justify-between font-mono text-[11px] font-bold tracking-widest uppercase">
            <span>{t("q.counter", { current: 1, total: ADAPTIVE_MAX })}</span>
            <span className="text-primary">{businessName}</span>
          </div>
          <div className="mt-3 h-4 w-full border-[3px] border-foreground bg-card">
            <div className="h-full w-[6%] bg-primary" />
          </div>
          <div className="brut-shadow mt-8 flex flex-col items-center gap-4 border-[3px] border-foreground bg-card p-10 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="font-mono text-[13px] font-bold tracking-wide uppercase">
              {t("q.gen.1")}
            </p>
          </div>
        </main>
      </div>
    );
  }


  if (!questions.length) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <div className="mx-auto max-w-md px-5 py-32 text-center">
          <h1 className="text-xl font-extrabold uppercase">{t("q.fail.title")}</h1>
          <p className="mt-2 font-mono text-[13px] text-muted-foreground">
            {failed ?? t("q.fail.text")}
          </p>
          <button
            type="button"
            onClick={() => void loadNext()}
            className="brut-shadow-stamp mt-6 border-[3px] border-foreground bg-foreground px-6 py-3 text-sm font-bold tracking-wide text-background uppercase"
          >
            {t("q.retry")}
          </button>
        </div>
      </div>
    );
  }

  const current = questions[Math.min(step, questions.length - 1)];
  const selected = answers[current.id] ?? [];
  const aiQuestions = questions.filter((q) => !q.constKey);
  const constQuestions = questions.filter((q) => q.constKey);
  const isConst = Boolean(current.constKey);
  const aiIndex = isConst ? aiQuestions.length : aiQuestions.findIndex((q) => q.id === current.id);
  const constIndex = isConst ? constQuestions.findIndex((q) => q.id === current.id) : -1;
  const aiTotal = questionsDone ? aiQuestions.length : Math.max(aiQuestions.length + 1, 5);
  const estimatedTotal = aiTotal;
  const progress = ((aiIndex + (isConst || selected.length ? 1 : 0)) / aiTotal) * 100;
  const isLast = questionsDone && step === questions.length - 1;
  const needsNext = step === questions.length - 1 && !questionsDone;


  const choose = (option: string) => {
    if (current.type === "checkbox") {
      const next = selected.includes(option)
        ? selected.filter((o) => o !== option)
        : [...selected, option];
      setAnswer(current.id, next);
    } else {
      setAnswer(current.id, [option]);
    }
  };

  const constAnswer = (key: "backend" | "speed") => {
    const q = questions.find((item) => item.constKey === key);
    if (!q) return undefined;
    const picked = (answers[q.id] ?? [])[0];
    const idx = q.options.indexOf(picked ?? "");
    return idx >= 0 ? q.optionKeys?.[idx] : undefined;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({
        question: q.question,
        answer: (answers[q.id] ?? [t("q.notSpecified")]).join(", "),
        category: q.category,
      }));
      const result = await buildEstimate({
        data: {
          slug: slug!,
          businessName: businessName!,
          lang,
          answers: payload,
          backend: (constAnswer("backend") ?? "managed") as "managed" | "custom",
          speed: (constAnswer("speed") ?? "standard") as "standard" | "fast" | "urgent",
        },
      });

      setResult(result);
      navigate({ to: "/results" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("q.error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) return <LoadingState label={t("q.calculating")} />;

  const generating = loadingNext && step === questions.length - 1;
  const answeredCount = questions.filter((q) => (answers[q.id] ?? []).length > 0).length;
  const genLabel = t(`q.gen.${(answeredCount % 6) + 1}` as never);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-2xl px-5 pt-12 pb-24">
        <div className="flex items-center justify-between font-mono text-[11px] font-bold tracking-widest uppercase">
          <span>
            {isConst
              ? current.category
              : t("q.counter", { current: Math.min(aiIndex + 1, estimatedTotal), total: estimatedTotal })}
          </span>
          <span className="text-primary">{businessName}</span>
        </div>
        {isConst ? (
          <div className="mt-3 flex items-stretch gap-2">
            {constQuestions.map((q, i) => (
              <div
                key={q.id}
                className={`flex-1 border-[3px] border-foreground px-2 py-2 text-center font-mono text-[9px] font-bold tracking-widest uppercase ${
                  i < constIndex
                    ? "bg-foreground text-background"
                    : i === constIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground"
                }`}
              >
                {q.category}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 h-4 w-full border-[3px] border-foreground bg-card">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${Math.max(6, progress)}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        )}


        {generating ? (
          <motion.div
            key="generating"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="brut-shadow mt-8 flex flex-col items-center gap-4 border-[3px] border-foreground bg-card p-10 text-center"
          >
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="font-mono text-[13px] font-bold tracking-wide uppercase">{genLabel}</p>
          </motion.div>
        ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 30 * sign }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 * sign }}
            transition={{ duration: 0.28 }}
            className="brut-shadow mt-8 border-[3px] border-foreground bg-card p-7"
          >
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
              {current.category}
            </p>
            <h1 className="mt-3 text-xl font-extrabold tracking-tight uppercase sm:text-2xl">
              {current.question}
            </h1>
            {current.help && (
              <div className="mt-4 border-[3px] border-dashed border-foreground bg-background p-4 font-mono text-[12px] leading-relaxed text-muted-foreground">
                {current.help}
              </div>
            )}
            {current.type === "checkbox" && (
              <p className="mt-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                {t("q.multi")}
              </p>
            )}


            <div className="mt-6 space-y-3">
              {current.options.map((option) => {
                const active = selected.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => choose(option)}
                    className={`flex w-full items-center justify-between gap-3 border-[3px] border-foreground px-5 py-4 text-start text-sm font-bold transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] ${
                      active
                        ? "bg-foreground text-background shadow-[5px_5px_0_0_var(--color-primary)]"
                        : "bg-card text-foreground"
                    }`}
                  >
                    {option}
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center border-[3px] border-current ${
                        active ? "bg-primary text-primary-foreground" : ""
                      }`}
                    >
                      {active && <Check className="size-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
        )}

        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={step === 0 || generating}
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-2 border-[3px] border-foreground bg-card px-5 py-3 text-sm font-bold uppercase disabled:opacity-40"
          >
            <ArrowLeft className="rtl-flip size-4" /> {t("q.prev")}
          </button>
          <button
            type="button"
            disabled={selected.length === 0 || loadingNext}
            onClick={async () => {
              if (isLast) return submit();
              if (needsNext) {
                const ok = await loadNext();
                if (ok) setStep(step + 1);
                return;
              }
              setStep(step + 1);
            }}
            className="brut-shadow-stamp inline-flex items-center gap-2 border-[3px] border-foreground bg-foreground px-6 py-3 text-sm font-bold text-background uppercase transition-transform hover:-translate-x-[3px] hover:-translate-y-[3px] disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-40"
          >
            {isLast ? t("q.finish") : t("q.next")} <ArrowRight className="rtl-flip size-4" />
          </button>
        </div>
      </main>
    </div>
  );
}


function LoadingState({ label }: { label: string }) {
  return (
    <>
      {/* ── Custom keyframes ─────────────────────────────────────────────────
          Defined inline so they don't require changes to tailwind.config.ts.
          Prefix "__ldr_" avoids any name collision with app-level animations.
      ──────────────────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes __ldr_cw {
          to { transform: rotate(360deg); }
        }
        @keyframes __ldr_ccw {
          to { transform: rotate(-360deg); }
        }
        @keyframes __ldr_blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        /*
         * The "3D press" illusion:
         *   raised  → translate(-4px,-4px)  +  shadow offset = 5px 5px  (object looks lifted)
         *   pressed → translate(+1px,+1px)  +  shadow offset = 0        (object slams flat)
         * Both the translation and shadow animate together — the eye reads this as
         * a physical object being pushed into the surface.
         */
        @keyframes __ldr_press {
          0%, 100% {
            transform: translate(-4px, -4px);
            box-shadow: 5px 5px 0 0 var(--color-primary);
          }
          45%, 55% {
            transform: translate(1px, 1px);
            box-shadow: 0px 0px 0 0 var(--color-primary);
          }
        }

        /*
         * Staircase variant — each skeleton row uses a different phase offset
         * so they appear to "march" in sequence.
         */
        @keyframes __ldr_march {
          0%,  20% { transform: translate(-4px, -4px); box-shadow: 5px 5px 0 0 var(--color-primary); }
          40%,  60% { transform: translate(1px,  1px);  box-shadow: 0px 0px 0 0 var(--color-primary); }
          80%, 100% { transform: translate(-4px, -4px); box-shadow: 5px 5px 0 0 var(--color-primary); }
        }
      `}</style>

      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />

        <div className="mx-auto flex max-w-xs flex-col items-center px-5 py-28 text-center">

          {/* ── Spinner: two nested counter-rotating squares ──────────────────
               The outer square has a hard amber shadow, the inner is inverted.
               Because borders are thick (3 px) and corners are sharp, this reads
               as brutalist rather than generic — it is a square, not a circle.
          ──────────────────────────────────────────────────────────────────── */}
          <div className="relative mb-10 size-[72px]">
            {/* Outer — clockwise, shadow gives the 3-D depth */}
            <div
              className="absolute inset-0 border-[3px] border-foreground bg-background"
              style={{
                animation:  "__ldr_cw 2.4s linear infinite",
                boxShadow:  "6px 6px 0 0 var(--color-primary)",
              }}
            />
            {/* Inner — counter-clockwise, inverted colours */}
            <div
              className="absolute inset-[18%] border-[3px] border-primary bg-foreground"
              style={{ animation: "__ldr_ccw 1.7s linear infinite" }}
            />
          </div>

          {/* ── Label chip ────────────────────────────────────────────────────
               Inverted block (fg background / bg text) with a hard primary shadow.
               The blinking underscore cursor adds a terminal / brutalist feel.
          ──────────────────────────────────────────────────────────────────── */}
          <div
            className="border-[3px] border-foreground bg-foreground px-6 py-3"
            style={{ boxShadow: "5px 5px 0 0 var(--color-primary)" }}
          >
            <p className="font-mono text-[11px] font-bold tracking-[0.22em] uppercase text-background">
              {label}
              <span
                className="ml-0.5 inline-block w-[1ch]"
                style={{ animation: "__ldr_blink 1s step-end infinite" }}
              >
                _
              </span>
            </p>
          </div>

          {/* ── Skeleton rows with staggered 3-D press animation ─────────────
               Each row lifts and "slams" into its surface at a different phase,
               creating a marching-dominoes rhythm.  The hard offset shadow is
               what sells the depth: it grows and shrinks synchronously with the
               translate, giving the impression of a real shadow cast from above.
          ──────────────────────────────────────────────────────────────────── */}
          <div className="mt-10 w-full space-y-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-14 w-full border-[3px] border-foreground bg-muted"
                style={{
                  animation:      "__ldr_march 1.6s ease-in-out infinite",
                  animationDelay: `${i * 0.22}s`,
                }}
              />
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
