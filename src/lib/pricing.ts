export type PricingRule = {
  key: string;
  label: string;
  price: number;
  days: number;
  weight: number;
  kind?: string;
  sort?: number;
};

/** Server-owned pricing engine. The AI never decides prices. Currency: DZD. */
export const PRICING_RULES: PricingRule[] = [
  { key: "landing_page", label: "Landing Page", price: 6000, days: 2, weight: 1 },
  { key: "authentication", label: "Authentication", price: 9000, days: 3, weight: 2 },
  { key: "admin_dashboard", label: "Admin Dashboard", price: 15000, days: 5, weight: 3 },
  { key: "cms", label: "CMS", price: 12000, days: 4, weight: 3 },
  { key: "blog", label: "Blog", price: 6000, days: 2, weight: 1 },
  { key: "booking_system", label: "Booking System", price: 12000, days: 4, weight: 3 },
  { key: "reservation_calendar", label: "Reservation Calendar", price: 9000, days: 3, weight: 2 },
  { key: "online_payments", label: "Online Payments", price: 9000, days: 3, weight: 3 },
  { key: "inventory_management", label: "Inventory Management", price: 18000, days: 6, weight: 4 },
  { key: "pos_system", label: "POS System", price: 24000, days: 8, weight: 5 },
  { key: "order_management", label: "Order Management", price: 9000, days: 3, weight: 3 },
  { key: "notifications", label: "Notifications", price: 6000, days: 2, weight: 1 },
  { key: "analytics_dashboard", label: "Analytics Dashboard", price: 9000, days: 3, weight: 2 },
  { key: "file_upload", label: "File Upload", price: 3000, days: 1, weight: 1 },
  { key: "customer_accounts", label: "Customer Accounts", price: 6000, days: 2, weight: 2 },
  { key: "reviews", label: "Reviews", price: 3000, days: 1, weight: 1 },
  { key: "chat", label: "Chat", price: 6000, days: 2, weight: 2 },
  { key: "multilingual", label: "Multilingual", price: 9000, days: 3, weight: 2 },
  { key: "seo", label: "SEO", price: 6000, days: 2, weight: 1 },
  { key: "contact_form", label: "Contact Form", price: 3000, days: 1, weight: 1 },
  { key: "google_maps", label: "Google Maps", price: 3000, days: 1, weight: 1 },
  { key: "multiple_branches", label: "Multiple Branches", price: 12000, days: 4, weight: 3 },
  { key: "api_integration", label: "API Integration", price: 12000, days: 4, weight: 3 },
];

/** Backend approach — chosen by the client, never by the AI. */
export const BACKEND_RULES: PricingRule[] = [
  { key: "managed_backend", label: "No-code / Managed Backend", price: 6000, days: 2, weight: 1 },
  { key: "custom_backend", label: "Custom Coded Backend", price: 18000, days: 6, weight: 4 },
];

export const OPTIONAL_ADDONS = [
  { key: "mobile_app", label: "Mobile App", price: 30000, days: 10 },
  { key: "ai_chatbot", label: "AI Chatbot", price: 9000, days: 3 },
  { key: "sms_notifications", label: "SMS Notifications", price: 3000, days: 1 },
  { key: "loyalty_program", label: "Loyalty Program", price: 9000, days: 3 },
  { key: "advanced_seo", label: "Advanced SEO Package", price: 6000, days: 2 },
];

/** Feature packs: features that go together, sold at one lower price. */
export type FeaturePack = {
  key: string;
  label: { ar: string; fr: string; en: string };
  features: string[];
  price: number;
};

export const FEATURE_PACKS: FeaturePack[] = [
  {
    key: "pack_booking",
    label: { ar: "باقة الحجوزات", fr: "Pack Réservation", en: "Booking Pack" },
    features: ["booking_system", "reservation_calendar", "notifications"],
    price: 21000,
  },
  {
    key: "pack_ecommerce",
    label: { ar: "باقة المتجر الإلكتروني", fr: "Pack E-commerce", en: "E-commerce Pack" },
    features: ["order_management", "online_payments", "customer_accounts", "inventory_management"],
    price: 33000,
  },
  {
    key: "pack_management",
    label: { ar: "باقة الإدارة", fr: "Pack Gestion", en: "Management Pack" },
    features: ["admin_dashboard", "analytics_dashboard", "file_upload"],
    price: 21000,
  },
  {
    key: "pack_content",
    label: { ar: "باقة المحتوى", fr: "Pack Contenu", en: "Content Pack" },
    features: ["cms", "blog", "seo"],
    price: 19000,
  },
  {
    key: "pack_accounts",
    label: { ar: "باقة الحسابات", fr: "Pack Comptes", en: "Accounts Pack" },
    features: ["authentication", "customer_accounts"],
    price: 12000,
  },
  {
    key: "pack_contact",
    label: { ar: "باقة التواصل", fr: "Pack Contact", en: "Contact Pack" },
    features: ["contact_form", "google_maps", "chat"],
    price: 9000,
  },
];

export const FEATURE_KEYS = PRICING_RULES.map((r) => r.key);

