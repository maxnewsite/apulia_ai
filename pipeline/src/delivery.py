"""Dispatcher di consegna newsletter apulia.ai.

Dopo la pubblicazione, recupera tutti gli iscritti attivi da Supabase e
invia il PDF via email (ZeptoMail). I subscriber con products='monthly'
non ricevono la weekly e viceversa.
"""

from __future__ import annotations

import base64
import os
import re
from dataclasses import dataclass
from pathlib import Path

import httpx
from supabase import Client, create_client


@dataclass
class Subscriber:
    sub_id: str
    email: str
    preferred_language: str  # 'it' | 'en'
    products: list[str]      # ['weekly'], ['monthly'], ['weekly', 'monthly']


def _client() -> Client:
    url = (os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or "").strip()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or not key:
        raise RuntimeError("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere impostati")
    return create_client(url, key)


def _fetch_subscribers(supabase: Client, product_type: str) -> list[Subscriber]:
    """Recupera iscritti attivi per un dato tipo di prodotto."""
    rows = (
        supabase.table("subscribers")
        .select("id,email,preferred_language,products")
        .eq("status", "active")
        .execute()
        .data
    ) or []

    out: list[Subscriber] = []
    for r in rows:
        products = r.get("products") or []
        if product_type in products or "both" in products:
            out.append(
                Subscriber(
                    sub_id=r["id"],
                    email=r.get("email") or "",
                    preferred_language=r.get("preferred_language") or "it",
                    products=products,
                )
            )
    return out


def _parse_from_email(raw: str) -> tuple[str, str]:
    m = re.match(r"^(.+?)\s*<([^>]+)>$", raw.strip())
    if m:
        return m.group(2).strip(), m.group(1).strip()
    return raw.strip(), ""


def _build_email_body(lang: str, reporting_period: str, issue_type: str) -> str:
    if lang == "en":
        product_name = "AI Europa Weekly" if issue_type == "weekly" else "Strategic Monthly Brief"
        return (
            f'<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; '
            f'color: #0a1628; line-height: 1.7;">'
            f"<p>Your <strong>{product_name}</strong> for <em>{reporting_period}</em> is attached as a PDF.</p>"
            f'<p>Browse past issues and the archive at '
            f'<a href="https://apulia.ai" style="color: #1e40af;">apulia.ai</a>.</p>'
            f'<p style="color: #64748b; margin-top: 24px; font-size: 13px;">'
            f'You received this because you subscribed to apulia.ai. '
            f'<a href="https://apulia.ai/unsubscribe" style="color: #64748b;">Unsubscribe</a>.</p>'
            f"</div>"
        )
    # Default: italiano
    product_name = "AI Europa Weekly" if issue_type == "weekly" else "Briefing Strategico Mensile"
    return (
        f'<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; '
        f'color: #0a1628; line-height: 1.7;">'
        f"<p>La tua <strong>{product_name}</strong> per il periodo <em>{reporting_period}</em> è allegata in PDF.</p>"
        f'<p>Consulta le edizioni precedenti su '
        f'<a href="https://apulia.ai" style="color: #1e40af;">apulia.ai</a>.</p>'
        f'<p style="color: #64748b; margin-top: 24px; font-size: 13px;">'
        f'Hai ricevuto questa email perché sei iscritto ad apulia.ai. '
        f'<a href="https://apulia.ai/unsubscribe" style="color: #64748b;">Cancella iscrizione</a>.</p>'
        f"</div>"
    )


def _send_email_zeptomail(
    to: str,
    subject: str,
    html_body: str,
    pdf_path: Path,
) -> bool:
    token = os.environ.get("ZEPTO_API_KEY", "").strip()
    from_email = os.environ.get("ZEPTO_FROM_EMAIL", "noreply@apulia.ai").strip()
    from_name = os.environ.get("ZEPTO_FROM_NAME", "apulia.ai").strip()

    if not token:
        print(f"  [email] saltato {to}: ZEPTO_API_KEY non impostato")
        return False

    pdf_b64 = base64.b64encode(pdf_path.read_bytes()).decode()

    payload = {
        "from": {"address": from_email, "name": from_name},
        "to": [{"email_address": {"address": to, "name": ""}}],
        "subject": subject,
        "htmlbody": html_body,
        "attachments": [
            {"name": pdf_path.name, "content": pdf_b64, "mime_type": "application/pdf"}
        ],
    }
    try:
        r = httpx.post(
            "https://api.zeptomail.com/v1.1/email",
            headers={
                "Authorization": token,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json=payload,
            timeout=30.0,
        )
        if r.status_code >= 300:
            print(f"  [email] ERRORE {to}: {r.status_code} {r.text[:200]}")
            return False
        return True
    except httpx.HTTPError as e:
        print(f"  [email] ERRORE {to}: {e}")
        return False


def _log_send(supabase: Client, issue_id: str, subscriber_id: str, ok: bool) -> None:
    """Registra l'invio nella tabella email_sends."""
    try:
        supabase.table("email_sends").insert({
            "issue_id": issue_id,
            "subscriber_id": subscriber_id,
            "status": "sent" if ok else "bounced",
        }).execute()
    except Exception as e:
        print(f"  [log] impossibile registrare invio: {e}")


def deliver(
    pdf_path: Path,
    issue_id: str,
    issue_type: str,
    reporting_period: str,
) -> dict:
    """Invia il brief a tutti gli iscritti attivi. Restituisce conteggi."""
    supabase = _client()
    subs = _fetch_subscribers(supabase, issue_type)
    print(f"[deliver] {len(subs)} iscritti per '{issue_type}'")

    counts = {"sent": 0, "failed": 0, "skipped": 0}

    if issue_type == "weekly":
        subject_it = f"AI Europa Weekly — {reporting_period}"
        subject_en = f"AI Europa Weekly — {reporting_period}"
    else:
        subject_it = f"Briefing Strategico Mensile — {reporting_period}"
        subject_en = f"Monthly Strategic Brief — {reporting_period}"

    for s in subs:
        if not s.email:
            counts["skipped"] += 1
            continue

        lang = s.preferred_language
        subject = subject_en if lang == "en" else subject_it
        html_body = _build_email_body(lang, reporting_period, issue_type)

        ok = _send_email_zeptomail(s.email, subject, html_body, pdf_path)
        _log_send(supabase, issue_id, s.sub_id, ok)
        counts["sent" if ok else "failed"] += 1

    print(f"[deliver] inviati={counts['sent']} falliti={counts['failed']} saltati={counts['skipped']}")
    return counts
