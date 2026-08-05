import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Receipt,
  Calculator,
  Timer,
  ListChecks,
  Bot,
  Layers,
  ShieldCheck,
  Plus,
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
        content:
          "Answer a few simple questions and get an instant website price range, timeline, complexity score and feature breakdown for your business in Algeria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const featureIcons = [Calculator, Timer, ListChecks, Bot, Layers, ShieldCheck];

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
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b-[3px] border-foreground">
          <div className="brut-grid pointer-events-none absolute inset-0" />

          <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 pt-16 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-24 lg:pb-28">
            <div>
              <div className="inline-flex items-center gap-2 border-[3px] border-foreground bg-card px-3 py-1 font-mono text-[11px] font-bold tracking-[0.15em] uppercase">
                <Receipt className="size-3.5 text-primary" />
                {t("home.badge")}
              </div>

              <h1 className="mt-6 text-[2.6rem] leading-[1.05] font-extrabold tracking-tight uppercase sm:text-6xl lg:text-[4rem]">
                {t("home.title.a")}{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">{t("home.title.b")}</span>
                  <span className="absolute right-0 -bottom-1 left-0 h-3 bg-primary opacity-90 sm:-bottom-2 sm:h-5" />
                </span>
              </h1>

              <p className="mt-6 max-w-md font-mono text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t("home.subtitle")}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  to="/business"
                  className="brut-shadow-stamp group inline-flex items-center justify-center gap-2 border-[3px] border-foreground bg-foreground px-7 py-3.5 text-sm font-bold tracking-wide text-background uppercase transition-transform hover:-translate-x-[3px] hover:-translate-y-[3px]"
                >
                  {t("home.cta.primary")}
                  <ArrowRight className="rtl-flip size-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-1 border-b-[3px] border-foreground px-1 pb-1 text-sm font-bold tracking-wide uppercase"
                >
                  {t("home.cta.secondary")}
                  <ArrowUpRight className="rtl-flip size-4" />
                </a>
              </div>
            </div>

            {/* SIGNATURE ELEMENT: the estimate ticket */}
            <motion.div
              initial={{ opacity: 0, rotate: -6, y: 20 }}
              animate={{ opacity: 1, rotate: -3, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative mx-auto w-full max-w-sm"
            >
              <div className="brut-shadow relative border-[3px] border-foreground bg-card p-6">
                <div className="absolute -top-4 -right-4 flex size-20 rotate-12 items-center justify-center rounded-full border-[3px] border-primary bg-card text-center font-mono text-[10px] leading-tight font-black tracking-widest text-primary uppercase">
                  {t("home.stat.price")}
                </div>

                <div className="flex items-center justify-between font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                  <span>№ 00452</span>
                  <span>WebCostDz</span>
                </div>

                <div className="mt-4 border-t-[3px] border-dashed border-foreground pt-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-muted-foreground">Business</span>
                    <span className="font-bold">Bakery / Café</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-xs">
                    <span className="text-muted-foreground">Pages</span>
                    <span className="font-bold">6</span>
                  </div>
                </div>

                <div className="mt-5 border-t-[3px] border-foreground pt-5">
                  <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                    {t("home.stat.price")}
                  </p>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight">1,400–1,700 DZD</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="border-[3px] border-foreground p-3">
                      <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                        {t("home.stat.time")}
                      </p>
                      <p className="mt-1 font-bold">{t("home.stat.time.value")}</p>
                    </div>
                    <div className="border-[3px] border-foreground bg-primary p-3 text-primary-foreground">
                      <p className="font-mono text-[10px] tracking-widest uppercase opacity-85">
                        {t("home.stat.complexity")}
                      </p>
                      <p className="mt-1 font-bold">{t("home.stat.complexity.value")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mx-auto w-full max-w-6xl px-5 py-20">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-primary uppercase">
            {t("home.features.subtitle")}
          </p>
          <h2 className="mt-2 max-w-xl text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
            {t("home.features.title")}
          </h2>

          <div className="mt-10 grid border-[3px] border-foreground sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="border-b-[3px] border-foreground p-6 sm:border-r-[3px] [&:nth-child(2)]:sm:border-r-0 lg:[&:nth-child(2)]:border-r-[3px] lg:[&:nth-child(3n)]:border-r-0"
              >
                <f.icon className="size-6 text-primary" />
                <h3 className="mt-4 text-base font-bold tracking-tight uppercase">{f.title}</h3>
                <p className="mt-2 font-mono text-[13px] leading-relaxed text-muted-foreground">
                  {f.text}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="border-y-[3px] border-foreground bg-foreground text-background"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-20">
            <p className="font-mono text-xs font-bold tracking-[0.2em] text-primary uppercase">
              01 — 02 — 03
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
              {t("home.how.title")}
            </h2>

            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="border-t-[3px] border-primary pt-5">
                  <span className="font-mono text-sm font-bold tracking-widest text-primary">
                    {s.n}
                  </span>
                  <h3 className="mt-3 text-lg font-bold tracking-tight uppercase">{s.title}</h3>
                  <p className="mt-2 font-mono text-[13px] leading-relaxed opacity-70">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-3xl px-5 py-20">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-primary uppercase">FAQ</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
            {t("home.faq.title")}
          </h2>

          <div className="mt-8 border-[3px] border-foreground bg-card">
            {faqs.map((f, i) => (
              <details
                key={f.q}
                className={`group ${i === 0 ? "" : "border-t-[3px] border-foreground"}`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold tracking-tight uppercase">
                  {f.q}
                  <Plus className="size-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-45" />
                </summary>
                <p className="px-5 pb-5 font-mono text-[13px] leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              </details>
            ))}
          </div>

          <div className="brut-shadow-stamp mt-16 flex flex-col items-center border-[3px] border-foreground bg-card p-10 text-center">
            <p className="font-mono text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
              {t("home.badge")}
            </p>
            <h3 className="mt-3 max-w-sm text-2xl font-extrabold tracking-tight uppercase">
              {t("home.cta.final")}
            </h3>
            <Link
              to="/business"
              className="brut-shadow-stamp mt-6 inline-flex items-center justify-center gap-2 border-[3px] border-foreground bg-foreground px-8 py-4 text-sm font-bold tracking-wide text-background uppercase transition-transform hover:-translate-x-[3px] hover:-translate-y-[3px]"
            >
              {t("home.cta.primary")} <ArrowRight className="rtl-flip size-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
