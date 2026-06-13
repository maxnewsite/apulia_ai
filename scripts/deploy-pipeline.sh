#!/usr/bin/env bash
# Fast path: rebuild + update ONLY the pipeline Cloud Run job.
# Use after editing files under pipeline/.
#
# Usage:
#   bash scripts/deploy-pipeline.sh

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-apuliaai}"
REGION="${REGION:-europe-west1}"
REPO="${REPO:-apulia}"
JOB="${JOB:-apulia-weekly}"
IMG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/pipeline:latest"

say() { printf "\n\033[1;36m▸ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[32m✓\033[0m %s\n" "$*"; }

say "Build pipeline image"
gcloud builds submit pipeline --tag "${IMG}" --project "${PROJECT_ID}" --quiet
ok "Pushed: ${IMG}"

say "Update job ${JOB}"
gcloud run jobs update "${JOB}" \
  --image "${IMG}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --quiet
ok "Job updated. Next scheduled run will use this image."

cat <<EOF

  Manual test run (dry-run, no publish/send):
    gcloud run jobs execute ${JOB} --region ${REGION} --args=--dry-run

  Real run (publishes + sends to active subscribers):
    gcloud run jobs execute ${JOB} --region ${REGION}
EOF
