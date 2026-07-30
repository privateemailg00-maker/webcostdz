import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Moon, Sun, Gauge, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANGS, useI18n } from "@/lib/i18n";

export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("webcostdz-theme");
    const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("webcostdz-theme", next ? "dark" : "light");
      return next;
    });
  };

  return { dark, toggle };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { dark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);

  const active = LANGS.find((l) => l.code === lang)!;

  return (
    <div className={cn("relative", className)} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("lang.label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card/60 px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Languages className="size-4" />
        <span>{active.native}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 w-36 overflow-hidden rounded-2xl border border-border bg-popover p-1 shadow-lg"
        >
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-muted",
                  l.code === lang ? "font-semibold text-primary" : "text-foreground",
                )}
              >
                {l.native}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SiteHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="brand-gradient inline-flex size-8 items-center justify-center rounded-xl text-primary-foreground">
            <Gauge className="size-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            WebCost<span className="gradient-text">Dz</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            to="/onboarding"
            className="brand-gradient hidden rounded-full px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            {t("nav.start")}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} {t("footer.rights")}</p>
        <div className="flex gap-5">
          <Link to="/onboarding" className="transition-colors hover:text-foreground">
            {t("footer.estimate")}
          </Link>
          <a href="mailto:hello@webcostdz.com" className="transition-colors hover:text-foreground">
            {t("footer.contact")}
          </a>
        </div>
      </div>
    </footer>
  );
}
