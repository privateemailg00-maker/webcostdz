import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { Search } from "lucide-react";
import { BUSINESSES } from "@/lib/businesses";
import { useEstimateStore } from "@/store/estimate";
import { SiteHeader } from "@/components/site-chrome";
import { useI18n } from "@/lib/i18n";
import { localizeBusiness } from "@/lib/i18n/content";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Choose your business type — WebCostDz" },
      {
        name: "description",
        content: "Pick from 40+ business types to get a tailored website cost estimate.",
      },
      { property: "og:title", content: "Choose your business type — WebCostDz" },
      {
        property: "og:description",
        content: "Pick from 40+ business types to get a tailored website cost estimate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BusinessSelection,
});

type IconName = keyof typeof Icons;

function BusinessIcon({ name }: { name: string }) {
  const Cmp = (Icons[name as IconName] ?? Icons.Shapes) as React.ComponentType<{
    className?: string;
  }>;
  return <Cmp className="size-5" />;
}

function BusinessSelection() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const selectBusiness = useEstimateStore((s) => s.selectBusiness);
  const { t, lang } = useI18n();

  const localized = useMemo(
    () => BUSINESSES.map((b) => ({ ...b, ...localizeBusiness(lang, b), englishName: b.name })),
    [lang],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return localized;
    return localized.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.englishName.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.group.toLowerCase().includes(q),
    );
  }, [query, localized]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-6xl px-5 pt-12 pb-24">
        <div className="text-center">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-primary uppercase">
            {t("biz.step")}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
            {t("biz.title")}
          </h1>
          <p className="mx-auto mt-3 max-w-lg font-mono text-[13px] text-muted-foreground">
            {t("biz.subtitle")}
          </p>

          <div className="brut-shadow mx-auto mt-8 flex max-w-md items-center gap-3 border-[3px] border-foreground bg-card px-5 py-3">
            <Search className="size-4 shrink-0 text-primary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 60))}
              placeholder={t("biz.search")}
              className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b, i) => (
            <motion.button
              key={b.slug}
              type="button"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 12) * 0.02 }}
              onClick={() => {
                selectBusiness(b.slug, b.name);
                navigate({ to: "/questions" });
              }}
              className="group border-[3px] border-foreground bg-card p-5 text-start transition-transform hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[6px_6px_0_0_var(--color-primary)]"
            >
              <span className="inline-flex size-11 items-center justify-center border-[3px] border-foreground bg-foreground text-background group-hover:bg-primary group-hover:text-primary-foreground">
                <BusinessIcon name={b.icon} />
              </span>
              <h2 className="mt-4 text-base font-bold tracking-tight uppercase">{b.name}</h2>
              <p className="mt-1 font-mono text-[12px] leading-relaxed text-muted-foreground">
                {b.description}
              </p>
              <p className="mt-3 font-mono text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
                {b.group}
              </p>
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-16 text-center font-mono text-sm text-muted-foreground">
            {t("biz.empty")}
          </p>
        )}
      </main>
    </div>
  );
}
