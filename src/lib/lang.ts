import { z } from "zod";

export const langSchema = z.enum(["ar", "fr", "en"]).default("ar");

export const LANG_NAMES: Record<string, string> = { ar: "Arabic", fr: "French", en: "English" };
