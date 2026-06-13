# Cloud Run Job image for the weekly newsletter pipeline.
# Playwright base image ships Chromium + the system libs needed for PDF rendering.
FROM mcr.microsoft.com/playwright/python:v1.59.0-jammy

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Cloud Run job entry point: regenerates the weekly issue, publishes to
# Supabase, sends via Zepto. All credentials come from env vars / Secret
# Manager (no .env baked into the image).
COPY . .

# Ensure output/cache dirs exist and are writable
RUN mkdir -p output cache

# Cloud Run jobs invoke this directly; --dry-run can be passed when triggering
# manually for safety.
ENTRYPOINT ["python", "run_weekly.py"]
