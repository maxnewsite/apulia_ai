# Deploying apulia.ai

Two deployables:

| Component | Type            | Trigger                  | Image            |
|-----------|-----------------|--------------------------|------------------|
| `landing` | Cloud Run **service** | HTTP (always-on)      | `landing/Dockerfile`  |
| `pipeline`| Cloud Run **job**     | Cloud Scheduler (weekly) | `pipeline/Dockerfile` |

The two share the same Supabase project and the same Zepto credentials, but
**not** the same revision lifecycle: the pipeline can be rebuilt and re-run
without touching the website.

---

## 0. Prerequisites

```bash
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT
gcloud services enable run.googleapis.com cloudscheduler.googleapis.com \
  artifactregistry.googleapis.com secretmanager.googleapis.com
```

Pick a region close to your Supabase project. We use `europe-west1` below.

---

## 1. Create Supabase storage bucket

In the Supabase dashboard (project `amkixorrowqbgohzopvi`):

1. **Storage → New bucket** → name `apulia-archive`, **Private**.
2. The pipeline uploads PDFs here and the publish step writes a 7-day signed
   URL into `newsletter_issues.pdf_url`. The archive page reads `html_content`
   directly, so the bucket can stay private.

---

## 2. Store secrets in Secret Manager

```bash
# Supabase
printf "%s" "<SUPABASE_SERVICE_ROLE_KEY>" | \
  gcloud secrets create supabase-service-role-key --data-file=-

printf "%s" "<NEXT_PUBLIC_SUPABASE_ANON_KEY>" | \
  gcloud secrets create supabase-anon-key --data-file=-

# Zepto — note the "Zoho-enczapikey " prefix is part of the token
printf "%s" "Zoho-enczapikey wSsVR60lrBLxDfx8ymKoL78/zFlcD1ynEE1+3Qah7yeoTK/D/cdvw0CYUQ+vT/cWGWZoEjAXou8uy01UhjAKiY8rn18DDSiF9mqRe1U4J3x17qnvhDzKXGldkheAK4sMwQptmGVlFM8m+g==" | \
  gcloud secrets create zepto-api-token --data-file=-

# Anthropic (pipeline only)
printf "%s" "<ANTHROPIC_API_KEY>" | \
  gcloud secrets create anthropic-api-key --data-file=-

# Admin auth (landing only)
printf "%s" "<ADMIN_JWT_SECRET>" | \
  gcloud secrets create admin-jwt-secret --data-file=-
printf "%s" "<ADMIN_PASSWORD>" | \
  gcloud secrets create admin-password --data-file=-
```

---

## 3. Deploy the landing (Cloud Run service)

Build & push to Artifact Registry:

```bash
gcloud artifacts repositories create apulia \
  --repository-format=docker --location=europe-west1 || true

gcloud builds submit landing \
  --tag europe-west1-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/apulia/landing:latest \
  --substitutions=_NEXT_PUBLIC_SUPABASE_URL=https://amkixorrowqbgohzopvi.supabase.co
```

> The `NEXT_PUBLIC_SUPABASE_URL` and anon key must be available at **build
> time** because `generateStaticParams()` prerenders archive pages.
> Use `--build-arg` if you call `docker build` directly.

Deploy:

```bash
gcloud run deploy apulia-landing \
  --image europe-west1-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/apulia/landing:latest \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --min-instances 0 --max-instances 5 \
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL=https://amkixorrowqbgohzopvi.supabase.co \
  --set-env-vars NEXT_PUBLIC_APP_URL=https://apulia.ai \
  --set-env-vars ZEPTO_API_HOST=api.zeptomail.com \
  --set-env-vars ZEPTO_FROM_EMAIL_CONFIRM=noreply@apulia.ai \
  --set-env-vars ZEPTO_FROM_EMAIL_ISSUES=newsletter@apulia.ai \
  --set-env-vars ZEPTO_FROM_NAME=apulia.ai \
  --set-env-vars ADMIN_EMAIL=max@kalym.me \
  --set-secrets NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase-anon-key:latest \
  --set-secrets SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest \
  --set-secrets ZEPTO_API_TOKEN=zepto-api-token:latest \
  --set-secrets ADMIN_JWT_SECRET=admin-jwt-secret:latest \
  --set-secrets ADMIN_PASSWORD=admin-password:latest
```

