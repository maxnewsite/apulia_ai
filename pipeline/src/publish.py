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
    # Genera URL firmato di lunga durata (10 anni) — il bucket è privato ma la URL
    # viene salvata in newsletter_issues.pdf_url e servita così com'è dal sito:
    # con una scadenza breve i link dell'archivio si romperebbero.
    result = supabase.storage.from_("apulia-archive").create_signed_url(remote, 60 * 60 * 24 * 365 * 10)
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


def recent_titles(issue_type: str = "weekly", limit: int = 4) -> list[str]:
    """Titoli delle ultime edizioni pubblicate, dalla più vecchia alla più
    recente. Lista vuota se Supabase non è configurato o non risponde: serve
    solo a evitare titoli duplicati, non deve bloccare la pipeline."""
    try:
        rows = (
            _client()
            .table("newsletter_issues")
            .select("title")
            .eq("type", issue_type)
            .eq("status", "published")
            .order("issue_number", desc=True)
            .limit(limit)
            .execute()
            .data
            or []
        )
    except Exception as e:  # noqa: BLE001 — qualsiasi errore: si prosegue senza
        print(f"  [seo] titoli precedenti non disponibili: {e}")
        return []
    return [r["title"] for r in reversed(rows) if r.get("title")]


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

    # Titolo: la notizia principale ("Draghi chiede 100 miliardi per l'AI
    # europea; …"), che è ciò che la gente cerca. Il nome della newsletter e
    # il periodo sono già nella pagina (Edizione #N · data). Senza titolo SEO
    # si ripiega sul formato generico "AI Europa Weekly — 20–27 maggio 2026".
    title_it = nl.seo_headline or f"{nl.title} — {nl.reporting_period}"
    title_en = f"AI Europa Weekly — {nl.reporting_period}"

    # Dek (sottotitolo): usato anche come meta description dal sito
    dek_it = nl.seo_description or nl.tagline
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
        "lang": "it",
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
