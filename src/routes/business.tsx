import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { Search } from "lucide-react";
import { BUSINESSES } from "@/lib/businesses";
import { useEstimateStore } from "@/store/estimate";
import { SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Choose your business type — WebCostDz" },
      { name: "description", content: "Pick from 40+ business types to get a tailored website cost estimate." },
      { property: "og:title", content: "Choose your business type — WebCostDz" },
      { property: "og:description", content: "Pick from 40+ business types to get a tailored website cost estimate." },
    ],
  }),
  component: BusinessSelection,
});

type IconName = keyof typeof Icons;

function BusinessIcon({ name }: { name: string }) {
  const Cmp = (Icons[name as IconName] ?? Icons.Shapes) as React.ComponentType<{ className?: string }>;
  return <Cmp className="size-5" />;
}

function BusinessSelection() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const selectBusiness = useEstimateStore((s) => s.selectBusiness);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BUSINESSES;
    return BUSINESSES.filter(
      (b) => b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.group.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-6xl px-5 pt-12 pb-24">
        <div className="glow-bg pointer-events-none absolute inset-x-0 top-0 h-80" />
        <div className="relative text-center">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Step 1 of 3</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">What is your business?</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            We tailor every question and every feature to your industry.
          </p>

          <div className="glass mx-auto mt-8 flex max-w-md items-center gap-3 rounded-full px-5 py-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 60))}
              placeholder="Search business type…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b, i) => (
            <motion.button
              key={b.slug}
              type="button"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 12) * 0.02 }}
              whileHover={{ y: -4 }}
              onClick={() => {
                selectBusiness(b.slug, b.name);
                navigate({ to: "/questions" });
              }}
              className="glass group rounded-3xl p-5 text-left transition-colors hover:border-primary/50"
            >
              <span className="brand-gradient inline-flex size-11 items-center justify-center rounded-2xl text-primary-foreground">
                <BusinessIcon name={b.icon} />
              </span>
              <h2 className="mt-4 text-base font-semibold">{b.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
              <p className="mt-3 text-[11px] font-medium tracking-wide text-primary uppercase">{b.group}</p>
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="relative mt-16 text-center text-sm text-muted-foreground">
            No match. Try another word, or pick “Custom Business”.
          </p>
        )}
      </main>
    </div>
  );
}