Map your domain after first deploy:

```bash
gcloud run domain-mappings create --service apulia-landing \
  --domain apulia.ai --region europe-west1
```

---

## 4. Deploy the pipeline (Cloud Run job)

Build:

```bash
gcloud builds submit pipeline \
  --tag europe-west1-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/apulia/pipeline:latest
```

Create the job:

```bash
gcloud run jobs create apulia-weekly \
  --image europe-west1-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/apulia/pipeline:latest \
  --region europe-west1 \
  --max-retries 1 \
  --task-timeout 30m \
  --memory 2Gi --cpu 2 \
  --set-env-vars SUPABASE_URL=https://amkixorrowqbgohzopvi.supabase.co \
  --set-env-vars APP_URL=https://apulia.ai \
  --set-env-vars ZEPTO_API_HOST=api.zeptomail.com \
  --set-env-vars ZEPTO_FROM_EMAIL_ISSUES=newsletter@apulia.ai \
  --set-env-vars ZEPTO_FROM_NAME=apulia.ai \
  --set-secrets SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest \
  --set-secrets ZEPTO_API_TOKEN=zepto-api-token:latest \
  --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest
```

Update (subsequent deploys): replace `create` with `update`.

Run once manually before scheduling:

```bash
gcloud run jobs execute apulia-weekly --region europe-west1 \
  --args="--dry-run"   # generates HTML/PDF but doesn't publish or send
```

When dry-run looks good:

```bash
gcloud run jobs execute apulia-weekly --region europe-west1
```

---

## 5. Schedule the weekly run

```bash
gcloud scheduler jobs create http apulia-weekly-trigger \
  --location europe-west1 \
  --schedule="0 15 * * 0" \
  --time-zone="Europe/Rome" \
  --uri="https://europe-west1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/$GOOGLE_CLOUD_PROJECT/jobs/apulia-weekly:run" \
  --http-method=POST \
  --oauth-service-account-email="<SCHEDULER_SA>@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com"
```

Sundays at 15:00 Europe/Rome. The scheduler service account needs
`roles/run.invoker` on the job.

---

## 6. Local development checklist

```bash
# 1. Schema applied to amkixorrowqbgohzopvi.supabase.co? (see supabase/schema.sql)
# 2. apulia-archive bucket exists?
# 3. landing/.env.local populated?
# 4. pipeline/.env populated?

# Landing
cd landing && npm install && npm run dev   # http://localhost:3000

# Pipeline — dry run first
cd pipeline && python -m venv .venv && . .venv/Scripts/activate
pip install -r requirements.txt
playwright install chromium
python run_weekly.py --dry-run             # generates HTML+PDF only
python run_weekly.py                       # publishes + sends to active subscribers
```

Smoke test the subscribe → confirm → archive → unsubscribe loop with
your own email before pointing the pipeline at the real subscriber list.

---

## 7. From local → GitHub → Cloud Run

```bash
git remote add origin git@github.com:<you>/apulia-ai.git
git push -u origin master
```

Then configure a Cloud Build trigger on `master` that runs:
- `gcloud builds submit landing  --tag .../landing:$SHORT_SHA`
- `gcloud builds submit pipeline --tag .../pipeline:$SHORT_SHA`
- `gcloud run deploy apulia-landing --image .../landing:$SHORT_SHA ...`
- `gcloud run jobs update apulia-weekly --image .../pipeline:$SHORT_SHA ...`

Keep `.env`, `.env.local`, and `node_modules` out of the repo (already
covered by the existing `.gitignore`).
