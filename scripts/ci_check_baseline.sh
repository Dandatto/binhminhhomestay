#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "README.md"
  "docs/strategy-2026.extracted.md"
  "docs/security/SECURITY_BASELINE.md"
  "docs/security/DATA_CLASSIFICATION.md"
  "docs/legal/ND13_COMPLIANCE_BASELINE.md"
  "docs/ops/INCIDENT_RESPONSE_RUNBOOK.md"
  "docs/ops/BCP_DR_PLAN.md"
  "docs/ops/INTEGRATION_RESILIENCE_STANDARD.md"
  "SECURITY_CHANGELOG.md"
)

missing=0
for f in "${required_files[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "[FAIL] Missing required file: $f"
    missing=1
  fi
done

if [[ $missing -ne 0 ]]; then
  exit 1
fi

# Ensure web.md is real text markdown now (not binary)
if file "web.md" | grep -qi "Microsoft Word\|Composite\|document"; then
  echo "[FAIL] web.md is binary/mislabelled. Convert to text markdown before merge."
  exit 1
fi

# Basic content assertions
if ! rg -q "SEC-01|TLS" docs/security/SECURITY_BASELINE.md; then
  echo "[FAIL] SECURITY_BASELINE missing core control markers"
  exit 1
fi

if ! rg -q "RTO|RPO" docs/ops/BCP_DR_PLAN.md; then
  echo "[FAIL] BCP/DR file missing RTO/RPO targets"
  exit 1
fi

if ! rg -q "consent|đồng ý|Nghị định 13|ND13" -i docs/legal/ND13_COMPLIANCE_BASELINE.md; then
  echo "[FAIL] Legal baseline missing consent/ND13 references"
  exit 1
fi

echo "[PASS] Security baseline checks passed"
