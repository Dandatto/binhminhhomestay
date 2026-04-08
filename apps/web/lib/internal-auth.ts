import { timingSafeEqual } from "crypto";
import { env } from "./env";
import { verifyAdminSession } from "./session";

export function safeTokenEquals(providedToken: string | null, expectedToken: string): boolean {
  if (!providedToken || !expectedToken) {
    return false;
  }

  const provided = Buffer.from(providedToken);
  const expected = Buffer.from(expectedToken);
  if (provided.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(provided, expected);
}

/** F-006: Single centralised admin-token verification using timing-safe comparison.
 *  Accepts EITHER:
 *   1. Bearer token in Authorization header (server-to-server / worker calls)
 *   2. Valid admin_session cookie (browser dashboard calls after PIN login)
 *  This dual-path means client-side widgets never need the secret token. */
export function verifyAdminToken(req: Request): boolean {
  // Path 1 — Bearer token (server-to-server)
  const bearer = req.headers.get("Authorization")?.replace("Bearer ", "") ?? null;
  if (bearer && safeTokenEquals(bearer, env.workerDispatchToken)) return true;

  // Path 2 — admin_session cookie (browser dashboard)
  const cookieHeader = req.headers.get("cookie") ?? "";
  const adminSessionMatch = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]+)/);
  const adminSessionToken = adminSessionMatch?.[1];
  return verifyAdminSession(adminSessionToken);
}

