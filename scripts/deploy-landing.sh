#!/usr/bin/env bash
# Fast path: rebuild + deploy ONLY the landing Cloud Run service.
# Use after editing files under landing/.
#
# Usage:
#   bash scripts/deploy-landing.sh

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-apuliaai}"
REGION="${REGION:-europe-west1}"
REPO="${REPO:-apulia}"
SERVICE="${SERVICE:-apulia-landing}"
IMG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/landing:latest"

say() { printf "\n\033[1;36m▸ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[32m✓\033[0m %s\n" "$*"; }

say "Build landing image"
gcloud builds submit landing --tag "${IMG}" --project "${PROJECT_ID}" --quiet
ok "Pushed: ${IMG}"

say "Deploy revision to ${SERVICE}"
gcloud run deploy "${SERVICE}" \
  --image "${IMG}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --quiet

URL="$(gcloud run services describe "${SERVICE}" --region "${REGION}" --project "${PROJECT_ID}" --format='value(status.url)')"
ok "Live at: ${URL}"
