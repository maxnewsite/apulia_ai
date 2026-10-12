"""CLI entry point: scarica i report GA4 di apulia.ai e li carica in BigQuery.

Ogni report diventa una tabella giornaliera (partizionata per data) nel
dataset BigQuery. A ogni esecuzione la finestra di date viene riscritta
(delete + append), perché GA4 continua a consolidare i dati per circa 48 ore:
rilanciare lo stesso intervallo è sempre sicuro.

Le credenziali sono quelle dell'ambiente (service account del job su Cloud
Run): nessuna chiave nel repo.

Uso:
  python run_analytics.py                                  # ultimi 3 giorni chiusi
  python run_analytics.py --days 30
  python run_analytics.py --start 2025-01-01 --end 2026-10-11   # backfill
  python run_analytics.py --dry-run                        # legge GA4, non scrive
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from datetime import date, datetime, timedelta, timezone

from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    MetricType,
    RunReportRequest,
)


PROPERTY_ID = os.environ.get("GA4_PROPERTY_ID", "541931865").strip()
DATASET = os.environ.get("BQ_DATASET", "ga4_reports").strip()
PAGE_SIZE = 100_000

# tabella -> (dimensioni oltre a `date`, metriche)
REPORTS: dict[str, tuple[list[str], list[str]]] = {
    "daily_overview": (
        [],
        ["activeUsers", "newUsers", "sessions", "engagedSessions", "screenPageViews",
         "eventCount", "keyEvents", "userEngagementDuration"],
    ),
    "traffic_sources": (
        ["sessionDefaultChannelGroup", "sessionSource", "sessionMedium"],
        ["sessions", "activeUsers", "newUsers", "engagedSessions", "keyEvents"],
    ),
    "pages": (
        ["pagePath"],
        ["screenPageViews", "activeUsers", "userEngagementDuration"],
    ),
    "landing_pages": (
        ["landingPage"],
        ["sessions", "activeUsers", "engagedSessions", "keyEvents"],
    ),
    "events": (
        ["eventName"],
        ["eventCount", "totalUsers"],
    ),
    "geo": (
        ["country", "region"],
        ["activeUsers", "sessions"],
    ),
    "devices": (
        ["deviceCategory", "operatingSystem", "browser"],
        ["activeUsers", "sessions"],
    ),
}


def _column(api_name: str) -> str:
    """sessionDefaultChannelGroup -> session_default_channel_group."""
    return re.sub(r"(?<!^)(?=[A-Z])", "_", api_name).lower()


def fetch_report(
    client: BetaAnalyticsDataClient,
    dimensions: list[str],
    metrics: list[str],
    start: date,
    end: date,
) -> tuple[list[tuple[str, str]], list[dict]]:
    """Ritorna (schema, righe). Schema: coppie (colonna, tipo BigQuery)."""
    dims = ["date", *dimensions]
    schema: list[tuple[str, str]] = []
    int_metrics: set[str] = set()
    rows: list[dict] = []
    offset = 0

    while True:
        resp = client.run_report(RunReportRequest(
            property=f"properties/{PROPERTY_ID}",
            dimensions=[Dimension(name=d) for d in dims],
            metrics=[Metric(name=m) for m in metrics],
            date_ranges=[DateRange(start_date=start.isoformat(), end_date=end.isoformat())],
            limit=PAGE_SIZE,
            offset=offset,
        ))

        if not schema:
            int_metrics = {h.name for h in resp.metric_headers if h.type_ == MetricType.TYPE_INTEGER}
            schema = [("date", "DATE")]
            schema += [(_column(d), "STRING") for d in dimensions]
            schema += [(_column(m), "INT64" if m in int_metrics else "FLOAT64") for m in metrics]
            if resp.metadata.data_loss_from_other_row:
                print("  WARN cardinalità troppo alta: parte delle righe è finita in (other)")
            if resp.metadata.subject_to_thresholding:
                print("  WARN soglie di privacy applicate: alcune righe sono state omesse da GA4")
            if resp.metadata.sampling_metadatas:
                print("  WARN report campionato da GA4")

        for row in resp.rows:
            record: dict = {}
            for name, value in zip(dims, row.dimension_values):
                if name == "date":
                    record["date"] = datetime.strptime(value.value, "%Y%m%d").date().isoformat()
                else:
                    record[_column(name)] = value.value
            for name, value in zip(metrics, row.metric_values):
                record[_column(name)] = int(value.value) if name in int_metrics else float(value.value)
            rows.append(record)

        offset += len(resp.rows)
        if not resp.rows or offset >= resp.row_count:
            return schema, rows


def write_table(bq, table_id: str, schema: list[tuple[str, str]], rows: list[dict],
                start: date, end: date) -> None:
    """Sostituisce in `table_id` le righe della finestra [start, end]."""
    from google.api_core.exceptions import NotFound
    from google.cloud import bigquery

    try:
        bq.query(
            f"DELETE FROM `{table_id}` WHERE date BETWEEN @start AND @end",
            job_config=bigquery.QueryJobConfig(query_parameters=[
                bigquery.ScalarQueryParameter("start", "DATE", start),
                bigquery.ScalarQueryParameter("end", "DATE", end),
            ]),
        ).result()
    except NotFound:
        pass  # prima esecuzione: la tabella viene creata dal load qui sotto

    if not rows:
        return
    bq.load_table_from_json(
        rows,
        table_id,
        job_config=bigquery.LoadJobConfig(
            schema=[bigquery.SchemaField(name, kind) for name, kind in schema],
            write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
            time_partitioning=bigquery.TimePartitioning(field="date"),
        ),
    ).result()


def main() -> int:
    parser = argparse.ArgumentParser(description="Scarica i report GA4 e li carica in BigQuery")
    parser.add_argument("--days", type=int, default=3,
                        help="Giorni chiusi da riscrivere, a ritroso da ieri (default: 3)")
    parser.add_argument("--start", type=date.fromisoformat,
                        help="Data iniziale AAAA-MM-GG (per il backfill; ignora --days)")
    parser.add_argument("--end", type=date.fromisoformat,
                        help="Data finale AAAA-MM-GG (default: ieri)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Legge da GA4 e stampa i conteggi, senza scrivere su BigQuery")
    args = parser.parse_args()

    # Ieri in UTC: il job gira al mattino, quando UTC e Europe/Rome coincidono come data.
    end = args.end or datetime.now(timezone.utc).date() - timedelta(days=1)
    start = args.start or end - timedelta(days=args.days - 1)
    if start > end:
        parser.error(f"intervallo vuoto: {start} > {end}")

    print(f"[analytics] property {PROPERTY_ID}, finestra {start} -> {end}"
          + (" (dry-run)" if args.dry_run else ""))

    ga = BetaAnalyticsDataClient()
    bq = None
    if not args.dry_run:
        from google.cloud import bigquery
        bq = bigquery.Client()

    for table, (dimensions, metrics) in REPORTS.items():
        print(f"[analytics] {table}")
        schema, rows = fetch_report(ga, dimensions, metrics, start, end)
        if bq is None:
            print(f"  {len(rows)} righe" + (f", es. {rows[0]}" if rows else ""))
            continue
        table_id = f"{bq.project}.{DATASET}.{table}"
        write_table(bq, table_id, schema, rows, start, end)
        print(f"  {len(rows)} righe -> {table_id}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
