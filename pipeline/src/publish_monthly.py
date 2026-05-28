"""Pubblica il Briefing Strategico Mensile su Supabase."""

from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from supabase import Client, create_client

from .pipeline_monthly import MonthlyBrief


@dataclass
class PublishedMonthlyIssue:
    issue_id: str
    pdf_url: str
    issue_number: int


def _client() -> Client:
    url = (os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or "").strip()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or not key:
        raise RuntimeError("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere impostati")
    return create_client(url, key)


def _upload_pdf(supabase: Client, local: Path, remote: str) -> str:
    with open(local, "rb") as fh:
        data = fh.read()
    supabase.storage.from_("apulia-archive").upload(
        path=remote,
        file=data,
        file_options={"content-type": "application/pdf", "upsert": "true"},
    )
    result = supabase.storage.from_("apulia-archive").create_signed_url(remote, 60 * 60 * 24 * 30)
    return result.get("signedURL") or result.get("signedUrl") or ""


def _get_next_issue_number(supabase: Client) -> int:
    result = (
        supabase.table("newsletter_issues")
        .select("issue_number")
        .eq("type", "monthly")
        .order("issue_number", desc=True)
        .limit(1)
        .execute()
    )
    rows = result.data or []
    return 1 if not rows else int(rows[0]["issue_number"]) + 1


def publish_monthly(brief: MonthlyBrief, html_path: Path, pdf_path: Path) -> PublishedMonthlyIssue:
    supabase = _client()
    month_str = datetime.now(timezone.utc).strftime("%Y-%m")
    remote_path = f"monthly/{month_str}/{pdf_path.name}"

    print(f"[publish_monthly] caricamento {pdf_path.name} -> apulia-archive/{remote_path}")
    pdf_url = _upload_pdf(supabase, pdf_path, remote_path)

    html_content = html_path.read_text(encoding="utf-8")
    issue_number = _get_next_issue_number(supabase)
    slug = f"monthly-{month_str}"

    row = {
        "type": "monthly",
        "issue_number": issue_number,
        "title": f"{brief.title} — {brief.reporting_period}",
        "title_en": f"Monthly Strategic Brief — {brief.reporting_period_en}",
        "slug": slug,
        "dek": brief.tagline,
        "dek_en": "In-depth strategic analysis of AI in Europe and Italy",
        "html_content": html_content,
        "pdf_url": pdf_url,
        "status": "published",
        "published_at": datetime.now(timezone.utc).isoformat(),
    }

    print(f"[publish_monthly] upsert newsletter_issues — monthly #{issue_number} ({month_str})")
    upserted = (
        supabase.table("newsletter_issues")
        .upsert(row, on_conflict="slug")
        .execute()
    )
    issue_id = upserted.data[0]["id"]
    print(f"[publish_monthly] completato — issue_id={issue_id}")
    return PublishedMonthlyIssue(issue_id=issue_id, pdf_url=pdf_url, issue_number=issue_number)
