import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createEstimate, getQuestions } from "@/lib/estimate.functions";
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
    answers,
    step,
    setQuestions,
    clearQuestions,
    setAnswer,
    setStep,
    setResult,
  } = useEstimateStore();
  const { t, lang, dir } = useI18n();
  const sign = dir === "rtl" ? -1 : 1;
  const fetchQuestions = useServerFn(getQuestions);
  const buildEstimate = useServerFn(createEstimate);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !slug) navigate({ to: "/business" });
  }, [hydrated, slug, navigate]);

  useEffect(() => {
    if (hydrated && questions.length > 0 && questionsLang && questionsLang !== lang)
      clearQuestions();
  }, [hydrated, lang, questionsLang, questions.length, clearQuestions]);

  const query = useQuery({
    queryKey: ["questions", slug, lang],
    enabled: hydrated && !!slug && questions.length === 0,
    retry: false,
    queryFn: () => fetchQuestions({ data: { slug: slug!, businessName: businessName!, lang } }),
  });

  useEffect(() => {
    if (query.data?.questions?.length) setQuestions(query.data.questions, lang);
  }, [query.data, setQuestions, lang]);

  if (!hydrated || (!questions.length && query.isPending)) {
    return <LoadingState label={t("q.loading")} />;
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <div className="mx-auto max-w-md px-5 py-32 text-center">
          <h1 className="text-xl font-extrabold uppercase">{t("q.fail.title")}</h1>
          <p className="mt-2 font-mono text-[13px] text-muted-foreground">
            {query.error instanceof Error ? query.error.message : t("q.fail.text")}
          </p>
          <button
            type="button"
            onClick={() => query.refetch()}
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
  const progress = ((step + (selected.length ? 1 : 0)) / questions.length) * 100;
  const isLast = step === questions.length - 1;

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-2xl px-5 pt-12 pb-24">
        <div className="flex items-center justify-between font-mono text-[11px] font-bold tracking-widest uppercase">
          <span>{t("q.counter", { current: step + 1, total: questions.length })}</span>
          <span className="text-primary">{businessName}</span>
        </div>
        <div className="mt-3 h-4 w-full border-[3px] border-foreground bg-card">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${Math.max(6, progress)}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

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

        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-2 border-[3px] border-foreground bg-card px-5 py-3 text-sm font-bold uppercase disabled:opacity-40"
          >
            <ArrowLeft className="rtl-flip size-4" /> {t("q.prev")}
          </button>
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => (isLast ? submit() : setStep(step + 1))}
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
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-32 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-5 font-mono text-xs font-bold tracking-widest uppercase">{label}</p>
        <div className="mt-8 w-full space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-14 w-full animate-pulse border-[3px] border-foreground bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
