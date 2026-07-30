import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Sparkles,
  Timer,
  Wallet,
  ListChecks,
  ShieldCheck,
  Layers,
  Bot,
  ChevronDown,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WebCostDz — Know your website cost in 2 minutes" },
      {
        name: "description",
        content:
          "Answer a few simple questions and get an instant website price range, timeline, complexity score and feature breakdown for your business in Algeria.",
      },
      { property: "og:title", content: "WebCostDz — Know your website cost in 2 minutes" },
      {
        property: "og:description",
        content: "Answer a few simple questions and get an instant website price range, timeline, complexity score and feature breakdown for your business in Algeria.",
      },
    ],
  }),
  component: Landing,
});

const featureIcons = [Wallet, Timer, ListChecks, Bot, Layers, ShieldCheck];

function Landing() {
  const { t } = useI18n();

  const features = featureIcons.map((icon, i) => ({
    icon,
    title: t(`home.f${i + 1}.title`),
    text: t(`home.f${i + 1}.text`),
  }));
  const steps = [1, 2, 3].map((n) => ({
    n: `0${n}`,
    title: t(`home.s${n}.title`),
    text: t(`home.s${n}.text`),
  }));
  const faqs = [1, 2, 3, 4].map((n) => ({ q: t(`home.q${n}`), a: t(`home.a${n}`) }));

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <div className="glow-bg pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
          <div className="relative mx-auto w-full max-w-6xl px-5 pt-20 pb-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <Sparkles className="size-3.5 text-accent" />
              {t("home.badge")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mx-auto mt-7 max-w-3xl text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-6xl"
            >
              {t("home.title.a")} <span className="gradient-text">{t("home.title.b")}</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
            >
              {t("home.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link
                to="/onboarding"
                className="brand-gradient shadow-glow inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                {t("home.cta.primary")} <ArrowRight className="rtl-flip size-4" />
              </Link>
              <a
                href="#how-it-works"
                className="glass inline-flex w-full items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold transition-colors hover:text-primary sm:w-auto"
              >
                {t("home.cta.secondary")}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="glass mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-4 rounded-3xl p-6 sm:grid-cols-3"
            >
              {[
                { label: t("home.stat.price"), value: "$1,400 – $1,700" },
                { label: t("home.stat.time"), value: t("home.stat.time.value") },
                { label: t("home.stat.complexity"), value: t("home.stat.complexity.value") },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-muted/50 p-5 text-start">
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">{item.label}</p>
                  <p className="mt-2 text-xl font-bold">{item.value}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t("home.features.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">{t("home.features.subtitle")}</p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="glass rounded-3xl p-6"
              >
                <span className="brand-gradient inline-flex size-11 items-center justify-center rounded-2xl text-primary-foreground">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto w-full max-w-6xl px-5 py-20">
          <div className="glass overflow-hidden rounded-[2rem] p-8 sm:p-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("home.how.title")}</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="relative">
                  <span className="gradient-text text-4xl font-extrabold">{s.n}</span>
                  <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-3xl px-5 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t("home.faq.title")}</h2>
          <div className="mt-10 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="glass group rounded-2xl p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                  {f.q}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              to="/onboarding"
              className="brand-gradient shadow-glow inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              {t("home.cta.final")} <ArrowRight className="rtl-flip size-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
