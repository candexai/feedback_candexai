import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "candex_feedback_admin";

function expectedToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("candex-feedback-admin-v1").digest("hex");
}

export function tokenForPassword(input: string) {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const given = Buffer.from(input);
  const actual = Buffer.from(password);
  if (!password || given.length !== actual.length) return null;
  if (!timingSafeEqual(given, actual)) return null;
  return expectedToken();
}

export async function isAdmin() {
  const token = expectedToken();
  if (!token) return false;
  const jar = await cookies();
  const got = jar.get(ADMIN_COOKIE)?.value ?? "";
  if (got.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(token));
}

export function adminCookieOptions(request?: Request) {
  const forwarded = request?.headers.get("x-forwarded-proto");
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production" || forwarded === "https",
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}
