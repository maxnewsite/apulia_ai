#!/usr/bin/env bash
# Idempotent first-time GCP setup for apulia.ai.
# Run from the repo root: bash scripts/setup-gcp.sh
#
# Prereqs:
#   gcloud auth login       (interactive, do this once)
#   gcloud config set project apuliaai
#   bash scripts/grant-build-roles.sh   (one-time, fresh project only)
#
# What this script does:
#   1. Enables required GCP APIs
#   2. Creates the Artifact Registry repo
#   3. Uploads secrets to Secret Manager from local .env files
#   4. Delegates to deploy-landing.sh + deploy-pipeline.sh
#      (so service/job config lives in one place, not duplicated here)
#   5. Creates a Cloud Scheduler trigger for Sundays 15:00 Europe/Rome
#
# Re-runnable: every step uses --quiet + checks-for-existence so re-running
# is a no-op when nothing changed.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ─── Config ──────────────────────────────────────────────────────────────
PROJECT_ID="${PROJECT_ID:-apuliaai}"
REGION="${REGION:-europe-west1}"
REPO="${REPO:-apulia}"
LANDING_SERVICE="${LANDING_SERVICE:-apulia-landing}"
PIPELINE_JOB="${PIPELINE_JOB:-apulia-weekly}"
SCHEDULER_JOB="${SCHEDULER_JOB:-apulia-weekly-trigger}"
SCHEDULER_SA_NAME="${SCHEDULER_SA_NAME:-apulia-scheduler}"

# These come from the local env files. We never write them into the repo.
LANDING_ENV_FILE="${LANDING_ENV_FILE:-landing/.env.local}"
PIPELINE_ENV_FILE="${PIPELINE_ENV_FILE:-pipeline/.env}"

say() { printf "\n\033[1;36m▸ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[32m✓\033[0m %s\n" "$*"; }

require() {
  local var="$1" file="$2"
  local val
  val="$(grep -E "^${var}=" "${file}" | head -1 | cut -d= -f2- || true)"
  if [[ -z "${val}" ]]; then
    echo "ERROR: ${var} not found in ${file}" >&2
    exit 1
  fi
  printf "%s" "${val}"
}

# Export config so the delegated deploy scripts inherit it.
export PROJECT_ID REGION REPO

# ─── 0. Sanity ───────────────────────────────────────────────────────────
say "Active project"
gcloud config set project "${PROJECT_ID}" --quiet
gcloud projects describe "${PROJECT_ID}" --format="value(projectId)" \
  || { echo "Project ${PROJECT_ID} not accessible"; exit 1; }
ok "${PROJECT_ID}"

# ─── 1. APIs ─────────────────────────────────────────────────────────────
say "Enabling APIs"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudscheduler.googleapis.com \
  iam.googleapis.com \
  --quiet
ok "APIs enabled"

# ─── 2. Artifact Registry ────────────────────────────────────────────────
say "Artifact Registry: ${REPO}"
if ! gcloud artifacts repositories describe "${REPO}" --location="${REGION}" >/dev/null 2>&1; then
  gcloud artifacts repositories create "${REPO}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="apulia.ai container images" \
    --quiet
  ok "Created"
else
  ok "Already exists"
fi

# ─── 3. Secrets ──────────────────────────────────────────────────────────
say "Uploading secrets to Secret Manager"

create_or_update_secret() {
  local name="$1" value="$2"
  if gcloud secrets describe "${name}" >/dev/null 2>&1; then
    printf "%s" "${value}" | gcloud secrets versions add "${name}" --data-file=- --quiet >/dev/null
    ok "Updated ${name}"
  else
    printf "%s" "${value}" | gcloud secrets create "${name}" --data-file=- --replication-policy=automatic --quiet >/dev/null
    ok "Created ${name}"
  fi
}

SUPABASE_ANON_KEY="$(require NEXT_PUBLIC_SUPABASE_ANON_KEY "${LANDING_ENV_FILE}")"
SUPABASE_SERVICE_ROLE_KEY="$(require SUPABASE_SERVICE_ROLE_KEY "${LANDING_ENV_FILE}")"
ZEPTO_API_TOKEN="$(require ZEPTO_API_TOKEN "${LANDING_ENV_FILE}")"
ADMIN_JWT_SECRET="$(require ADMIN_JWT_SECRET "${LANDING_ENV_FILE}")"
ADMIN_PASSWORD="$(require ADMIN_PASSWORD "${LANDING_ENV_FILE}")"
ANTHROPIC_API_KEY="$(require ANTHROPIC_API_KEY "${PIPELINE_ENV_FILE}")"

