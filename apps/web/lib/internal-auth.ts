import { timingSafeEqual } from "crypto";
import { env } from "./env";

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
 *  All admin routes must use this function instead of local `===` checks. */
export function verifyAdminToken(req: Request): boolean {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? null;
  return safeTokenEquals(token, env.workerDispatchToken);
}

