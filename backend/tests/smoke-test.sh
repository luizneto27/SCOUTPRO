#!/usr/bin/env bash
set -euo pipefail

# Smoke test script for ScoutPro backend (non-destructive)
# Usage:
#  AUTH_USER=admin AUTH_PASS=senha BASE_URL=http://localhost:8080 ./smoke-test.sh

BASE_URL="${BASE_URL:-http://localhost:8080}"
AUTH_USER="${AUTH_USER:-}"
AUTH_PASS="${AUTH_PASS:-}"

which jq > /dev/null 2>&1 || { echo "jq is required. Install it (brew install jq)"; exit 2; }

ok=0
fail=0

check_status() {
  local name=$1
  local code=$2
  if [ "$code" -ge 200 ] && [ "$code" -lt 300 ]; then
    echo "[OK] $name -> $code"
    ok=$((ok+1))
  else
    echo "[FAIL] $name -> $code"
    fail=$((fail+1))
  fi
}

echo "Running smoke tests against $BASE_URL"

# 1) OpenAPI availability
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/v3/api-docs")
check_status "OpenAPI /v3/api-docs" $code

# 2) Attempt to obtain JWT if credentials provided
TOKEN=""
if [ -n "$AUTH_USER" ] && [ -n "$AUTH_PASS" ]; then
  echo "Attempting login as $AUTH_USER"
  TOKEN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$AUTH_USER\",\"password\":\"$AUTH_PASS\"}" | jq -r '.token // empty') || true
  if [ -n "$TOKEN" ]; then
    echo "Token obtained (length ${#TOKEN})"
  else
    echo "Could not obtain token with provided credentials"
  fi
else
  echo "AUTH_USER or AUTH_PASS not set — skipping authenticated checks"
fi

AUTH_HEADER=""
if [ -n "$TOKEN" ]; then
  AUTH_HEADER=( -H "Authorization: Bearer $TOKEN" )
fi

# 3) Public / protected GET endpoints (non-destructive)
code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/v1/clientes" ${AUTH_HEADER:+${AUTH_HEADER[@]}})
check_status "GET /api/v1/clientes" $code

code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/v1/clientes/1" ${AUTH_HEADER:+${AUTH_HEADER[@]}})
check_status "GET /api/v1/clientes/1" $code

JOGADOR_ID=${JOGADOR_ID:-42}
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/jogadores/${JOGADOR_ID}/patrocinios" ${AUTH_HEADER:+${AUTH_HEADER[@]}})
check_status "GET /api/v1/jogadores/${JOGADOR_ID}/patrocinios" $code

code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/transferencias/jogador/${JOGADOR_ID}" ${AUTH_HEADER:+${AUTH_HEADER[@]}})
check_status "GET /api/v1/transferencias/jogador/${JOGADOR_ID}" $code

echo "\nSummary: OK=$ok FAIL=$fail"
if [ "$fail" -gt 0 ]; then
  exit 3
fi
exit 0