create_or_update_secret "supabase-anon-key"          "${SUPABASE_ANON_KEY}"
create_or_update_secret "supabase-service-role-key"  "${SUPABASE_SERVICE_ROLE_KEY}"
create_or_update_secret "zepto-api-token"            "${ZEPTO_API_TOKEN}"
create_or_update_secret "admin-jwt-secret"           "${ADMIN_JWT_SECRET}"
create_or_update_secret "admin-password"             "${ADMIN_PASSWORD}"
create_or_update_secret "anthropic-api-key"          "${ANTHROPIC_API_KEY}"

# Grant Cloud Run runtime SA access to secrets it needs.
PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for s in supabase-anon-key supabase-service-role-key zepto-api-token admin-jwt-secret admin-password anthropic-api-key; do
  gcloud secrets add-iam-policy-binding "${s}" \
    --member="serviceAccount:${COMPUTE_SA}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet >/dev/null
done
ok "Compute SA can access secrets"

# ─── 4. Delegate landing deploy ──────────────────────────────────────────
say "Delegating landing deploy"
bash "${SCRIPT_DIR}/deploy-landing.sh"

# ─── 5. Delegate pipeline deploy ─────────────────────────────────────────
say "Delegating pipeline deploy"
bash "${SCRIPT_DIR}/deploy-pipeline.sh"

# ─── 6. Cloud Scheduler ──────────────────────────────────────────────────
say "Scheduler service account"
if ! gcloud iam service-accounts describe \
    "${SCHEDULER_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" >/dev/null 2>&1; then
  gcloud iam service-accounts create "${SCHEDULER_SA_NAME}" \
    --display-name="Apulia weekly newsletter scheduler" \
    --quiet
  ok "Created"
else
  ok "Already exists"
fi
SCHEDULER_SA="${SCHEDULER_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Allow scheduler SA to invoke the job
gcloud run jobs add-iam-policy-binding "${PIPELINE_JOB}" \
  --region "${REGION}" \
  --member "serviceAccount:${SCHEDULER_SA}" \
  --role "roles/run.invoker" \
  --quiet >/dev/null
ok "Scheduler SA can invoke the job"

say "Cloud Scheduler trigger (Sundays 15:00 Europe/Rome)"
JOB_URI="https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJECT_ID}/jobs/${PIPELINE_JOB}:run"

SCHED_FLAGS=(
  --location "${REGION}"
  --schedule "0 15 * * 0"
  --time-zone "Europe/Rome"
  --uri "${JOB_URI}"
  --http-method POST
  --oauth-service-account-email "${SCHEDULER_SA}"
  --quiet
)

if gcloud scheduler jobs describe "${SCHEDULER_JOB}" --location "${REGION}" >/dev/null 2>&1; then
  gcloud scheduler jobs update http "${SCHEDULER_JOB}" "${SCHED_FLAGS[@]}"
  ok "Updated"
else
  gcloud scheduler jobs create http "${SCHEDULER_JOB}" "${SCHED_FLAGS[@]}"
  ok "Created"
fi

# ─── Done ────────────────────────────────────────────────────────────────
LANDING_URL="$(gcloud run services describe "${LANDING_SERVICE}" --region "${REGION}" --format='value(status.url)')"

cat <<EOF

────────────────────────────────────────────────────────────────────────
  All set.

  Landing:  ${LANDING_URL}
  Job:      ${PIPELINE_JOB} (region ${REGION})
  Schedule: Sundays 15:00 Europe/Rome
            → next trigger via gcloud scheduler jobs describe ${SCHEDULER_JOB} --location ${REGION}

  Manual test run:
    gcloud run jobs execute ${PIPELINE_JOB} --region ${REGION} --args=--dry-run

  Watch logs:
    gcloud beta run jobs executions list --job ${PIPELINE_JOB} --region ${REGION}
    gcloud beta run services logs tail ${LANDING_SERVICE} --region ${REGION}

  To map apulia.ai → ${LANDING_SERVICE}:
    gcloud run domain-mappings create --service ${LANDING_SERVICE} \\
      --domain apulia.ai --region ${REGION}
────────────────────────────────────────────────────────────────────────
EOF
