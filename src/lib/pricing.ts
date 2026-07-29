export type PricingRule = {
  key: string;
  label: string;
  price: number;
  days: number;
  weight: number;
};

/** Server-owned pricing engine. The AI never decides prices. */
export const PRICING_RULES: PricingRule[] = [
  { key: "landing_page", label: "Landing Page", price: 120, days: 2, weight: 1 },
  { key: "authentication", label: "Authentication", price: 180, days: 3, weight: 2 },
  { key: "admin_dashboard", label: "Admin Dashboard", price: 350, days: 5, weight: 3 },
  { key: "cms", label: "CMS", price: 250, days: 4, weight: 3 },
  { key: "blog", label: "Blog", price: 120, days: 2, weight: 1 },
  { key: "booking_system", label: "Booking System", price: 280, days: 4, weight: 3 },
  { key: "reservation_calendar", label: "Reservation Calendar", price: 200, days: 3, weight: 2 },
  { key: "online_payments", label: "Online Payments", price: 220, days: 3, weight: 3 },
  { key: "inventory_management", label: "Inventory Management", price: 400, days: 6, weight: 4 },
  { key: "pos_system", label: "POS System", price: 500, days: 8, weight: 5 },
  { key: "order_management", label: "Order Management", price: 220, days: 3, weight: 3 },
  { key: "notifications", label: "Notifications", price: 100, days: 2, weight: 1 },
  { key: "analytics_dashboard", label: "Analytics Dashboard", price: 180, days: 3, weight: 2 },
  { key: "file_upload", label: "File Upload", price: 100, days: 1, weight: 1 },
  { key: "customer_accounts", label: "Customer Accounts", price: 150, days: 2, weight: 2 },
  { key: "reviews", label: "Reviews", price: 80, days: 1, weight: 1 },
  { key: "chat", label: "Chat", price: 150, days: 2, weight: 2 },
  { key: "multilingual", label: "Multilingual", price: 180, days: 3, weight: 2 },
  { key: "seo", label: "SEO", price: 120, days: 2, weight: 1 },
  { key: "contact_form", label: "Contact Form", price: 50, days: 1, weight: 1 },
  { key: "google_maps", label: "Google Maps", price: 50, days: 1, weight: 1 },
  { key: "multiple_branches", label: "Multiple Branches", price: 300, days: 4, weight: 3 },
  { key: "api_integration", label: "API Integration", price: 250, days: 4, weight: 3 },
];

export const OPTIONAL_ADDONS = [
  { key: "mobile_app", label: "Mobile App", price: 2000 },
  { key: "ai_chatbot", label: "AI Chatbot", price: 500 },
  { key: "sms_notifications", label: "SMS Notifications", price: 250 },
  { key: "loyalty_program", label: "Loyalty Program", price: 400 },
  { key: "advanced_seo", label: "Advanced SEO Package", price: 350 },
];

export const FEATURE_KEYS = PRICING_RULES.map((r) => r.key);

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
};

export function calculatePrice(featureKeys: string[]): PriceResult {
  const unique = Array.from(new Set(featureKeys));
  const rules = PRICING_RULES.filter((r) => unique.includes(r.key));
  const selected = rules.length ? rules : PRICING_RULES.filter((r) => r.key === "landing_page");

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
  const minDays = Math.max(lo, Math.round(baseDays * 0.8));
  const maxDays = Math.max(minDays + 3, Math.min(hi, Math.round(baseDays * 1.4)));

  return {
    features: selected.map((r) => ({ key: r.key, label: r.label, price: r.price })),
    minimumPrice: Math.round(base / 10) * 10,
    maximumPrice: Math.round((base * 1.22) / 10) * 10,
    duration: `${minDays}–${maxDays} days`,
    minDays,
    maxDays,
    complexity,
    complexityScore: score,
  };
}
