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
    ],
  }),
  component: Landing,
});

const INK = "#101010";
const PAPER = "#EFEBE1";
const STAMP = "#FF3B1F";

const features = [
  {
    icon: Calculator,
    title: "Instant price range",
    text: "A realistic minimum and maximum, built from the features you actually need — not a guess.",
  },
  {
    icon: Timer,
    title: "Delivery timeline",
    text: "See how many days your project takes, from a landing page to an enterprise platform.",
  },
  {
    icon: ListChecks,
    title: "Feature breakdown",
    text: "Every included module, listed line by line, so you know exactly what you're paying for.",
  },
  {
    icon: Bot,
    title: "AI questionnaire",
    text: "Questions adapt to your business. A bakery is never asked about patient records.",
  },
  {
    icon: Layers,
    title: "Project roadmap",
    text: "Development phases and a recommended tech stack, generated for your scope.",
  },
  {
    icon: ShieldCheck,
    title: "Fixed pricing engine",
    text: "Prices come from a fixed rate table, never invented on the spot by the AI.",
  },
];

const steps = [
  {
    n: "01",
    title: "Pick your business",
    text: "Choose from 40+ business types, or describe a custom one.",
  },
  {
    n: "02",
    title: "Answer the questions",
    text: "8 to 15 simple multiple-choice questions, one at a time.",
  },
  {
    n: "03",
    title: "Get your estimate",
    text: "Price, duration, complexity, features — the full breakdown.",
  },
];

