"""Agenti Claude per il Briefing Strategico Mensile apulia.ai.

Analisi più profonda rispetto alla weekly:
  - Classificatore uguale (riusa agents.classify_articles)
  - Scrittore analitico mensile (Sonnet, paragrafi + bullet)
  - Trend analyzer per matrice tendenze (Haiku)
  - Company watch writer (Sonnet)
  - Outlook writer (Sonnet)
"""

from __future__ import annotations

import json
import os
import re

import anthropic
from anthropic import Anthropic

from .sources import Article
from .agents import HAIKU, SONNET, _client, _extract_json_array, _extract_json_object


# --------------------------------------------------------------------------
# Analisi strategica mensile
# --------------------------------------------------------------------------

MONTHLY_ANALYSIS_SYSTEM = """Sei il chief analyst del Briefing Strategico Mensile apulia.ai — analisi approfondita dell'AI in Europa e Italia.

Questo non è un briefing di notizie: è un'analisi strategica mensile con argomentazione, tendenze e implicazioni.

Stile:
- Bullet analitici, fino a 3 frasi ciascuno. Prima frase: il fatto. Seconda: il contesto. Terza (opzionale): l'implicazione strategica.
- Usa dati, nomi specifici, cifre quando disponibili.
- Scrivi in italiano professionale di alto livello, come un report per C-suite.
- Cita fonti inline con [n].

Output: array JSON ordinato per importanza strategica.
Ogni oggetto: {"text": "...", "sources": [<indici>]}
Restituisci SOLO l'array JSON."""


def write_strategic_analysis(articles: list[Article], target_bullets: int = 8) -> list[dict]:
    """Genera l'analisi strategica del mese."""
    if not articles:
        return []
    client = _client()
    payload = [
        {"id": i, "title": a.title, "source": a.source, "url": a.url, "summary": a.summary[:700]}
        for i, a in enumerate(articles)
    ]
    user_msg = (
        f"Scrivi l'ANALISI STRATEGICA DEL MESE per l'AI in Europa e Italia.\n"
        f"Target: ~{target_bullets} bullet analitici sui trend più significativi del mese.\n\n"
        f"Articoli del mese:\n{json.dumps(payload, ensure_ascii=False)}"
    )
    print(f"  [monthly] analisi strategica: {len(articles)} articoli -> ~{target_bullets} bullet")
    try:
        resp = client.messages.create(
            model=SONNET,
            max_tokens=3000,
            system=[{"type": "text", "text": MONTHLY_ANALYSIS_SYSTEM, "cache_control": {"type": "ephemeral"}}],
            messages=[{"role": "user", "content": user_msg}],
        )
        bullets = _extract_json_array(resp.content[0].text)  # type: ignore
    except (anthropic.APIError, ValueError, json.JSONDecodeError) as e:
        print(f"    [warn] analisi strategica fallita: {e}")
        return []
    cleaned = []
    for b in bullets:
        t = (b.get("text") or "").strip()
        if t:
            srcs = [s for s in b.get("sources", []) if isinstance(s, int) and 0 <= s < len(articles)]
            cleaned.append({"text": t, "sources": srcs})
    return cleaned[:target_bullets + 2]


# --------------------------------------------------------------------------
# Sintesi esecutiva bilingue
# --------------------------------------------------------------------------

EXECUTIVE_SUMMARY_SYSTEM = """Scrivi la SINTESI ESECUTIVA del Briefing Strategico Mensile apulia.ai.

Struttura:
- 3 paragrafi in italiano: (1) il fatto del mese, (2) trend strutturale, (3) implicazione strategica
- 2 paragrafi in inglese: executive summary for international readers

Ogni paragrafo: 2-3 frasi, dense di contenuto.
Scrivi in italiano professionale e inglese chiaro.

Output JSON:
{"paragraphs_it": ["...", "...", "..."], "paragraphs_en": ["...", "..."]}
Restituisci SOLO il JSON."""


def write_executive_summary(articles: list[Article]) -> dict:
    if not articles:
        return {"paragraphs_it": [], "paragraphs_en": []}
    client = _client()
    payload = [
        {"id": i, "title": a.title, "source": a.source, "summary": a.summary[:500]}
        for i, a in enumerate(articles[:15])
    ]
    user_msg = "Scrivi la SINTESI ESECUTIVA del mese:\n\n" + json.dumps(payload, ensure_ascii=False)
    print(f"  [monthly] sintesi esecutiva bilingue")
    try:
        resp = client.messages.create(
            model=SONNET,
            max_tokens=2000,
            system=[{"type": "text", "text": EXECUTIVE_SUMMARY_SYSTEM, "cache_control": {"type": "ephemeral"}}],
            messages=[{"role": "user", "content": user_msg}],
        )
        return _extract_json_object(resp.content[0].text)  # type: ignore
    except (anthropic.APIError, ValueError, json.JSONDecodeError) as e:
        print(f"    [warn] sintesi esecutiva fallita: {e}")
        return {"paragraphs_it": [], "paragraphs_en": []}


