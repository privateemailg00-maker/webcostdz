import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { admin?: boolean };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"] ?? "",
    name: "webcostdz-admin",
    maxAge: 60 * 60 * 12,
    // SameSite=None so the admin session survives inside the preview iframe
    // (cross-site context); requires Secure.
    cookie: { httpOnly: true, secure: true, sameSite: "none" as const, path: "/" },
  };
}

export function passwordMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export async function getAdminSession() {
  return useSession<AdminSession>(sessionConfig());
}

export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession();
  return session.data.admin === true;
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}
