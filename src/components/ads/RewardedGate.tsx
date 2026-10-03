import { useEffect, useRef, useState } from "react";
import { PlayCircle } from "lucide-react";

const AD_UNIT = import.meta.env.VITE_GAM_REWARDED_AD_UNIT as string | undefined; // e.g. /1234567/rewarded

type Status = "idle" | "loading" | "playing" | "unavailable" | "closed";

function loadGpt(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.googletag?.apiReady) return resolve();
    const existing = document.querySelector<HTMLScriptElement>("script[data-gpt]");
    window.googletag = window.googletag || { cmd: [] };
    if (!existing) {
      const s = document.createElement("script");
      s.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
      s.async = true;
      s.dataset.gpt = "1";
      s.onerror = () => reject(new Error("gpt"));
      document.head.appendChild(s);
    }
    window.googletag.cmd.push(() => resolve());
  });
}

/** Unlocks only on GPT's rewardedSlotGranted event. Never fakes the reward. */
export function RewardedGate({
  lang,
  onReward,
}: {
  lang: string;
  onReward: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const slotRef = useRef<any>(null);
  const L = (ar: string, fr: string, en: string) => (lang === "ar" ? ar : lang === "fr" ? fr : en);

  useEffect(
    () => () => {
      const gt = window.googletag;
      if (slotRef.current && gt?.destroySlots) gt.destroySlots([slotRef.current]);
    },
    [],
  );

  const watch = async () => {
    if (!AD_UNIT) return setStatus("unavailable");
    setStatus("loading");
    try {
      await loadGpt();
    } catch {
      return setStatus("unavailable");
    }
    const gt = window.googletag;
    gt.cmd.push(() => {
      const slot = gt.defineOutOfPageSlot(AD_UNIT, gt.enums.OutOfPageFormat.REWARDED);
      if (!slot) return setStatus("unavailable");
      slotRef.current = slot;
      slot.addService(gt.pubads());
      const pubads = gt.pubads();
      pubads.addEventListener("rewardedSlotReady", (e: any) => {
        if (e.slot !== slot) return;
        setStatus("playing");
        e.makeRewardedVisible();
      });
      pubads.addEventListener("rewardedSlotGranted", (e: any) => {
        if (e.slot === slot) onReward();
      });
      pubads.addEventListener("rewardedSlotClosed", (e: any) => {
        if (e.slot !== slot) return;
        gt.destroySlots([slot]);
        slotRef.current = null;
        setStatus("closed");
      });
      pubads.addEventListener("slotRenderEnded", (e: any) => {
        if (e.slot === slot && e.isEmpty) {
          gt.destroySlots([slot]);
          slotRef.current = null;
          setStatus("unavailable");
        }
      });
      gt.enableServices();
      gt.display(slot);
    });
  };

  return (
    <div className="brut-shadow-stamp mx-auto mt-10 max-w-xl border-[3px] border-foreground bg-card p-8 text-center">
      <PlayCircle className="mx-auto size-12 text-primary" />
      <h2 className="mt-4 text-xl font-extrabold uppercase">
        {L("تقديرك جاهز!", "Votre estimation est prête !", "Your estimate is ready!")}
      </h2>
      <p className="mt-2 font-mono text-[13px] text-muted-foreground">
        {L(
          "شاهد إعلاناً قصيراً لعرض السعر والمدة والتفاصيل. هذا يساعدنا على إبقاء الخدمة مجانية.",
          "Regardez une courte publicité pour afficher le prix, la durée et les détails. Cela garde le service gratuit.",
          "Watch a short ad to unlock the price, timeline and details. This keeps the service free.",
        )}
      </p>
      <button
        type="button"
        onClick={watch}
        disabled={status === "loading" || status === "playing"}
        className="mt-6 inline-flex items-center gap-2 border-[3px] border-foreground bg-foreground px-6 py-3.5 text-sm font-bold uppercase text-background disabled:opacity-60"
      >
        <PlayCircle className="size-4" />
        {status === "loading"
          ? L("جارٍ تحميل الإعلان…", "Chargement…", "Loading ad…")
          : L("شاهد الإعلان", "Regarder la pub", "Watch Ad")}
      </button>
      {status === "unavailable" && (
        <p className="mt-4 font-mono text-xs text-destructive">
          {L(
            "لا يوجد إعلان متاح الآن (أو مانع الإعلانات مفعّل). حاول مرة أخرى لاحقاً.",
            "Aucune publicité disponible (ou bloqueur actif). Réessayez plus tard.",
            "No ad available right now (or an ad blocker is on). Please try again later.",
          )}
        </p>
      )}
      {status === "closed" && (
        <p className="mt-4 font-mono text-xs text-destructive">
          {L(
            "أُغلق الإعلان قبل اكتماله. شاهده كاملاً لفتح النتيجة.",
            "Publicité fermée avant la fin. Regardez-la entièrement pour débloquer.",
            "The ad was closed before finishing. Watch it fully to unlock.",
          )}
        </p>
      )}
    </div>
  );
}
