import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, Gauge, Layers, Plus, Share2, Sparkles, Wallet } from "lucide-react";
import { submitLead } from "@/lib/estimate.functions";
import { useEstimateStore } from "@/store/estimate";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useI18n } from "@/lib/i18n";
import { localizeFeature } from "@/lib/i18n/content";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your website estimate — WebCostDz" },
      { name: "description", content: "Your estimated website price, timeline, complexity and project roadmap." },
      { property: "og:title", content: "Your website estimate — WebCostDz" },
      { property: "og:description", content: "Your estimated website price, timeline, complexity and project roadmap." },
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
  const { result, leadSent, setLeadSent, reset } = useEstimateStore();
  const [hydrated, setHydrated] = useState(false);
  const sendLead = useServerFn(submitLead);
  const { t, lang } = useI18n();

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
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-md px-5 py-32 text-center text-sm text-muted-foreground">
          {t("res.loading")}
        </div>
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
      min: `$${pricing.minimumPrice.toLocaleString()}`,
      max: `$${pricing.maximumPrice.toLocaleString()}`,
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
    <div className="min-h-screen">
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-5xl px-5 pt-12 pb-24">
        <div className="glow-bg pointer-events-none absolute inset-x-0 top-0 h-80" />

        <div className="relative text-center">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {t("res.for", { business: businessName })}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t("res.title")}</h1>
        </div>

        <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Wallet, label: t("res.price"), value: `$${pricing.minimumPrice.toLocaleString()} – $${pricing.maximumPrice.toLocaleString()}` },
            { icon: CalendarDays, label: t("res.time"), value: durationLabel },
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
              className="glass rounded-3xl p-6"
            >
              <span className="brand-gradient inline-flex size-10 items-center justify-center rounded-2xl text-primary-foreground">
                <card.icon className="size-5" />
              </span>
              <p className="mt-4 text-xs tracking-wide text-muted-foreground uppercase">{card.label}</p>
              <p className="mt-1 text-xl font-bold">{card.value}</p>
            </motion.div>
          ))}
        </div>

        <Section title={t("res.summary")} icon={Sparkles}>
          <p className="text-sm leading-relaxed text-muted-foreground">{analysis.project_summary}</p>
        </Section>

        <Section title={t("res.features")} icon={Layers}>
          <div className="flex flex-wrap gap-2">
            {pricing.features.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm"
              >
                <CheckCircle2 className="size-3.5 text-accent" />
                {localizeFeature(lang, f.key, f.label)}
                <span className="text-xs text-muted-foreground">${f.price}</span>
              </span>
            ))}
          </div>
        </Section>

        {analysis.development_phases?.length > 0 && (
          <Section title={t("res.phases")} icon={CalendarDays}>
            <ol className="relative space-y-6 border-s border-border ps-6">
              {analysis.development_phases.map((phase) => (
                <li key={phase.name} className="relative">
                  <span className="brand-gradient absolute -start-[31px] mt-1.5 size-3 rounded-full" />
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-sm font-semibold">{phase.name}</h3>
                    <span className="text-xs text-muted-foreground">{phase.duration}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{phase.description}</p>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {analysis.recommended_stack?.length > 0 && (
          <Section title={t("res.stack")} icon={Layers}>
            <div className="flex flex-wrap gap-2">
              {analysis.recommended_stack.map((tech) => (
                <span key={tech} className="rounded-full bg-muted px-4 py-2 text-sm">
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
                className="flex items-center justify-between rounded-2xl border border-border bg-card/50 px-5 py-4 text-sm"
              >
                <span>{localizeFeature(lang, addon.key, addon.label)}</span>
                <span className="font-semibold text-primary">+${addon.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
          {analysis.possible_future_features?.length > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              {t("res.future")} {analysis.possible_future_features.join(" · ")}
            </p>
          )}
        </Section>

        <div className="relative mt-12">
          <div className="glass rounded-[2rem] p-7 sm:p-9">
            {leadSent ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto size-10 text-accent" />
                <h2 className="mt-4 text-xl font-bold">{t("res.sent.title")}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("res.sent.text")}
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold tracking-tight">{t("res.form.title")}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("res.form.subtitle")}
                </p>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label={t("res.form.name")} error={form.formState.errors.fullName?.message}>
                    <input {...form.register("fullName")} className={inputClass} placeholder="Amine Belkacem" />
                  </Field>
                  <Field label={t("res.form.company")} error={form.formState.errors.company?.message}>
                    <input {...form.register("company")} className={inputClass} placeholder={t("res.form.optional")} />
                  </Field>
                  <Field label={t("res.form.phone")} error={form.formState.errors.phone?.message}>
                    <input {...form.register("phone")} className={inputClass} placeholder="+213 ..." />
                  </Field>
                  <Field label={t("res.form.email")} error={form.formState.errors.email?.message}>
                    <input {...form.register("email")} className={inputClass} placeholder="you@company.dz" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label={t("res.form.details")} error={form.formState.errors.projectDetails?.message}>
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
                      className="brand-gradient shadow-glow w-full rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      {form.formState.isSubmitting ? t("res.form.sending") : t("res.form.submit")}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={share} className="glass inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium">
              <Share2 className="size-4" /> {t("res.share")}
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                navigate({ to: "/business" });
              }}
              className="glass rounded-full px-6 py-3 text-sm font-medium"
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
  "w-full rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-start">
      <span className="mb-2 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
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
      className="glass relative mt-6 rounded-[2rem] p-7"
    >
      <div className="flex items-center gap-3">
        <Icon className="size-4 text-primary" />
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}
