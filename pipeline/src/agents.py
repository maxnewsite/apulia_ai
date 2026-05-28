"""Claude agents per la pipeline newsletter settimanale apulia.ai.

Tre ruoli:
  - Classificatore (Haiku, batch): etichetta ogni articolo con paese, tema,
    capacità e importanza.
  - Scrittore di sezione (Sonnet): trasforma gli articoli in bullet bilingui
    (italiano principale, inglese per la sezione executive summary).
  - Grader matrice (Haiku): valuta ogni cella paese × capacità.

I system prompt usano prompt caching per ridurre i costi nelle chiamate ripetute.
"""

from __future__ import annotations

import json
import os
import re
from typing import Iterable

import anthropic
from anthropic import Anthropic

from .sources import Article


HAIKU = "claude-haiku-4-5-20251001"
SONNET = "claude-sonnet-4-6"


COUNTRIES = [
    "Italia", "Francia", "Germania", "Spagna", "Paesi Bassi",
    "Svezia", "Regno Unito", "Polonia", "Unione Europea",
]

THEMES = [
    "key_dev",      # annuncio maggiore, accordo strategico, evento di rilievo
    "normativo",    # AI Act, regolamenti nazionali, policy UE
    "compute",      # data center, cloud, infrastruttura sovrana
    "incident",     # incidente AI, deepfake, violazione, rischio
    "funding",      # round VC, IPO, acquisizione, valutazione
    "research",     # paper, rilascio modello, laboratori, università
    "policy",       # strategia governo, MoU, piano nazionale AI
]

CAPABILITIES = [
    "Modelli AI Fondazionali",
    "Cloud & Data Center",
    "AI Sanitaria",
    "AI Difesa & Sicurezza",
    "AI FinTech",
    "Ricerca & Università",
]


def _client() -> Anthropic:
    key = (os.environ.get("ANTHROPIC_API_KEY") or "").strip()
    if not key:
        raise RuntimeError("ANTHROPIC_API_KEY is not set")
    return Anthropic(api_key=key)


# --------------------------------------------------------------------------
# JSON helpers
# --------------------------------------------------------------------------

def _extract_json_array(text: str):
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1:
        raise ValueError(f"no JSON array in response: {text[:300]}")
    return json.loads(text[start : end + 1])


