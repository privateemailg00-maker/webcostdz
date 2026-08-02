import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock, Plus, Save, Trash2 } from "lucide-react";
import {
  adminListPrices,
  adminLogin,
  adminLogout,
  adminStatus,
  type AdminPriceRow,
} from "@/lib/admin.functions";
import { SiteHeader } from "@/components/site-chrome";
import { useI18n } from "@/lib/i18n";
import { localizeFeature } from "@/lib/i18n/content";
import {
  adminCreatePrice,
  adminDeletePrice,
  adminUpdatePrices,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Price admin — WebCostDz" },
      { name: "description", content: "Private dashboard to edit WebCostDz feature prices in DZD." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Price admin — WebCostDz" },
      {
        property: "og:description",
        content: "Private dashboard to edit WebCostDz feature prices in DZD.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const input =
  "w-full border-[3px] border-foreground bg-background px-3 py-2 font-mono text-sm outline-none focus:shadow-[4px_4px_0_0_var(--color-primary)]";

function AdminPage() {
  const { t, lang } = useI18n();
  const status = useServerFn(adminStatus);
  const login = useServerFn(adminLogin);
  const logout = useServerFn(adminLogout);
  const list = useServerFn(adminListPrices);
  const save = useServerFn(adminUpdatePrices);

  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<AdminPriceRow[]>([]);
  const [busy, setBusy] = useState(false);

  const loadRows = async () => {
    const res = await list({});
    setRows(res.rows);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await status({});
        setAuthed(res.admin);
        if (res.admin) await loadRows();
      } finally {
        setChecking(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await login({ data: { password } });
      if (!res.ok) {
        toast.error(res.reason === "unconfigured" ? t("admin.unconfigured") : t("admin.invalid"));
        return;
      }
      setAuthed(true);
      setPassword("");
      await loadRows();
    } finally {
      setBusy(false);
    }
  };

  const doSave = async () => {
    setBusy(true);
    try {
      await save({
        data: {
          rows: rows.map((r) => ({
            key: r.key,
            label: r.label,
            price: r.price,
            days: r.days,
            weight: r.weight,
          })),
        },
      });
      toast.success(t("admin.saved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  const patch = (key: string, field: keyof AdminPriceRow, value: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.key === key
          ? { ...r, [field]: field === "label" ? value : Math.max(0, Number(value) || 0) }
          : r,
      ),
    );

  if (checking) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <div className="flex justify-center py-32">
          <Loader2 className="size-7 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main className="mx-auto max-w-md px-5 py-24">
          <form onSubmit={doLogin} className="brut-shadow border-[3px] border-foreground bg-card p-7">
            <span className="inline-flex size-10 items-center justify-center border-[3px] border-foreground bg-primary text-primary-foreground">
              <Lock className="size-5" />
            </span>
            <h1 className="mt-4 text-xl font-extrabold uppercase">{t("admin.login")}</h1>
            <label className="mt-6 block">
              <span className="mb-2 block font-mono text-[10px] font-bold tracking-[0.2em] uppercase">
                {t("admin.password")}
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={input}
              />
            </label>
            <button
              type="submit"
              disabled={busy || !password}
              className="brut-shadow-stamp mt-6 w-full border-[3px] border-foreground bg-foreground px-6 py-3 text-sm font-bold text-background uppercase disabled:opacity-50"
            >
              {t("admin.enter")}
            </button>
          </form>
        </main>
      </div>
    );
  }

  const groups: { kind: string; label: string }[] = [
    { kind: "feature", label: t("admin.kind.feature") },
    { kind: "backend", label: t("admin.kind.backend") },
    { kind: "addon", label: t("admin.kind.addon") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-5 pt-12 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight uppercase">{t("admin.title")}</h1>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={async () => {
                await logout({});
                setAuthed(false);
                setRows([]);
              }}
              className="border-[3px] border-foreground bg-card px-4 py-2 text-xs font-bold uppercase"
            >
              {t("admin.logout")}
            </button>
            <button
              type="button"
              onClick={doSave}
              disabled={busy}
              className="brut-shadow-stamp inline-flex items-center gap-2 border-[3px] border-foreground bg-foreground px-5 py-2 text-xs font-bold text-background uppercase disabled:opacity-50"
            >
              <Save className="size-4" /> {t("admin.save")}
            </button>
          </div>
        </div>

        {groups.map((group) => {
          const groupRows = rows.filter((r) => r.kind === group.kind);
          if (!groupRows.length) return null;
          return (
            <section key={group.kind} className="mt-8 border-[3px] border-foreground bg-card">
              <h2 className="border-b-[3px] border-foreground px-5 py-3 font-mono text-xs font-bold tracking-[0.2em] uppercase">
                {group.label}
              </h2>
              <div className="divide-y-[3px] divide-foreground">
                {groupRows.map((row) => (
                  <div
                    key={row.key}
                    className="grid items-end gap-3 p-4 sm:grid-cols-[1.6fr_1fr_0.6fr_0.6fr]"
                  >
                    <label className="block">
                      <span className="mb-1 block font-mono text-[10px] tracking-widest uppercase">
                        {localizeFeature(lang, row.key, row.label)}
                      </span>
                      <input
                        value={row.label}
                        onChange={(e) => patch(row.key, "label", e.target.value)}
                        className={input}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block font-mono text-[10px] tracking-widest uppercase">
                        {t("admin.price")}
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={row.price}
                        onChange={(e) => patch(row.key, "price", e.target.value)}
                        className={input}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block font-mono text-[10px] tracking-widest uppercase">
                        {t("admin.days")}
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={row.days}
                        onChange={(e) => patch(row.key, "days", e.target.value)}
                        className={input}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block font-mono text-[10px] tracking-widest uppercase">
                        {t("admin.weight")}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={row.weight}
                        onChange={(e) => patch(row.key, "weight", e.target.value)}
                        className={input}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
