#!/usr/bin/env bash
# Fully self-contained: builds image, deploys revision, applies all env
# vars and Secret Manager bindings. Safe to re-run any number of times.
# Used standalone AND by setup-gcp.sh.

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-apuliaai}"
REGION="${REGION:-europe-west1}"
REPO="${REPO:-apulia}"
SERVICE="${SERVICE:-apulia-landing}"
APP_URL_PUBLIC="${APP_URL_PUBLIC:-https://apulia.ai}"
SUPABASE_URL="${SUPABASE_URL:-https://amkixorrowqbgohzopvi.supabase.co}"
IMG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/landing:latest"

say() { printf "\n\033[1;36m▸ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[32m✓\033[0m %s\n" "$*"; }

say "Build landing image"
# Fetch the anon key from Secret Manager so Next.js can inline NEXT_PUBLIC_*
# vars during `npm run build`. Without these build args, the server bundle
# ships with `process.env.NEXT_PUBLIC_SUPABASE_URL === undefined` baked in,
# and runtime --set-env-vars below has no effect on inlined references.
ANON_KEY="$(gcloud secrets versions access latest \
  --secret=supabase-anon-key --project="${PROJECT_ID}")"
gcloud builds submit landing \
  --config landing/cloudbuild.yaml \
  --substitutions=_IMG="${IMG}",_NEXT_PUBLIC_SUPABASE_URL="${SUPABASE_URL}",_NEXT_PUBLIC_SUPABASE_ANON_KEY="${ANON_KEY}" \
  --project "${PROJECT_ID}" --quiet
ok "Pushed: ${IMG}"

say "Deploy revision to ${SERVICE}"
gcloud run deploy "${SERVICE}" \
  --image "${IMG}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --allow-unauthenticated \
  --port 8080 \
  --min-instances 0 --max-instances 3 \
  --concurrency 80 \
  --memory 512Mi --cpu 1 \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}" \
  --set-env-vars "SUPABASE_URL=${SUPABASE_URL}" \
  --set-env-vars "NEXT_PUBLIC_APP_URL=${APP_URL_PUBLIC}" \
  --set-env-vars "ZEPTO_API_HOST=api.zeptomail.com" \
  --set-env-vars "ZEPTO_FROM_EMAIL_CONFIRM=noreply@apulia.ai" \
  --set-env-vars "ZEPTO_FROM_EMAIL_ISSUES=newsletter@apulia.ai" \
  --set-env-vars "ZEPTO_FROM_NAME=apulia.ai" \
  --set-env-vars "ADMIN_EMAIL=max@kalym.me" \
  --set-secrets "NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase-anon-key:latest" \
  --set-secrets "SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest" \
  --set-secrets "ZEPTO_API_TOKEN=zepto-api-token:latest" \
  --set-secrets "ADMIN_JWT_SECRET=admin-jwt-secret:latest" \
  --set-secrets "ADMIN_PASSWORD=admin-password:latest" \
  --quiet

URL="$(gcloud run services describe "${SERVICE}" --region "${REGION}" --project "${PROJECT_ID}" --format='value(status.url)')"
ok "Live at: ${URL}"
