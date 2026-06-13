#!/usr/bin/env bash
# One-time IAM grants for Cloud Build's default Compute SA on new GCP projects.
# Run once before setup-gcp.sh on a fresh project.
#
# Usage:
#   bash scripts/grant-build-roles.sh

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-apuliaai}"

PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"
SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Granting build/deploy roles to: ${SA}"

for role in \
  roles/storage.admin \
  roles/artifactregistry.writer \
  roles/logging.logWriter \
  roles/run.admin \
  roles/iam.serviceAccountUser
do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA}" \
    --role="${role}" \
    --quiet \
    --condition=None >/dev/null
  echo "  ✓ ${role}"
done

echo "Done. Now re-run: bash scripts/setup-gcp.sh"
