import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LANG, DICTS, LANGS, dirOf, type Lang } from "./translations";

const STORAGE_KEY = "webcostdz-lang";

type Ctx = {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<Ctx | null>(null);

function isLang(v: string | null): v is Lang {
  return v === "ar" || v === "fr" || v === "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLang(stored) && stored !== lang) setLangState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const dir = dirOf(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }, []);

  const value = useMemo<Ctx>(() => {
    const dict = DICTS[lang];
    return {
      lang,
      dir: dirOf(lang),
      setLang,
      t: (key, vars) => {
        let out = dict[key] ?? DICTS.en[key] ?? key;
        if (vars) {
          for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
        }
        return out;
      },
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export { LANGS, DEFAULT_LANG, dirOf };
export type { Lang };