const faqs = [
  {
    q: "How accurate is the estimate?",
    a: "The range comes from a fixed feature-based pricing engine used on real projects. It's an informed budget range, not a signed contract.",
  },
  {
    q: "Do I need to talk to a developer?",
    a: "No. The whole estimate runs on its own. If you want an exact quote, you can send your details at the end.",
  },
  {
    q: "Is my data stored?",
    a: "Your answers and estimate are saved so we can prepare a precise proposal if you request one.",
  },
  {
    q: "Which currency is used?",
    a: "Prices are shown in US dollars, the standard reference for web development budgets.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER, color: INK }}>
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b-[3px]" style={{ borderColor: INK }}>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #101010 0, #101010 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, #101010 0, #101010 1px, transparent 1px, transparent 28px)",
            }}
          />

          <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 pt-16 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-24 lg:pb-28">
            <div>
              <div
                className="inline-flex items-center gap-2 border-[3px] px-3 py-1 font-mono text-[11px] font-bold tracking-[0.15em] uppercase"
                style={{ borderColor: INK, backgroundColor: "#fff" }}
              >
                <Receipt className="size-3.5" style={{ color: STAMP }} />
                No sales call. No guessing.
              </div>

              <h1 className="mt-6 text-[2.6rem] leading-[1.02] font-extrabold tracking-tight uppercase sm:text-6xl lg:text-[4.2rem]">
                What does your
                <br />
                website{" "}
                <span className="relative inline-block">
                  actually
                  <span
                    className="absolute right-0 -bottom-1 left-0 h-3 -z-10 sm:-bottom-2 sm:h-5"
                    style={{ backgroundColor: STAMP, opacity: 0.9 }}
                  />
                </span>
                <br />
                cost?
              </h1>

              <p
                className="mt-6 max-w-md font-mono text-sm leading-relaxed sm:text-base"
                style={{ opacity: 0.75 }}
              >
                Answer a few plain questions. Get a real price range, a delivery timeline and a full
                feature breakdown — printed out like an estimate, not a quote someone made up.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  to="/onboarding"
                  className="group inline-flex items-center justify-center gap-2 border-[3px] px-7 py-3.5 text-sm font-bold tracking-wide uppercase transition-transform hover:-translate-x-[3px] hover:-translate-y-[3px]"
                  style={{
                    borderColor: INK,
                    backgroundColor: INK,
                    color: PAPER,
                    boxShadow: `6px 6px 0 0 ${STAMP}`,
                  }}
                >
                  Start estimation
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-1 border-b-[3px] px-1 pb-1 text-sm font-bold tracking-wide uppercase"
                  style={{ borderColor: INK }}
                >
                  How it works
                  <ArrowUpRight className="size-4" />
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
              <div
                className="relative border-[3px] bg-white p-6"
                style={{ borderColor: INK, boxShadow: `10px 10px 0 0 ${INK}` }}
              >
                <div
                  className="absolute -top-4 -right-4 flex size-20 rotate-12 items-center justify-center rounded-full border-[3px] text-center font-mono text-[10px] leading-tight font-black tracking-widest uppercase"
                  style={{ borderColor: STAMP, color: STAMP, backgroundColor: "#fff" }}
                >
                  Estimate
                  <br />
                  ready
                </div>

                <div
                  className="flex items-center justify-between font-mono text-[11px] tracking-widest uppercase"
                  style={{ opacity: 0.55 }}
                >
                  <span>Estimate No. 00452</span>
                  <span>WebCostDz</span>
                </div>

                <div
                  className="mt-4 border-t-[3px] border-dashed pt-4"
                  style={{ borderColor: INK }}
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span style={{ opacity: 0.6 }}>Business</span>
                    <span className="font-bold">Bakery / Café</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-xs">
                    <span style={{ opacity: 0.6 }}>Pages</span>
                    <span className="font-bold">6</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-xs">
                    <span style={{ opacity: 0.6 }}>Features</span>
                    <span className="font-bold text-right">Online orders, gallery</span>
                  </div>
                </div>

                <div className="mt-5 border-t-[3px] pt-5" style={{ borderColor: INK }}>
                  <p
                    className="font-mono text-[11px] tracking-widest uppercase"
                    style={{ opacity: 0.55 }}
                  >
                    Estimated total
                  </p>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight">$1,400–$1,700</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="border-[3px] p-3" style={{ borderColor: INK }}>
                      <p
                        className="font-mono text-[10px] tracking-widest uppercase"
                        style={{ opacity: 0.55 }}
                      >
                        Timeline
                      </p>
                      <p className="mt-1 font-bold">22 days</p>
                    </div>
                    <div
                      className="border-[3px] p-3"
                      style={{ borderColor: INK, backgroundColor: STAMP, color: "#fff" }}
                    >
                      <p
                        className="font-mono text-[10px] tracking-widest uppercase"
                        style={{ opacity: 0.85 }}
                      >
                        Complexity
                      </p>
                      <p className="mt-1 font-bold">Medium</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mx-auto w-full max-w-6xl px-5 py-20">
          <p
            className="font-mono text-xs font-bold tracking-[0.2em] uppercase"
            style={{ color: STAMP }}
          >
            What you get
          </p>
          <h2 className="mt-2 max-w-xl text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
            Everything you need to plan the budget
          </h2>

          <div
            className="mt-10 grid border-[3px] sm:grid-cols-2 lg:grid-cols-3"
            style={{ borderColor: INK }}
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="border-b-[3px] p-6 sm:border-r-[3px] [&:nth-child(2)]:sm:border-r-0 lg:[&:nth-child(2)]:border-r-[3px] lg:[&:nth-child(3n)]:border-r-0"
                style={{ borderColor: INK }}
              >
                <f.icon className="size-6" style={{ color: STAMP }} />
                <h3 className="mt-4 text-base font-bold tracking-tight uppercase">{f.title}</h3>
                <p className="mt-2 font-mono text-[13px] leading-relaxed" style={{ opacity: 0.7 }}>
                  {f.text}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="border-y-[3px]"
          style={{ borderColor: INK, backgroundColor: INK, color: PAPER }}
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-20">
            <p
              className="font-mono text-xs font-bold tracking-[0.2em] uppercase"
              style={{ color: STAMP }}
            >
              The process
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
              How it works
            </h2>

            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="border-t-[3px] pt-5" style={{ borderColor: STAMP }}>
                  <span
                    className="font-mono text-sm font-bold tracking-widest"
                    style={{ color: STAMP }}
                  >
                    {s.n}
                  </span>
                  <h3 className="mt-3 text-lg font-bold tracking-tight uppercase">{s.title}</h3>
                  <p
                    className="mt-2 font-mono text-[13px] leading-relaxed"
                    style={{ opacity: 0.65 }}
                  >
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-3xl px-5 py-20">
          <p
            className="font-mono text-xs font-bold tracking-[0.2em] uppercase"
            style={{ color: STAMP }}
          >
            Questions
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
            Frequently asked
          </h2>

          <div className="mt-8 border-[3px]" style={{ borderColor: INK }}>
            {faqs.map((f, i) => (
              <details
                key={f.q}
                className="group"
                style={{ borderTop: i === 0 ? "none" : `3px solid ${INK}` }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold tracking-tight uppercase">
                  {f.q}
                  <Plus
                    className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-45"
                    style={{ color: STAMP }}
                  />
                </summary>
                <p
                  className="px-5 pb-5 font-mono text-[13px] leading-relaxed"
                  style={{ opacity: 0.7 }}
                >
                  {f.a}
                </p>
              </details>
            ))}
          </div>

          <div
            className="mt-16 flex flex-col items-center border-[3px] p-10 text-center"
            style={{ borderColor: INK, boxShadow: `10px 10px 0 0 ${STAMP}` }}
          >
            <p
              className="font-mono text-xs font-bold tracking-[0.2em] uppercase"
              style={{ opacity: 0.55 }}
            >
              Two minutes. No signup required.
            </p>
            <h3 className="mt-3 max-w-sm text-2xl font-extrabold tracking-tight uppercase">
              Get your estimate now
            </h3>
            <Link
              to="/onboarding"
              className="mt-6 inline-flex items-center justify-center gap-2 border-[3px] px-8 py-4 text-sm font-bold tracking-wide uppercase transition-transform hover:-translate-x-[3px] hover:-translate-y-[3px]"
              style={{
                borderColor: INK,
                backgroundColor: INK,
                color: PAPER,
                boxShadow: `6px 6px 0 0 ${STAMP}`,
              }}
            >
              Start my estimation <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
