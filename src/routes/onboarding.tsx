import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Compass, Rocket, Sparkles } from "lucide-react";
import { useEstimateStore } from "@/store/estimate";
import { LanguageSwitcher, ThemeToggle } from "@/components/site-chrome";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — WebCostDz" },
      {
        name: "description",
        content: "A quick three-step introduction before estimating your website cost.",
      },
      { property: "og:title", content: "Get started — WebCostDz" },
      {
        property: "og:description",
        content: "A quick three-step introduction before estimating your website cost.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const icons = [Sparkles, Compass, Rocket];

function Onboarding() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const setOnboarded = useEstimateStore((s) => s.setOnboarded);
  const { t, dir } = useI18n();
  const sign = dir === "rtl" ? -1 : 1;

  const screens = icons.map((icon, i) => ({
    icon,
    title: t(`onb.${i + 1}.title`),
    text: t(`onb.${i + 1}.text`),
    cta: i === icons.length - 1 ? t("onb.start") : t("onb.continue"),
  }));
  const screen = screens[index];

  const next = () => {
    if (index < screens.length - 1) {
      setIndex(index + 1);
      return;
    }
    setOnboarded();
    navigate({ to: "/business" });
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="brut-grid pointer-events-none absolute inset-0" />

      <div className="relative flex items-center justify-between border-b-[3px] border-foreground px-5 py-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="border-b-[3px] border-foreground pb-0.5 font-mono text-xs font-bold tracking-widest uppercase"
        >
          {t("onb.back")}
        </button>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <main className="relative flex flex-1 items-center justify-center px-5 py-14">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 40 * sign }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 * sign }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="brut-shadow border-[3px] border-foreground bg-card p-8 text-center"
            >
              <span className="mx-auto inline-flex size-16 items-center justify-center border-[3px] border-foreground bg-primary text-primary-foreground">
                <screen.icon className="size-7" />
              </span>
              <h1 className="mt-7 text-2xl font-extrabold tracking-tight uppercase">
                {screen.title}
              </h1>
              <p className="mt-3 font-mono text-[13px] leading-relaxed text-muted-foreground">
                {screen.text}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center gap-2">
            {screens.map((s, i) => (
              <span
                key={s.title}
                className={`h-2 border-[3px] border-foreground transition-all ${
                  i === index ? "w-10 bg-primary" : "w-4 bg-transparent"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            className="brut-shadow-stamp mt-8 inline-flex w-full items-center justify-center gap-2 border-[3px] border-foreground bg-foreground px-6 py-3.5 text-sm font-bold tracking-wide text-background uppercase transition-transform hover:-translate-x-[3px] hover:-translate-y-[3px]"
          >
            {screen.cta} <ArrowRight className="rtl-flip size-4" />
          </button>

          {index < screens.length - 1 && (
            <button
              type="button"
              onClick={() => {
                setOnboarded();
                navigate({ to: "/business" });
              }}
              className="mt-5 w-full text-center font-mono text-[11px] font-bold tracking-widest text-muted-foreground uppercase"
            >
              {t("onb.skip")}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
