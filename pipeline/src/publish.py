"""Pubblica una newsletter generata su Supabase.

Carica il PDF nello storage, aggiorna html_content nella colonna del DB,
fa upsert sulla tabella newsletter_issues.
"""

from __future__ import annotations

import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from supabase import Client, create_client

from .pipeline import Newsletter


@dataclass
class PublishedIssue:
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
    # Genera URL pubblico firmato (7 giorni) — il bucket è privato
    result = supabase.storage.from_("apulia-archive").create_signed_url(remote, 60 * 60 * 24 * 7)
    return result.get("signedURL") or result.get("signedUrl") or ""


def _get_next_issue_number(supabase: Client, issue_type: str) -> int:
    result = (
        supabase.table("newsletter_issues")
        .select("issue_number")
        .eq("type", issue_type)
        .order("issue_number", desc=True)
        .limit(1)
        .execute()
    )
    rows = result.data or []
    if not rows:
        return 1
    return int(rows[0]["issue_number"]) + 1


def publish(nl: Newsletter, html_path: Path, pdf_path: Path) -> PublishedIssue:
    """Carica artefatti e fa upsert sulla riga newsletter_issues."""
    supabase = _client()
    issue_type = nl.cadence  # "weekly"

    # Upload PDF
    remote_path = f"{issue_type}/{nl.issue_date}/{pdf_path.name}"
    print(f"[publish] caricamento {pdf_path.name} -> apulia-archive/{remote_path}")
    pdf_url = _upload_pdf(supabase, pdf_path, remote_path)

    # Leggi HTML per archiviarlo inline
    html_content = html_path.read_text(encoding="utf-8")

    # Numero di edizione
    issue_number = _get_next_issue_number(supabase, issue_type)

    # Slug: "weekly-2026-05-27"
    slug = f"{issue_type}-{nl.issue_date}"

    # Titolo: "AI Europa Weekly — 20–27 maggio 2026"
    title_it = f"{nl.title} — {nl.reporting_period}"
    title_en = f"AI Europa Weekly — {nl.reporting_period}"

    # Dek (sottotitolo)
    dek_it = nl.tagline
    dek_en = "Strategic intelligence on AI in Europe and Italy"

    row = {
        "type": issue_type,
        "issue_number": issue_number,
        "title": title_it,
        "title_en": title_en,
        "slug": slug,
        "dek": dek_it,
        "dek_en": dek_en,
        "html_content": html_content,
        "pdf_url": pdf_url,
        "status": "published",
        "published_at": datetime.now(timezone.utc).isoformat(),
    }

    print(f"[publish] upsert newsletter_issues — {issue_type} #{issue_number} ({nl.issue_date})")
    upserted = (
        supabase.table("newsletter_issues")
        .upsert(row, on_conflict="slug")
        .execute()
    )
    issue_id = upserted.data[0]["id"]

    print(f"[publish] completato — issue_id={issue_id} numero={issue_number}")
    return PublishedIssue(issue_id=issue_id, pdf_url=pdf_url, issue_number=issue_number)