def _extract_json_object(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError(f"no JSON object in response: {text[:300]}")
    return json.loads(text[start : end + 1])


# --------------------------------------------------------------------------
# Classificatore
# --------------------------------------------------------------------------

CLASSIFIER_SYSTEM = f"""Sei il classificatore della pipeline newsletter apulia.ai sull'AI in Europa e Italia.

Per ogni articolo in input restituisci un oggetto JSON. Gli articoli provengono da fonti europee/italiane già pre-filtrate per rilevanza AI — quindi la maggior parte NON deve essere skippata.

Paesi ammessi (usa le stringhe esatte, più valori consentiti): {COUNTRIES}
Temi ammessi (usa le stringhe esatte, più valori consentiti): {THEMES}
Capacità ammesse (una o nessuna, stringa esatta): {CAPABILITIES}

Regole per i temi:
- `key_dev`: annuncio strategico rilevante, deal >€20M, strategia nazionale/regionale, partnership importante.
- `funding`: round VC/IPO/acquisizione (anche senza cifra se il tipo di deal è chiaro).
- `incident`: uso improprio AI, deepfake, violazioni, attacchi cyber AI-potenziati.
- `compute`: data center, cloud region, cloud sovrano, supercomputer, GPU farm.
- `normativo`: EU AI Act, regolamentazione nazionale AI, framework normativi, compliance.
- `policy`: strategia governativa AI, piani nazionali, dichiarazioni ministeriali, MoU.
- `research`: paper, rilascio modelli, lab AI, università, CINECA, IIT, Fondazione Bruno Kessler.

Regole per i paesi:
- Etichetta i paesi chiaramente menzionati come soggetto principale o come sede dell'attività.
- Se l'articolo parla di una società italiana, etichetta "Italia" anche se il paese non è esplicitamente nominato nel titolo.
- Se riguarda policy UE, etichetta "Unione Europea".

Regola per skip:
- Imposta "skip": true SOLO se l'articolo non ha NESSUN collegamento con AI in Europa/Italia.
- Articoli su AI globale (es. annunci OpenAI/Google senza angolo europeo) → skip: true.
- Articoli da fonti europee su AI in qualsiasi settore europeo → skip: false.
- In caso di dubbio, skip: false è preferibile a skip: true.

importance 1-5: 1=notizia minore, 3=buona notizia di settore, 5=prima pagina Il Sole 24 Ore.

Formato output: array JSON, uno per articolo, stesso ordine.
{{"id": <int>, "skip": <bool>, "countries": [...], "themes": [...], "capability": "<stringa o null>", "importance": <int 1-5>}}

Restituisci SOLO l'array JSON. Niente prosa. Niente markdown fence."""


def classify_articles(articles: list[Article], batch_size: int = 25) -> list[dict]:
    """Restituisce una lista di dict di classificazione allineata ad `articles`."""
    client = _client()
    out: list[dict] = [None] * len(articles)  # type: ignore

    for batch_start in range(0, len(articles), batch_size):
        batch = articles[batch_start : batch_start + batch_size]
        payload = [
            {
                "id": i,
                "title": a.title,
                "source": a.source,
                "summary": a.summary[:400],
            }
            for i, a in enumerate(batch)
        ]
        user_msg = "Classifica questi articoli:\n\n" + json.dumps(payload, ensure_ascii=False)

        batch_num = batch_start // batch_size + 1
        print(f"  [classify] batch {batch_num}: {len(batch)} articoli")
        try:
            resp = client.messages.create(
                model=HAIKU,
                max_tokens=4096,
                system=[
                    {
                        "type": "text",
                        "text": CLASSIFIER_SYSTEM,
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
                messages=[{"role": "user", "content": user_msg}],
            )
            text = resp.content[0].text  # type: ignore
            results = _extract_json_array(text)
            kept = sum(1 for r in results if not r.get("skip", True))
            print(f"    [classify] batch {batch_num}: {kept}/{len(batch)} tenuti")
        except anthropic.APIError as e:
            print(f"    [ERROR] classify batch {batch_num} API error: {e}")
            results = [{"id": i, "skip": True} for i in range(len(batch))]
        except (ValueError, json.JSONDecodeError) as e:
            print(f"    [ERROR] classify batch {batch_num} JSON parse error: {e}")
            results = [{"id": i, "skip": True} for i in range(len(batch))]

        seen = set()
        for r in results:
            local_id = r.get("id")
            if not isinstance(local_id, int) or local_id < 0 or local_id >= len(batch):
                continue
            if local_id in seen:
                continue
            seen.add(local_id)
            out[batch_start + local_id] = {
                "skip": bool(r.get("skip", False)),
                "countries": [c for c in r.get("countries", []) if c in COUNTRIES],
                "themes": [t for t in r.get("themes", []) if t in THEMES],
                "capability": r.get("capability") if r.get("capability") in CAPABILITIES else None,
                "importance": int(r.get("importance", 1)) if isinstance(r.get("importance"), (int, float)) else 1,
            }
        for i in range(len(batch)):
            if out[batch_start + i] is None:
                out[batch_start + i] = {"skip": True, "countries": [], "themes": [], "capability": None, "importance": 1}

    return out  # type: ignore


# --------------------------------------------------------------------------
# Scrittore di sezione (italiano)
# --------------------------------------------------------------------------

WRITER_SYSTEM_IT = """Sei il redattore della newsletter settimanale apulia.ai — briefing strategico sull'AI in Europa e Italia.

Regole di stile (voce italiana):
- Ogni bullet è UNA frase, massimo ~40 parole. Due frasi solo se la seconda aggiunge contesto critico.
- Inizia con il soggetto e l'azione. Tempo passato. Nomi specifici, cifre, date.
- Niente parole di marketing ("rivoluzionario", "innovativo", "entusiasmante"). Solo fatti.
- Se più fonti coprono lo stesso evento, scrivi UN solo bullet che le sintetizza.
- Non inventare dettagli non presenti negli articoli forniti.
- Cita le fonti inline con marcatori [n] che corrispondono all'ordine degli articoli forniti.
- Scrivi in italiano corretto, professionale, stile giornalistico.

Formato output: array JSON di bullet, ordinati per importanza (prima il più importante).
Ogni oggetto: {"text": "...", "sources": [<indici articoli usati>]}
Restituisci SOLO l'array JSON. Niente prosa. Niente markdown fence."""


def write_section(section_name: str, articles: list[Article], target_bullets: int = 6) -> list[dict]:
    """Genera i bullet per una sezione in italiano."""
    if not articles:
        return []

    client = _client()
    payload = [
        {"id": i, "title": a.title, "source": a.source, "url": a.url, "summary": a.summary[:600]}
        for i, a in enumerate(articles)
    ]
    user_msg = (
        f"Sezione: {section_name}\n"
        f"Target: ~{target_bullets} bullet (meno va bene se il materiale non lo giustifica).\n\n"
        f"Articoli sorgente:\n{json.dumps(payload, ensure_ascii=False)}"
    )

    print(f"  [write] {section_name}: {len(articles)} articoli -> ~{target_bullets} bullet")
    try:
        resp = client.messages.create(
            model=SONNET,
            max_tokens=2048,
            system=[
                {
                    "type": "text",
                    "text": WRITER_SYSTEM_IT,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": user_msg}],
        )
        text = resp.content[0].text  # type: ignore
        bullets = _extract_json_array(text)
    except (anthropic.APIError, ValueError, json.JSONDecodeError) as e:
        print(f"    [warn] write {section_name} fallito: {e}")
        return []

    cleaned: list[dict] = []
    for b in bullets:
        text_v = (b.get("text") or "").strip()
        if not text_v:
            continue
        srcs = [s for s in b.get("sources", []) if isinstance(s, int) and 0 <= s < len(articles)]
        cleaned.append({"text": text_v, "sources": srcs})
    return cleaned[: target_bullets + 2]


# --------------------------------------------------------------------------
# Scrittore sezione normativa (specializzato EU AI Act)
# --------------------------------------------------------------------------

REGULATORY_WRITER_SYSTEM = """Sei il responsabile normativo della newsletter apulia.ai, specializzato nell'EU AI Act e nelle policy nazionali sull'AI in Europa.

Regole di stile:
- Ogni bullet è UNA frase precisa, massimo ~45 parole.
- Includi sempre: quale norma/articolo/fase è coinvolto, quale paese/istituzione agisce, quale impatto concreto.
- Per l'EU AI Act indica esplicitamente la fase (entrata in vigore, applicazione per categoria di rischio, deadline, enforcement).
- Stile: analitico, preciso, professionale. Italiano corretto.
- Cita le fonti inline con [n].

Formato output: array JSON ordinato per rilevanza normativa.
Ogni oggetto: {"text": "...", "sources": [<indici>]}
Restituisci SOLO l'array JSON."""


def write_regulatory_section(articles: list[Article], target_bullets: int = 5) -> list[dict]:
    """Genera i bullet della sezione Radar Normativo."""
    if not articles:
        return []

    client = _client()
    payload = [
        {"id": i, "title": a.title, "source": a.source, "url": a.url, "summary": a.summary[:600]}
        for i, a in enumerate(articles)
    ]
    user_msg = (
        f"Sezione: RADAR NORMATIVO — EU AI Act e policy nazionali\n"
        f"Target: ~{target_bullets} bullet.\n\n"
        f"Articoli sorgente:\n{json.dumps(payload, ensure_ascii=False)}"
    )

    print(f"  [write] RADAR NORMATIVO: {len(articles)} articoli -> ~{target_bullets} bullet")
    try:
        resp = client.messages.create(
            model=SONNET,
            max_tokens=2048,
            system=[
                {
                    "type": "text",
                    "text": REGULATORY_WRITER_SYSTEM,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": user_msg}],
        )
        text = resp.content[0].text  # type: ignore
        bullets = _extract_json_array(text)
    except (anthropic.APIError, ValueError, json.JSONDecodeError) as e:
        print(f"    [warn] write RADAR NORMATIVO fallito: {e}")
        return []

    cleaned: list[dict] = []
    for b in bullets:
        text_v = (b.get("text") or "").strip()
        if not text_v:
            continue
        srcs = [s for s in b.get("sources", []) if isinstance(s, int) and 0 <= s < len(articles)]
        cleaned.append({"text": text_v, "sources": srcs})
    return cleaned[: target_bullets + 2]


# --------------------------------------------------------------------------
# English Executive Summary writer
# --------------------------------------------------------------------------

ENGLISH_SUMMARY_SYSTEM = """You write the English Executive Summary section of the apulia.ai newsletter — a weekly strategic briefing on AI in Europe and Italy.

Your audience: international readers (non-Italian speakers), CTOs, investors, and policy makers interested in the European AI landscape.

Rules:
- Write 5 bullets in clear, professional English.
- Each bullet: ONE sentence, max ~40 words. Lead with the actor and action, past tense.
- Cover the week's most important developments across: regulation (EU AI Act), Italian AI ecosystem, European funding, research, and infrastructure.
- No hype words. State facts with specifics (names, numbers, countries).
- Cite sources inline with [n] markers.

Output format: JSON array ordered by strategic importance.
Each object: {"text": "...", "sources": [<int article indices>]}
Return ONLY the JSON array. No prose. No markdown fences."""


def write_english_summary(articles: list[Article], target_bullets: int = 5) -> list[dict]:
    """Genera i bullet dell'Executive Summary in inglese."""
    if not articles:
        return []

    client = _client()
    # Use top importance articles across all sections
    payload = [
        {"id": i, "title": a.title, "source": a.source, "url": a.url, "summary": a.summary[:600]}
        for i, a in enumerate(articles[:20])
    ]
    user_msg = (
        f"Write the English Executive Summary for this week's apulia.ai newsletter.\n"
        f"Target: {target_bullets} bullets covering the most strategically important EU/Italy AI developments.\n\n"
        f"Source articles:\n{json.dumps(payload, ensure_ascii=False)}"
    )

    print(f"  [write] ENGLISH SUMMARY: {len(articles[:20])} articoli -> {target_bullets} bullet EN")
    try:
        resp = client.messages.create(
            model=SONNET,
            max_tokens=1500,
            system=[
                {
                    "type": "text",
                    "text": ENGLISH_SUMMARY_SYSTEM,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": user_msg}],
        )
        text = resp.content[0].text  # type: ignore
        bullets = _extract_json_array(text)
    except (anthropic.APIError, ValueError, json.JSONDecodeError) as e:
        print(f"    [warn] write ENGLISH SUMMARY fallito: {e}")
        return []

    cleaned: list[dict] = []
    for b in bullets:
        text_v = (b.get("text") or "").strip()
        if not text_v:
            continue
        srcs = [s for s in b.get("sources", []) if isinstance(s, int) and 0 <= s < len(articles[:20])]
        cleaned.append({"text": text_v, "sources": srcs})
    return cleaned[:target_bullets + 1]


# --------------------------------------------------------------------------
# Matrix grader
# --------------------------------------------------------------------------

GRADER_SYSTEM = f"""Valuti le celle in una matrice paesi × capacità AI per la newsletter apulia.ai su Europa e Italia.

Per ogni cella ricevi un paese, una capacità e alcuni snippet di articoli potenzialmente rilevanti.

Stati ammessi (restituisci esattamente uno):
- "none"    : nessuna attività rilevante nel materiale fornito
- "normal"  : attività in stato stazionario, niente di particolarmente rilevante
- "active"  : nuovo sviluppo significativo (annuncio, partnership, deployment)
- "surge"   : investimento maggiore, mossa di scala nazionale/europea, notizia trasformativa

Sii conservativo. "surge" deve essere raro — riservalo a mosse >€200M, annunci sovrani di scala o notizie paradigmatiche. Se gli snippet non sono pertinenti alla cella, restituisci "none".

Formato output: array JSON di oggetti, uno per cella, nell'ordine ricevuto:
{{"id": <int>, "state": "<none|normal|active|surge>", "note": "<max 12 parole o vuoto>"}}
Restituisci SOLO l'array JSON. Niente prosa. Niente markdown fence."""


def grade_matrix(cells: list[tuple[str, str, list[Article]]]) -> list[dict]:
    """cells: lista di (country, capability, articles). Restituisce lista di dict con state + note."""
    if not cells:
        return []
    client = _client()
    payload = []
    for i, (country, cap, arts) in enumerate(cells):
        payload.append(
            {
                "id": i,
                "country": country,
                "capability": cap,
                "snippets": [
                    {"title": a.title, "summary": a.summary[:250]}
                    for a in arts[:4]
                ],
            }
        )
    user_msg = "Valuta queste celle:\n\n" + json.dumps(payload, ensure_ascii=False)

    print(f"  [grade] {len(cells)} celle matrice")
    try:
        resp = client.messages.create(
            model=HAIKU,
            max_tokens=3072,
            system=[
                {
                    "type": "text",
                    "text": GRADER_SYSTEM,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": user_msg}],
        )
        text = resp.content[0].text  # type: ignore
        graded = _extract_json_array(text)
    except (anthropic.APIError, ValueError, json.JSONDecodeError) as e:
        print(f"    [warn] grade fallito: {e}")
        return [{"id": i, "state": "none", "note": ""} for i in range(len(cells))]

    out: list[dict] = [{"id": i, "state": "none", "note": ""} for i in range(len(cells))]
    for g in graded:
        gid = g.get("id")
        if isinstance(gid, int) and 0 <= gid < len(cells):
            state = g.get("state", "none")
            if state not in {"none", "normal", "active", "surge"}:
                state = "none"
            note = (g.get("note") or "").strip()
            if len(note) > 80:
                note = note[:77] + "…"
            out[gid] = {"id": gid, "state": state, "note": note}
    return out


# --------------------------------------------------------------------------
# Spotlight picker
# --------------------------------------------------------------------------

SPOTLIGHT_SYSTEM = """Scegli e scrivi la sezione SPOTLIGHT della newsletter settimanale apulia.ai.

Lo spotlight è un argomento rotante per numero — un approfondimento tematico sul fatto più rilevante della settimana in Europa/Italia sull'AI (es. un deal, una mossa normativa, un lancio di modello, un'infrastruttura).

Ricevi 5-10 articoli candidati (i più importanti della settimana). Scegli IL SINGOLO argomento che merita un approfondimento e scrivi 3-5 bullet analitici (fino a 2 frasi ciascuno, più analitici dei bullet normali). Usa citazioni [n] inline.

Il titolo dello spotlight deve essere bilingue: italiano / English.

Output: oggetto JSON con questa struttura:
{"title_it": "<titolo italiano, max 8 parole>", "title_en": "<English title, max 8 words>", "bullets": [{"text": "...", "sources": [<int>]}, ...]}
Restituisci SOLO l'oggetto JSON. Niente prosa. Niente markdown fence."""


def write_spotlight(articles: list[Article]) -> dict:
    if not articles:
        return {"title_it": "Nessuno spotlight questa settimana", "title_en": "No spotlight this week", "bullets": []}
    client = _client()
    payload = [
        {"id": i, "title": a.title, "source": a.source, "summary": a.summary[:600]}
        for i, a in enumerate(articles[:10])
    ]
    user_msg = "Scegli un argomento spotlight e scrivilo:\n\n" + json.dumps(payload, ensure_ascii=False)
    print(f"  [spotlight] selezione da {len(articles[:10])} candidati")
    try:
        resp = client.messages.create(
            model=SONNET,
            max_tokens=1500,
            system=[
                {
                    "type": "text",
                    "text": SPOTLIGHT_SYSTEM,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": user_msg}],
        )
        return _extract_json_object(resp.content[0].text)  # type: ignore
    except (anthropic.APIError, ValueError, json.JSONDecodeError) as e:
        print(f"    [warn] spotlight fallito: {e}")
        return {"title_it": "Spotlight non disponibile", "title_en": "Spotlight unavailable", "bullets": []}
