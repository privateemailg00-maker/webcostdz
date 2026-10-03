import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  CalendarDays,
  CheckCircle2,
  Gauge,
  Layers,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  Wallet,
} from "lucide-react";
import { submitLead } from "@/lib/estimate.functions";
import { useEstimateStore } from "@/store/estimate";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/pricing";
import { localizeFeature } from "@/lib/i18n/content";
import { RewardedGate } from "@/components/ads/RewardedGate";
import { AdSlot, AD_SLOTS } from "@/components/ads/AdSlot";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your website estimate — WebCostDz" },
      {
        name: "description",
        content: "Your estimated website price, timeline, complexity and project roadmap.",
      },
      { property: "og:title", content: "Your website estimate — WebCostDz" },
      {
        property: "og:description",
        content: "Your estimated website price, timeline, complexity and project roadmap.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Results,
});

const makeLeadSchema = (t: (k: string) => string) =>
  z.object({
    fullName: z.string().trim().min(2, t("res.err.name")).max(100),
    company: z.string().trim().max(120).optional(),
    phone: z.string().trim().min(6, t("res.err.phone")).max(30),
    email: z.string().trim().email(t("res.err.email")).max(255),
    projectDetails: z.string().trim().max(2000).optional(),
  });

type LeadValues = z.infer<ReturnType<typeof makeLeadSchema>>;

