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
  features: { key: string; label: string; price: number }[];
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
  const rules = allRules.filter((r) => unique.includes(r.key));
  const selected = rules.length ? rules : allRules.filter((r) => r.key === "landing_page");

  const base = selected.reduce((sum, r) => sum + r.price, 0);
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
    features: selected.map((r) => ({ key: r.key, label: r.label, price: r.price })),
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
