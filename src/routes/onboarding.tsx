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
      { name: "description", content: "A quick three-step introduction before estimating your website cost." },
      { property: "og:title", content: "Get started — WebCostDz" },
      { property: "og:description", content: "A quick three-step introduction before estimating your website cost." },
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
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="glow-bg pointer-events-none absolute inset-x-0 top-0 h-[520px]" />

      <div className="relative flex items-center justify-between px-5 py-5">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("onb.back")}
        </button>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <main className="relative flex flex-1 items-center justify-center px-5 pb-16">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 40 * sign }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 * sign }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="glass rounded-[2rem] p-8 text-center"
            >
              <span className="brand-gradient shadow-glow mx-auto inline-flex size-16 items-center justify-center rounded-3xl text-primary-foreground">
                <screen.icon className="size-7" />
              </span>
              <h1 className="mt-7 text-2xl font-bold tracking-tight">{screen.title}</h1>
              <p className="mt-3 text-sm text-muted-foreground">{screen.text}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center gap-2">
            {screens.map((s, i) => (
              <span
                key={s.title}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "brand-gradient w-8" : "w-2 bg-border"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            className="brand-gradient shadow-glow mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
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
              className="mt-4 w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("onb.skip")}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