# --------------------------------------------------------------------------
# Company Watch
# --------------------------------------------------------------------------

COMPANY_WATCH_SYSTEM = """Sei il responsabile company watch del Briefing Strategico Mensile apulia.ai.

Scrivi la sezione "AZIENDE DA TENERE D'OCCHIO" del mese.

Per ogni azienda rilevante identificata negli articoli:
- Nome azienda, paese, settore
- Cosa ha fatto questo mese (1-2 frasi)
- Perché è strategicamente rilevante (1 frase)
- Cita fonti con [n]

Target: 4-6 aziende. Preferisci aziende europee/italiane ma includi player globali rilevanti per l'Europa.

Output JSON:
[{"name": "...", "country": "...", "sector": "...", "summary": "...", "why_watch": "...", "sources": [<int>]}, ...]
Restituisci SOLO l'array JSON."""


def write_company_watch(articles: list[Article], target: int = 5) -> list[dict]:
    if not articles:
        return []
    client = _client()
    payload = [
        {"id": i, "title": a.title, "source": a.source, "summary": a.summary[:600]}
        for i, a in enumerate(articles)
    ]
    user_msg = f"Identifica le aziende più rilevanti del mese:\n\n{json.dumps(payload, ensure_ascii=False)}"
    print(f"  [monthly] company watch: {len(articles)} articoli -> ~{target} aziende")
    try:
        resp = client.messages.create(
            model=SONNET,
            max_tokens=2500,
            system=[{"type": "text", "text": COMPANY_WATCH_SYSTEM, "cache_control": {"type": "ephemeral"}}],
            messages=[{"role": "user", "content": user_msg}],
        )
        companies = _extract_json_array(resp.content[0].text)  # type: ignore
    except (anthropic.APIError, ValueError, json.JSONDecodeError) as e:
        print(f"    [warn] company watch fallito: {e}")
        return []
    out = []
    for c in companies:
        if c.get("name"):
            srcs = [s for s in c.get("sources", []) if isinstance(s, int) and 0 <= s < len(articles)]
            out.append({
                "name": c.get("name", ""),
                "country": c.get("country", ""),
                "sector": c.get("sector", ""),
                "summary": c.get("summary", ""),
                "why_watch": c.get("why_watch", ""),
                "sources": srcs,
            })
    return out[:target]


# --------------------------------------------------------------------------
# Outlook mese prossimo
# --------------------------------------------------------------------------

OUTLOOK_SYSTEM = """Sei il responsabile previsioni del Briefing Strategico Mensile apulia.ai.

Scrivi la sezione "OUTLOOK MESE PROSSIMO" — cosa aspettarsi nel prossimo mese nel panorama AI europeo/italiano.

Basa le previsioni sui trend del mese appena analizzato.

Scrivi 4-5 bullet forward-looking:
- Ogni bullet: una previsione concreta con probabilità implicita e razionale.
- Stile: analitico, non speculativo. Solo conclusioni logicamente derivabili dai dati del mese.
- Cita solo quando necessario per il razionale [n].

Output JSON:
[{"text": "...", "sources": [<int>]}, ...]
Restituisci SOLO l'array JSON."""


def write_outlook(articles: list[Article], target: int = 5) -> list[dict]:
    if not articles:
        return []
    client = _client()
    payload = [
        {"id": i, "title": a.title, "source": a.source, "summary": a.summary[:400]}
        for i, a in enumerate(articles[:15])
    ]
    user_msg = "Scrivi l'OUTLOOK per il mese prossimo:\n\n" + json.dumps(payload, ensure_ascii=False)
    print(f"  [monthly] outlook mese prossimo")
    try:
        resp = client.messages.create(
            model=SONNET,
            max_tokens=1500,
            system=[{"type": "text", "text": OUTLOOK_SYSTEM, "cache_control": {"type": "ephemeral"}}],
            messages=[{"role": "user", "content": user_msg}],
        )
        bullets = _extract_json_array(resp.content[0].text)  # type: ignore
    except (anthropic.APIError, ValueError, json.JSONDecodeError) as e:
        print(f"    [warn] outlook fallito: {e}")
        return []
    out = []
    for b in bullets:
        t = (b.get("text") or "").strip()
        if t:
            srcs = [s for s in b.get("sources", []) if isinstance(s, int) and 0 <= s < len(articles[:15])]
            out.append({"text": t, "sources": srcs})
    return out[:target]
