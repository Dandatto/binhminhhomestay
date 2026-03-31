function toInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export const env = {
  storeAdapter: process.env.STORE_ADAPTER ?? "memory",
  databaseUrl: process.env.DATABASE_URL ?? "",
  consentPolicyVersion: process.env.CONSENT_POLICY_VERSION ?? "policy-2026-03-01",
  idempotencyTtlSeconds: toInt(process.env.IDEMPOTENCY_TTL_SECONDS, 86400),
  outboxBatchSize: toInt(process.env.OUTBOX_BATCH_SIZE, 20),
  outboxMaxAttempts: toInt(process.env.OUTBOX_MAX_ATTEMPTS, 5),
  outboxBaseDelaySeconds: toInt(process.env.OUTBOX_BASE_DELAY_SECONDS, 15),
  workerDispatchToken: process.env.WORKER_DISPATCH_TOKEN ?? "",
  opsMetricsToken: process.env.OPS_METRICS_TOKEN ?? "",
  healthOutboxFailedMax: toInt(process.env.HEALTH_OUTBOX_FAILED_MAX, 10),
  healthOutboxPendingMax: toInt(process.env.HEALTH_OUTBOX_PENDING_MAX, 500),
  opsAlertOutboxFailedCritical: toInt(process.env.OPS_ALERT_OUTBOX_FAILED_CRITICAL, 5),
  opsAlertOutboxPendingWarning: toInt(process.env.OPS_ALERT_OUTBOX_PENDING_WARNING, 100),
  opsAlertOutboxPendingCritical: toInt(process.env.OPS_ALERT_OUTBOX_PENDING_CRITICAL, 300),
  opsAlertIdempotencyInProgressCritical: toInt(process.env.OPS_ALERT_IDEMPOTENCY_IN_PROGRESS_CRITICAL, 20),

  // Email (Resend)
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
  emailFromName: process.env.EMAIL_FROM_NAME ?? "Bình Minh Homestay",

  // VietQR / Payment
  vietqrAccountNo: process.env.VIETQR_ACCOUNT_NO ?? "0123456789",
  vietqrBankBin: process.env.VIETQR_BANK_BIN ?? "970418",   // BIN BIDV mặc định
  vietqrAccountName: process.env.VIETQR_ACCOUNT_NAME ?? "BINH MINH HOMESTAY",
  depositRatio: parseFloat(process.env.DEPOSIT_RATIO ?? "0.30"),

};