function Results() {
  const navigate = useNavigate();
  const { result, leadSent, setLeadSent, reset, questions, answers, setStep, unlockedId, setUnlocked } = useEstimateStore();
  const [hydrated, setHydrated] = useState(false);
  const sendLead = useServerFn(submitLead);
  const { t, lang } = useI18n();
  const L = (ar: string, fr: string, en: string) => (lang === "ar" ? ar : lang === "fr" ? fr : en);

  const form = useForm<LeadValues>({
    resolver: zodResolver(makeLeadSchema(t)),
    defaultValues: { fullName: "", company: "", phone: "", email: "", projectDetails: "" },
  });

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (hydrated && !result) navigate({ to: "/business" });
  }, [hydrated, result, navigate]);

  if (!hydrated || !result) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <div className="mx-auto max-w-md px-5 py-32 text-center font-mono text-xs font-bold tracking-widest uppercase">
          {t("res.loading")}
        </div>
      </div>
    );
  }

  if (unlockedId !== result.id) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-5 pt-12 pb-24">
          <RewardedGate lang={lang} onReward={() => setUnlocked(result.id)} />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const { pricing, analysis, addons, businessName } = result;
  const durationLabel = t("res.days", { min: pricing.minDays, max: pricing.maxDays });

  const onSubmit = async (values: LeadValues) => {
    try {
      await sendLead({ data: { estimateId: result.id, ...values } });
      setLeadSent(true);
      toast.success(t("res.form.success"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("res.form.error"));
    }
  };

  const share = async () => {
    const text = t("res.shareText", {
      business: businessName,
      min: formatPrice(pricing.minimumPrice),
      max: formatPrice(pricing.maximumPrice),
      duration: durationLabel,
    });
    try {
      if (navigator.share) await navigator.share({ title: "WebCostDz estimate", text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success(t("res.shared"));
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-5xl px-5 pt-12 pb-24">
        <div className="text-center">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-primary uppercase">
            {t("res.for", { business: businessName })}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
            {t("res.title")}
          </h1>
        </div>

        <div className="mt-10 grid border-[3px] border-foreground sm:grid-cols-3">
          {[
            {
              icon: Wallet,
              label: t("res.price"),
              value: `${formatPrice(pricing.minimumPrice)} – ${formatPrice(pricing.maximumPrice)}`,
            },
            {
              icon: CalendarDays,
              label: t("res.time"),
              value: `${durationLabel}${pricing.speedSurcharge ? ` · ${t(`speed.${pricing.speed}`)}` : ""}`,
            },
            {
              icon: Gauge,
              label: t("res.complexity"),
              value: `${t(`complexity.${pricing.complexity}`)} (${t("res.points", { score: pricing.complexityScore })})`,
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="border-b-[3px] border-foreground bg-card p-6 last:border-b-0 sm:border-e-[3px] sm:border-b-0 sm:last:border-e-0"
            >
              <span className="inline-flex size-10 items-center justify-center border-[3px] border-foreground bg-primary text-primary-foreground">
                <card.icon className="size-5" />
              </span>
              <p className="mt-4 font-mono text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                {card.label}
              </p>
              <p className="mt-1 text-xl font-extrabold tracking-tight">{card.value}</p>
            </motion.div>
          ))}
        </div>

        <AdSlot slot={AD_SLOTS.results} className="mt-6" />

        <Section title={t("res.summary")} icon={Sparkles}>
          <p className="font-mono text-[13px] leading-relaxed text-muted-foreground">
            {analysis.project_summary}
          </p>
        </Section>

        <Section title={t("res.features")} icon={Layers}>
          <div className="flex flex-wrap gap-2">
            {pricing.features.filter((f) => !f.pack).map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-2 border-[3px] border-foreground bg-background px-4 py-2 text-sm font-bold"
              >
                <CheckCircle2 className="size-3.5 text-primary" />
                {localizeFeature(lang, f.key, f.label)}
                <span className="font-mono text-xs text-muted-foreground">{formatPrice(f.price)}</span>
              </span>
            ))}
          </div>
          {(pricing.packs ?? []).length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {pricing.packs.map((p) => (
                <div key={p.key} className="border-[3px] border-foreground bg-background p-4 brut-shadow">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-bold uppercase">{p.label[lang as "ar" | "fr" | "en"] ?? p.label.en}</h3>
                    <span className="font-mono text-sm font-bold text-primary">{formatPrice(p.price)}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {p.features.map((k) => {
                      const f = pricing.features.find((x) => x.key === k);
                      return (
                        <li key={k} className="flex items-center gap-2 font-mono text-xs">
                          <CheckCircle2 className="size-3 text-primary" />
                          {localizeFeature(lang, k, f?.label ?? k)}
                          <span className="text-muted-foreground line-through">{f ? formatPrice(f.price) : ""}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-2 inline-block border-2 border-foreground bg-primary px-2 py-0.5 font-mono text-xs font-bold text-primary-foreground">
                    {lang === "ar" ? "توفير" : lang === "fr" ? "Économie" : "You save"} {formatPrice(p.saved)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>

        {analysis.development_phases?.length > 0 && (
          <Section title={t("res.phases")} icon={CalendarDays}>
            <ol className="relative space-y-6 border-s-[3px] border-foreground ps-6">
              {analysis.development_phases.map((phase) => (
                <li key={phase.name} className="relative">
                  <span className="absolute -start-[33px] mt-1.5 size-3.5 border-[3px] border-foreground bg-primary" />
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-sm font-bold uppercase">{phase.name}</h3>
                    <span className="font-mono text-xs text-primary">{phase.duration}</span>
                  </div>
                  <p className="mt-1 font-mono text-[13px] text-muted-foreground">
                    {phase.description}
                  </p>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {analysis.recommended_stack?.length > 0 && (
          <Section title={t("res.stack")} icon={Layers}>
            <div className="flex flex-wrap gap-2">
              {analysis.recommended_stack.map((tech) => (
                <span
                  key={tech}
                  className="border-[3px] border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold tracking-widest text-background uppercase"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Section>
        )}

        <Section title={t("res.addons")} icon={Plus}>
          <div className="grid gap-3 sm:grid-cols-2">
            {addons.map((addon) => (
              <div
                key={addon.key}
                className="flex items-center justify-between border-[3px] border-foreground bg-background px-5 py-4 text-sm font-bold"
              >
                <span>{localizeFeature(lang, addon.key, addon.label)}</span>
                <span className="text-primary">+{formatPrice(addon.price)}</span>
              </div>
            ))}
          </div>
          {analysis.possible_future_features?.length > 0 && (
            <p className="mt-4 font-mono text-[11px] text-muted-foreground">
              {t("res.future")} {analysis.possible_future_features.join(" · ")}
            </p>
          )}
        </Section>

        {!leadSent && questions.length > 0 && (
          <Section title={L("مراجعة إجاباتك", "Vérifiez vos réponses", "Review your answers")} icon={Pencil}>
            <p className="mb-4 font-mono text-xs text-muted-foreground">
              {L(
                "يمكنك تعديل أي إجابة قبل إرسال معلوماتك، وسيتم إعادة حساب التقدير.",
                "Modifiez une réponse avant d'envoyer vos coordonnées ; l'estimation sera recalculée.",
                "Change any answer before sending your details — the estimate will be recalculated.",
              )}
            </p>
            <ol className="space-y-2">
              {questions.map((q, i) => (
                <li
                  key={q.id}
                  className="flex items-start justify-between gap-3 border-[3px] border-foreground bg-background px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold">
                      {i + 1}. {q.question}
                    </p>
                    <p className="mt-1 font-mono text-xs text-primary">
                      {(answers[q.id] ?? []).join(", ") || "—"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(i);
                      navigate({ to: "/questions" });
                    }}
                    className="inline-flex shrink-0 items-center gap-1 border-[3px] border-foreground bg-card px-3 py-1.5 text-xs font-bold uppercase hover:bg-foreground hover:text-background"
                  >
                    <Pencil className="size-3" /> {L("تعديل", "Modifier", "Edit")}
                  </button>
                </li>
              ))}
            </ol>
          </Section>
        )}

        <div className="relative mt-12">
          <div className="brut-shadow-stamp border-[3px] border-foreground bg-card p-7 sm:p-9">
            {leadSent ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto size-10 text-primary" />
                <h2 className="mt-4 text-xl font-extrabold uppercase">{t("res.sent.title")}</h2>
                <p className="mt-2 font-mono text-[13px] text-muted-foreground">
                  {t("res.sent.text")}
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-extrabold tracking-tight uppercase">
                  {t("res.form.title")}
                </h2>
                <p className="mt-2 font-mono text-[13px] text-muted-foreground">
                  {t("res.form.subtitle")}
                </p>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-6 grid gap-4 sm:grid-cols-2"
                >
                  <Field label={t("res.form.name")} error={form.formState.errors.fullName?.message}>
                    <input
                      {...form.register("fullName")}
                      className={inputClass}
                      placeholder="Amine Belkacem"
                    />
                  </Field>
                  <Field label={t("res.form.company")} error={form.formState.errors.company?.message}>
                    <input
                      {...form.register("company")}
                      className={inputClass}
                      placeholder={t("res.form.optional")}
                    />
                  </Field>
                  <Field label={t("res.form.phone")} error={form.formState.errors.phone?.message}>
                    <input
                      {...form.register("phone")}
                      className={inputClass}
                      placeholder="+213 ..."
                    />
                  </Field>
                  <Field label={t("res.form.email")} error={form.formState.errors.email?.message}>
                    <input
                      {...form.register("email")}
                      className={inputClass}
                      placeholder="you@company.dz"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field
                      label={t("res.form.details")}
                      error={form.formState.errors.projectDetails?.message}
                    >
                      <textarea
                        {...form.register("projectDetails")}
                        rows={4}
                        className={inputClass}
                        placeholder={t("res.form.detailsPlaceholder")}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="w-full border-[3px] border-foreground bg-foreground px-6 py-3.5 text-sm font-bold tracking-wide text-background uppercase transition-transform hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[6px_6px_0_0_var(--color-primary)] disabled:opacity-60"
                    >
                      {form.formState.isSubmitting ? t("res.form.sending") : t("res.form.submit")}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center justify-center gap-2 border-[3px] border-foreground bg-card px-6 py-3 text-sm font-bold uppercase"
            >
              <Share2 className="size-4" /> {t("res.share")}
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                navigate({ to: "/business" });
              }}
              className="border-[3px] border-foreground bg-card px-6 py-3 text-sm font-bold uppercase"
            >
              {t("res.new")}
            </button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

const inputClass =
  "w-full border-[3px] border-foreground bg-background px-4 py-3 font-mono text-sm outline-none placeholder:text-muted-foreground focus:shadow-[4px_4px_0_0_var(--color-primary)]";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-start">
      <span className="mb-2 block font-mono text-[10px] font-bold tracking-[0.2em] uppercase">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block font-mono text-xs text-destructive">{error}</span>}
    </label>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4 }}
      className="relative mt-6 border-[3px] border-foreground bg-card p-7"
    >
      <div className="flex items-center gap-3 border-b-[3px] border-foreground pb-3">
        <Icon className="size-4 text-primary" />
        <h2 className="text-lg font-extrabold tracking-tight uppercase">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}
