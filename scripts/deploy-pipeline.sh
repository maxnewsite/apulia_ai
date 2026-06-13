#!/usr/bin/env bash
# Fully self-contained: builds image, creates-or-updates the Cloud Run
# job with all env vars and Secret Manager bindings. Safe to re-run.
# Used standalone AND by setup-gcp.sh.

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-apuliaai}"
REGION="${REGION:-europe-west1}"
REPO="${REPO:-apulia}"
JOB="${JOB:-apulia-weekly}"
APP_URL_PUBLIC="${APP_URL_PUBLIC:-https://apulia.ai}"
SUPABASE_URL="${SUPABASE_URL:-https://amkixorrowqbgohzopvi.supabase.co}"
IMG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/pipeline:latest"

say() { printf "\n\033[1;36m▸ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[32m✓\033[0m %s\n" "$*"; }

say "Build pipeline image"
gcloud builds submit pipeline --tag "${IMG}" --project "${PROJECT_ID}" --quiet
ok "Pushed: ${IMG}"

JOB_FLAGS=(
  --image "${IMG}"
  --region "${REGION}"
  --project "${PROJECT_ID}"
  --max-retries 1
  --task-timeout 30m
  --memory 2Gi --cpu 2
  --set-env-vars "SUPABASE_URL=${SUPABASE_URL}"
  --set-env-vars "APP_URL=${APP_URL_PUBLIC}"
  --set-env-vars "ZEPTO_API_HOST=api.zeptomail.com"
  --set-env-vars "ZEPTO_FROM_EMAIL_ISSUES=newsletter@apulia.ai"
  --set-env-vars "ZEPTO_FROM_NAME=apulia.ai"
  --set-secrets "SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest"
  --set-secrets "ZEPTO_API_TOKEN=zepto-api-token:latest"
  --set-secrets "ANTHROPIC_API_KEY=anthropic-api-key:latest"
  --quiet
)

if gcloud run jobs describe "${JOB}" --region "${REGION}" --project "${PROJECT_ID}" >/dev/null 2>&1; then
  say "Update job ${JOB}"
  gcloud run jobs update "${JOB}" "${JOB_FLAGS[@]}"
  ok "Updated"
else
  say "Create job ${JOB}"
  gcloud run jobs create "${JOB}" "${JOB_FLAGS[@]}"
  ok "Created"
fi

cat <<EOF

  Manual test run (dry-run, no publish/send):
    gcloud run jobs execute ${JOB} --region ${REGION} --args=--dry-run

  Real run (publishes + sends to active subscribers):
    gcloud run jobs execute ${JOB} --region ${REGION}
EOF
