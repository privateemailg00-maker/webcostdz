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

const leadSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  company: z.string().trim().max(120).optional(),
  phone: z.string().trim().min(6, "Please enter a valid phone number").max(30),
  email: z.string().trim().email("Please enter a valid email").max(255),
  projectDetails: z.string().trim().max(2000).optional(),
});

type LeadValues = z.infer<typeof leadSchema>;

function Results() {
  const navigate = useNavigate();
  const { result, leadSent, setLeadSent, reset } = useEstimateStore();
  const [hydrated, setHydrated] = useState(false);
  const sendLead = useServerFn(submitLead);

  const form = useForm<LeadValues>({
    resolver: zodResolver(leadSchema),
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
          Loading your estimate…
        </div>
      </div>
    );
  }

  const { pricing, analysis, addons, businessName } = result;

  const onSubmit = async (values: LeadValues) => {
    try {
      await sendLead({ data: { estimateId: result.id, ...values } });
      setLeadSent(true);
      toast.success("Request sent — we'll get back to you shortly.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your request.");
    }
  };

  const share = async () => {
    const text = `My ${businessName} website estimate: $${pricing.minimumPrice.toLocaleString()} – $${pricing.maximumPrice.toLocaleString()} over ${pricing.duration} (WebCostDz)`;
    try {
      if (navigator.share) await navigator.share({ title: "WebCostDz estimate", text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Estimate copied to clipboard");
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
            Estimate for {businessName}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Your project estimate</h1>
        </div>

        <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Wallet, label: "Estimated price", value: `$${pricing.minimumPrice.toLocaleString()} – $${pricing.maximumPrice.toLocaleString()}` },
            { icon: CalendarDays, label: "Estimated time", value: pricing.duration },
            { icon: Gauge, label: "Complexity", value: `${pricing.complexity} (${pricing.complexityScore} pts)` },
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

        <Section title="Project summary" icon={Sparkles}>
          <p className="text-sm leading-relaxed text-muted-foreground">{analysis.project_summary}</p>
        </Section>

        <Section title="Included features" icon={Layers}>
          <div className="flex flex-wrap gap-2">
            {pricing.features.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm"
              >
                <CheckCircle2 className="size-3.5 text-accent" />
                {f.label}
                <span className="text-xs text-muted-foreground">${f.price}</span>
              </span>
            ))}
          </div>
        </Section>

        {analysis.development_phases?.length > 0 && (
          <Section title="Development phases" icon={CalendarDays}>
            <ol className="relative space-y-6 border-l border-border pl-6">
              {analysis.development_phases.map((phase) => (
                <li key={phase.name} className="relative">
                  <span className="brand-gradient absolute -left-[31px] mt-1.5 size-3 rounded-full" />
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
          <Section title="Recommended tech stack" icon={Layers}>
            <div className="flex flex-wrap gap-2">
              {analysis.recommended_stack.map((tech) => (
                <span key={tech} className="rounded-full bg-muted px-4 py-2 text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </Section>
        )}

        <Section title="Optional extras" icon={Plus}>
          <div className="grid gap-3 sm:grid-cols-2">
            {addons.map((addon) => (
              <div
                key={addon.key}
                className="flex items-center justify-between rounded-2xl border border-border bg-card/50 px-5 py-4 text-sm"
              >
                <span>{addon.label}</span>
                <span className="font-semibold text-primary">+${addon.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
          {analysis.possible_future_features?.length > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              Future ideas: {analysis.possible_future_features.join(" · ")}
            </p>
          )}
        </Section>

        <div className="relative mt-12">
          <div className="glass rounded-[2rem] p-7 sm:p-9">
            {leadSent ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto size-10 text-accent" />
                <h2 className="mt-4 text-xl font-bold">Request received</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We saved your project scope and will contact you with an exact quote.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold tracking-tight">Request an exact quote</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Send your details and get a precise proposal based on this scope.
                </p>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" error={form.formState.errors.fullName?.message}>
                    <input {...form.register("fullName")} className={inputClass} placeholder="Amine Belkacem" />
                  </Field>
                  <Field label="Company" error={form.formState.errors.company?.message}>
                    <input {...form.register("company")} className={inputClass} placeholder="Optional" />
                  </Field>
                  <Field label="Phone" error={form.formState.errors.phone?.message}>
                    <input {...form.register("phone")} className={inputClass} placeholder="+213 ..." />
                  </Field>
                  <Field label="Email" error={form.formState.errors.email?.message}>
                    <input {...form.register("email")} className={inputClass} placeholder="you@company.dz" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Project details" error={form.formState.errors.projectDetails?.message}>
                      <textarea
                        {...form.register("projectDetails")}
                        rows={4}
                        className={inputClass}
                        placeholder="Anything else we should know?"
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="brand-gradient shadow-glow w-full rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      {form.formState.isSubmitting ? "Sending…" : "Request exact quote"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={share} className="glass inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium">
              <Share2 className="size-4" /> Share estimate
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                navigate({ to: "/business" });
              }}
              className="glass rounded-full px-6 py-3 text-sm font-medium"
            >
              Start a new estimate
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
    <label className="block text-left">
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