export const BACKEND_KEYS = ["managed", "custom"] as const;
export type BackendChoice = (typeof BACKEND_KEYS)[number];

export const SPEED_KEYS = ["standard", "fast", "urgent"] as const;
export type SpeedChoice = (typeof SPEED_KEYS)[number];

/** Faster delivery = higher price and a shorter timeline. Never below 7 days. */
export const MIN_DAYS = 7;
export const SPEED_SETTINGS: Record<SpeedChoice, { surcharge: number; timeFactor: number }> = {
  standard: { surcharge: 0, timeFactor: 1 },
  fast: { surcharge: 0.25, timeFactor: 0.6 },
  urgent: { surcharge: 0.5, timeFactor: 0.5 },
};

export const CURRENCY = "DZD";

export function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString("en-US")} ${CURRENCY}`;
}

export type Complexity = "Small" | "Medium" | "Large" | "Enterprise";

export type PriceResult = {
  features: { key: string; label: string; price: number; pack?: string }[];
  packs: { key: string; label: FeaturePack["label"]; price: number; saved: number; features: string[] }[];
  minimumPrice: number;
  maximumPrice: number;
  duration: string;
  minDays: number;
  maxDays: number;
  complexity: Complexity;
  complexityScore: number;
  speed: SpeedChoice;
  speedSurcharge: number;
  backend: BackendChoice;
  currency: string;
};

export function calculatePrice(
  featureKeys: string[],
  options?: {
    rules?: PricingRule[];
    speed?: SpeedChoice;
    backend?: BackendChoice;
  },
): PriceResult {
  const allRules = options?.rules?.length ? options.rules : [...PRICING_RULES, ...BACKEND_RULES];
  const speed: SpeedChoice = options?.speed ?? "standard";
  const backend: BackendChoice = options?.backend ?? "managed";
  const backendKey = backend === "custom" ? "custom_backend" : "managed_backend";

  const unique = Array.from(new Set([...featureKeys, backendKey]));
  const rules: PricingRule[] = allRules.filter((r) => unique.includes(r.key));
  const selected: PricingRule[] = rules.length ? rules : allRules.filter((r) => r.key === "landing_page");

  // Apply packs: a pack kicks in when all its features are selected, or when the
  // selected ones already cost more than the pack (then the rest come free).
  const byKey = new Map(allRules.map((r) => [r.key, r]));
  const chosen = new Set(selected.map((r) => r.key));
  const packed = new Map<string, string>();
  const packs: PriceResult["packs"] = [];
  for (const pack of FEATURE_PACKS) {
    const members = pack.features.filter((k) => byKey.has(k) && !packed.has(k));
    if (members.length < 2) continue;
    const have = members.filter((k) => chosen.has(k));
    const haveSum = have.reduce((s, k) => s + byKey.get(k)!.price, 0);
    if (have.length < 2 || (have.length < members.length && haveSum < pack.price)) continue;
    const fullSum = members.reduce((s, k) => s + byKey.get(k)!.price, 0);
    if (pack.price >= fullSum) continue;
    for (const k of members) {
      packed.set(k, pack.key);
      if (!chosen.has(k)) {
        chosen.add(k);
        selected.push(byKey.get(k)!);
      }
    }
    packs.push({ key: pack.key, label: pack.label, price: pack.price, saved: fullSum - pack.price, features: members });
  }

  const looseSum = selected.filter((r) => !packed.has(r.key)).reduce((sum, r) => sum + r.price, 0);
  const base = looseSum + packs.reduce((s, p) => s + p.price, 0);
  const score = selected.reduce((sum, r) => sum + r.weight, 0);
  const baseDays = selected.reduce((sum, r) => sum + r.days, 0);

  let complexity: Complexity = "Small";
  if (score > 30) complexity = "Enterprise";
  else if (score > 18) complexity = "Large";
  else if (score > 8) complexity = "Medium";

  const range: Record<Complexity, [number, number]> = {
    Small: [7, 14],
    Medium: [15, 30],
    Large: [30, 60],
    Enterprise: [60, 90],
  };
  const [lo, hi] = range[complexity];
  const { surcharge, timeFactor } = SPEED_SETTINGS[speed];

  const rawMin = Math.max(lo, Math.round(baseDays * 0.8));
  const rawMax = Math.max(rawMin + 3, Math.min(hi, Math.round(baseDays * 1.4)));
  const minDays = Math.max(MIN_DAYS, Math.round(rawMin * timeFactor));
  const maxDays = Math.max(minDays + (speed === "standard" ? 3 : 2), Math.round(rawMax * timeFactor));

  const rushed = base * (1 + surcharge);

  return {
    features: selected.map((r) => ({ key: r.key, label: r.label, price: r.price, pack: packed.get(r.key) })),
    packs,
    minimumPrice: Math.round(rushed / 10) * 10,
    maximumPrice: Math.round((rushed * 1.22) / 10) * 10,
    duration: `${minDays}–${maxDays} days`,
    minDays,
    maxDays,
    complexity,
    complexityScore: score,
    speed,
    speedSurcharge: surcharge,
    backend,
    currency: CURRENCY,
  };
}
