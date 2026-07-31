import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Moon, Sun, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "inline-flex size-10 items-center justify-center border-2 border-foreground bg-background text-foreground transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--foreground)]",
        className,
      )}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b-[3px] border-foreground bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="inline-flex size-9 items-center justify-center border-2 border-foreground bg-foreground text-background">
            <Gauge className="size-4" />
          </span>
          <span className="font-mono text-base font-bold tracking-tight uppercase">
            WebCost<span className="text-[#FF3B1F]">Dz</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/onboarding"
            className="hidden items-center border-2 border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold tracking-widest text-background uppercase transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#FF3B1F] sm:inline-flex"
          >
            Start estimation
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t-[3px] border-foreground py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 px-5 font-mono text-xs tracking-wide text-muted-foreground uppercase sm:flex-row">
        <p>© {new Date().getFullYear()} WebCostDz — website cost estimation for Algerian businesses.</p>
        <div className="flex gap-6">
          <Link to="/onboarding" className="border-b-2 border-transparent pb-0.5 transition-colors hover:border-foreground hover:text-foreground">
            Estimate
          </Link>
          <a href="mailto:hello@webcostdz.com" className="border-b-2 border-transparent pb-0.5 transition-colors hover:border-foreground hover:text-foreground">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}