import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type AdminPriceRow = {
  key: string;
  label: string;
  kind: string;
  price: number;
  days: number;
  weight: number;
  sort: number;
};

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { isAdmin } = await import("./admin.server");
  return { admin: await isAdmin() };
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ password: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { getAdminSession, passwordMatches } = await import("./admin.server");
    const expected = process.env["ADMIN_PASSWORD"];
    if (!expected) return { ok: false as const, reason: "unconfigured" as const };
    if (!passwordMatches(data.password, expected)) {
      return { ok: false as const, reason: "invalid" as const };
    }
    const session = await getAdminSession();
    await session.update({ admin: true });
    return { ok: true as const, reason: null };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { getAdminSession } = await import("./admin.server");
  const session = await getAdminSession();
  await session.clear();
  return { ok: true };
});

export const adminListPrices = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ rows: AdminPriceRow[] }> => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();
    const { loadPriceRows } = await import("./pricing.server");
    return { rows: (await loadPriceRows()) as AdminPriceRow[] };
  },
);

const updateInput = z.object({
  rows: z
    .array(
      z.object({
        key: z.string().min(1).max(60),
        label: z.string().trim().min(1).max(120),
        price: z.number().int().min(0).max(10_000_000),
        days: z.number().int().min(0).max(365),
        weight: z.number().int().min(0).max(10),
      }),
    )
    .min(1)
    .max(100),
});

export const adminUpdatePrices = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => updateInput.parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin.server");
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    for (const row of data.rows) {
      const { error } = await supabaseAdmin
        .from("feature_prices")
        .update({ label: row.label, price: row.price, days: row.days, weight: row.weight })
        .eq("key", row.key);
      if (error) {
        console.error("Failed to update price", row.key, error);
        throw new Error("Could not save prices. Please try again.");
      }
    }
    return { ok: true, saved: data.rows.length };
  });
