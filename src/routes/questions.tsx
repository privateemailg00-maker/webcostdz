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
      { name: "description", content: "Answer a few tailored questions so we can scope and price your website." },
      { property: "og:title", content: "Project questions — WebCostDz" },
      { property: "og:description", content: "Answer a few tailored questions so we can scope and price your website." },
    ],
  }),
  component: QuestionWizard,
});

function QuestionWizard() {
  const navigate = useNavigate();
  const { slug, businessName, questions, questionsLang, answers, step, setQuestions, clearQuestions, setAnswer, setStep, setResult } =
    useEstimateStore();
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
    if (hydrated && questions.length > 0 && questionsLang && questionsLang !== lang) clearQuestions();
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
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-md px-5 py-32 text-center">
          <h1 className="text-xl font-semibold">{t("q.fail.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {query.error instanceof Error ? query.error.message : t("q.fail.text")}
          </p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="brand-gradient mt-6 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground"
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
      const next = selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option];
      setAnswer(current.id, next);
    } else {
      setAnswer(current.id, [option]);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({
        question: q.question,
        answer: (answers[q.id] ?? [t("q.notSpecified")]).join(", "),
        category: q.category,
      }));
      const result = await buildEstimate({ data: { slug: slug!, businessName: businessName!, lang, answers: payload } });
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
    <div className="min-h-screen">
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-2xl px-5 pt-12 pb-24">
        <div className="glow-bg pointer-events-none absolute inset-x-0 top-0 h-72" />
        <div className="relative">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>{t("q.counter", { current: step + 1, total: questions.length })}</span>
            <span>{businessName}</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="brand-gradient h-full rounded-full"
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
              className="glass mt-8 rounded-[2rem] p-7"
            >
              <p className="text-[11px] font-semibold tracking-widest text-primary uppercase">{current.category}</p>
              <h1 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">{current.question}</h1>
              {current.type === "checkbox" && (
                <p className="mt-2 text-xs text-muted-foreground">{t("q.multi")}</p>
              )}

              <div className="mt-6 space-y-3">
                {current.options.map((option) => {
                  const active = selected.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => choose(option)}
                      className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-start text-sm transition-all ${
                        active
                          ? "border-primary bg-primary/10 font-semibold text-foreground"
                          : "border-border bg-card/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {option}
                      <span
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                          active ? "brand-gradient border-transparent text-primary-foreground" : "border-border"
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
              className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium disabled:opacity-40"
            >
              <ArrowLeft className="rtl-flip size-4" /> {t("q.prev")}
            </button>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => (isLast ? submit() : setStep(step + 1))}
              className="brand-gradient shadow-glow inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40"
            >
              {isLast ? t("q.finish") : t("q.next")} <ArrowRight className="rtl-flip size-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-32 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-5 text-sm font-medium">{label}</p>
        <div className="mt-8 w-full space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 w-full animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
