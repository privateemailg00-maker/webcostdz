import { useEffect, useRef } from "react";

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || "ca-pub-9116452648900995";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    googletag?: any;
  }
}

/** Responsive AdSense display unit. Set VITE_ADSENSE_SLOT_* env vars with real slot IDs. */
export function AdSlot({ slot, className = "" }: { slot?: string; className?: string }) {
  const pushed = useRef(false);
  useEffect(() => {
    if (!slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blocked */
    }
  }, [slot]);

  if (!slot) {
    return (
      <div
        className={`mx-auto flex min-h-[90px] w-full max-w-5xl items-center justify-center border-[3px] border-dashed border-muted-foreground font-mono text-[10px] tracking-widest text-muted-foreground uppercase ${className}`}
        aria-hidden
      >
        Ad
      </div>
    );
  }
  return (
    <div className={`mx-auto w-full max-w-5xl ${className}`}>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export const AD_SLOTS = {
  home: import.meta.env.VITE_ADSENSE_SLOT_HOME as string | undefined,
  business: import.meta.env.VITE_ADSENSE_SLOT_BUSINESS as string | undefined,
  results: import.meta.env.VITE_ADSENSE_SLOT_RESULTS as string | undefined,
};
