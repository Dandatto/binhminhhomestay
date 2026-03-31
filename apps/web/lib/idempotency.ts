import { createHash } from "crypto";

export function createRequestHash(payload: Record<string, unknown>): string {
  const normalized = JSON.stringify(payload, Object.keys(payload).sort());
  return createHash("sha256").update(normalized).digest("hex");
}

export function normalizeIdempotencyKey(rawKey: string | null, requestHash: string): string {
  if (!rawKey || rawKey.trim().length === 0) {
    return `auto-${requestHash.slice(0, 32)}`;
  }
  return rawKey.trim().slice(0, 128);
}
