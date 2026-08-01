import type { PricingRule } from "./pricing";
import { PRICING_RULES, BACKEND_RULES, OPTIONAL_ADDONS } from "./pricing";

export type PriceRow = {
  key: string;
  label: string;
  kind: string;
  price: number;
  days: number;
  weight: number;
  sort: number;
};

/** Loads the editable price list from the database, falling back to the built-in list. */
export async function loadPriceRows(): Promise<PriceRow[]> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("feature_prices")
      .select("key,label,kind,price,days,weight,sort")
      .order("sort", { ascending: true });
    if (error || !data?.length) throw error ?? new Error("empty");
    return data as PriceRow[];
  } catch {
    return [
      ...PRICING_RULES.map((r, i) => ({ ...r, kind: "feature", sort: i + 1 })),
      ...BACKEND_RULES.map((r, i) => ({ ...r, kind: "backend", sort: 30 + i })),
      ...OPTIONAL_ADDONS.map((a, i) => ({
        ...a,
        kind: "addon",
        days: 0,
        weight: 0,
        sort: 40 + i,
      })),
    ];
  }
}

export function toRules(rows: PriceRow[]): PricingRule[] {
  return rows.map((r) => ({
    key: r.key,
    label: r.label,
    price: r.price,
    days: r.days,
    weight: r.weight,
    kind: r.kind,
    sort: r.sort,
  }));
}

export function featureKeysOf(rows: PriceRow[]): string[] {
  return rows.filter((r) => r.kind === "feature").map((r) => r.key);
}

export function addonsOf(rows: PriceRow[]) {
  return rows
    .filter((r) => r.kind === "addon")
    .map((r) => ({ key: r.key, label: r.label, price: r.price }));
}
