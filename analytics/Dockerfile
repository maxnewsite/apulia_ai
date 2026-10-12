# Cloud Run Job image for the daily GA4 -> BigQuery pull.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY run_analytics.py ./

# Credentials come from the job's service account (no keys in the image).
ENTRYPOINT ["python", "run_analytics.py"]
