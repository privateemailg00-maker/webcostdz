import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Moon, Sun, Gauge, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANGS, useI18n } from "@/lib/i18n";

export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("webcostdz-theme");
    const isDark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
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
        "inline-flex size-10 items-center justify-center border-[3px] border-foreground bg-card text-foreground transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_0_var(--color-primary)]",
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
        className="inline-flex h-10 items-center gap-2 border-[3px] border-foreground bg-card px-3 font-mono text-xs font-bold tracking-widest uppercase transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_0_var(--color-primary)]"
      >
        <Languages className="size-4" />
        <span>{active.native}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 w-36 border-[3px] border-foreground bg-popover shadow-[6px_6px_0_0_var(--color-foreground)]"
        >
          {LANGS.map((l) => (
            <li key={l.code} className="border-b-[3px] border-foreground last:border-b-0">
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-start text-sm font-bold uppercase transition-colors hover:bg-primary hover:text-primary-foreground",
                  l.code === lang ? "bg-foreground text-background" : "text-foreground",
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
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const taps = useRef({ count: 0, at: 0 });

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname !== "/") return;
    const now = Date.now();
    taps.current.count = now - taps.current.at > 1200 ? 1 : taps.current.count + 1;
    taps.current.at = now;
    if (taps.current.count >= 5) {
      e.preventDefault();
      taps.current.count = 0;
      navigate({ to: "/admin" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-[3px] border-foreground bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2.5">
          <span className="inline-flex size-9 items-center justify-center border-[3px] border-foreground bg-foreground text-background">
            <Gauge className="size-4" />
          </span>
          <span className="font-mono text-base font-bold tracking-tight uppercase">
            WebCost<span className="text-primary">Dz</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            to="/onboarding"
            className="hidden items-center border-[3px] border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold tracking-widest text-background uppercase transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_0_var(--color-primary)] sm:inline-flex"
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
    <footer className="border-t-[3px] border-foreground bg-foreground py-10 text-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 font-mono text-xs tracking-widest uppercase sm:flex-row">
        <p>
          © {new Date().getFullYear()} {t("footer.rights")}
        </p>
        <div className="flex gap-5">
          <Link to="/onboarding" className="border-b-[3px] border-primary pb-0.5">
            {t("footer.estimate")}
          </Link>
          <a href="mailto:hello@webcostdz.com" className="border-b-[3px] border-primary pb-0.5">
            {t("footer.contact")}
          </a>
        </div>
      </div>
    </footer>
  );
}
