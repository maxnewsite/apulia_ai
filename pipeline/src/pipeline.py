"""Pipeline settimanale end-to-end: articoli fetched -> oggetto Newsletter strutturato."""

from __future__ import annotations

import json
from collections import defaultdict
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Literal

import yaml

from .agents import (
    CAPABILITIES,
    COUNTRIES,
    classify_articles,
    grade_matrix,
    write_section,
    write_regulatory_section,
    write_english_summary,
    write_spotlight,
)
from .dedupe import SeenStore
from .sources import Article, fetch_relevant


PUBLICATION_TITLE = "AI EUROPA WEEKLY"
PUBLICATION_TAGLINE = "Intelligence strategica sull'AI in Europa e Italia"

Cadence = Literal["weekly"]

CADENCE_PARAMS = {
    "weekly": {
        "lookback_days": 7,
        "bullets_key_dev": 8,
        "bullets_per_country": 4,
        "bullets_normativo": 5,
        "bullets_focus_italia": 5,
        "bullets_compute": 4,
        "bullets_incident": 4,
        "bullets_funding": 6,
        "bullets_english_summary": 5,
    },
}


@dataclass
class Bullet:
    text: str
    sources: list[dict] = field(default_factory=list)  # [{name, url, date}]


@dataclass
class CountryBriefing:
    country: str
    bullets: list[Bullet] = field(default_factory=list)


@dataclass
class MatrixCell:
    state: str   # none|normal|active|surge
    note: str = ""


@dataclass
class Newsletter:
    title: str
    tagline: str
    cadence: str
    issue_date: str           # YYYY-MM-DD
    reporting_period: str
    key_developments: list[Bullet] = field(default_factory=list)
    radar_normativo: list[Bullet] = field(default_factory=list)
    focus_italia: list[Bullet] = field(default_factory=list)
    country_briefings: list[CountryBriefing] = field(default_factory=list)
    compute_status: dict[str, str] = field(default_factory=dict)
    compute_infra: list[Bullet] = field(default_factory=list)
    capability_matrix: dict[str, dict[str, MatrixCell]] = field(default_factory=dict)
    incidents: list[Bullet] = field(default_factory=list)
    spotlight_title_it: str = ""
    spotlight_title_en: str = ""
    spotlight_bullets: list[Bullet] = field(default_factory=list)
    funding_markets: list[Bullet] = field(default_factory=list)
    english_summary: list[Bullet] = field(default_factory=list)
    article_count: int = 0
    source_count: int = 0
    skipped_dedup: int = 0


def _format_short_date(iso: str) -> str:
    if not iso:
        return ""
    try:
        dt = datetime.fromisoformat(iso)
        months_it = ["gen", "feb", "mar", "apr", "mag", "giu",
                     "lug", "ago", "set", "ott", "nov", "dic"]
        return f"{dt.day} {months_it[dt.month - 1]}"
    except ValueError:
        return ""


def _bullets_with_sources(raw_bullets: list[dict], articles: list[Article]) -> tuple[list[Bullet], list[Article]]:
    out: list[Bullet] = []
    cited: dict[str, Article] = {}
    for b in raw_bullets:
        src_links = []
        seen_pub = set()
        for idx in b.get("sources", []):
            if 0 <= idx < len(articles):
                a = articles[idx]
                pub = a.publisher or a.source
                if pub in seen_pub:
                    continue
                seen_pub.add(pub)
                src_links.append({
                    "name": pub,
                    "url": a.url,
                    "date": _format_short_date(a.published),
                })
                cited[a.fingerprint] = a
        out.append(Bullet(text=b["text"], sources=src_links))
    return out, list(cited.values())


def _format_period(today) -> str:
    start = today - timedelta(days=6)
    months_it = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
                 "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"]
    if start.month == today.month:
        return f"{start.day}–{today.day} {months_it[today.month - 1]} {today.year}"
    return f"{start.day} {months_it[start.month - 1]} – {today.day} {months_it[today.month - 1]} {today.year}"


def build_newsletter(
    config_path: Path,
    seen_store: SeenStore | None = None,
    cadence: Cadence = "weekly",
) -> tuple[Newsletter, list[Article]]:
    """Costruisce la newsletter. Restituisce (newsletter, articoli_citati)."""
    cfg = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    countries: list[str] = cfg.get("countries", COUNTRIES)
    capabilities: list[str] = cfg.get("capabilities", CAPABILITIES)
    params = CADENCE_PARAMS[cadence]

    today = datetime.now(timezone.utc).date()
    nl = Newsletter(
        title=PUBLICATION_TITLE,
        tagline=PUBLICATION_TAGLINE,
        cadence=cadence,
        issue_date=today.isoformat(),
        reporting_period=_format_period(today),
    )

    # 1. Fetch
    articles = fetch_relevant(config_path, lookback_days=params["lookback_days"])
    if not articles:
        print("[pipeline] nessun articolo recuperato, newsletter vuota")
        return nl, []

    # 1b. Filtra contro le edizioni precedenti
    if seen_store is not None:
        articles, dropped = seen_store.filter_unseen(articles)
        nl.skipped_dedup = dropped
        print(f"[dedupe] scartati {dropped} articoli già pubblicati; rimangono {len(articles)}")

    if not articles:
        print("[pipeline] tutti gli articoli erano già stati pubblicati; niente di nuovo")
        return nl, []

    nl.article_count = len(articles)
    nl.source_count = len({a.publisher or a.source for a in articles})

    MAX_FOR_CLASSIFY = 200
    if len(articles) > MAX_FOR_CLASSIFY:
        print(f"[pipeline] cap {len(articles)} -> {MAX_FOR_CLASSIFY} più recenti per classificazione")
        articles = articles[:MAX_FOR_CLASSIFY]

    # 2. Classifica
    print(f"[pipeline] classificazione {len(articles)} articoli…")
    print(f"  Esempi: {[a.title[:60] for a in articles[:3]]}")
    classifications = classify_articles(articles)

    enriched = list(zip(articles, classifications))
    skipped = [(a, c) for a, c in enriched if c.get("skip")]
    enriched = [(a, c) for a, c in enriched if not c.get("skip")]
    print(f"[pipeline] {len(enriched)} tenuti, {len(skipped)} skippati dalla classificazione")
    if enriched:
        print(f"  Esempio tenuto: {enriched[0][0].title[:80]}")
    if len(skipped) == len(articles) and articles:
        print("  [WARN] tutti gli articoli sono stati skippati — verifica ANTHROPIC_API_KEY e log sopra")

    if not enriched:
        return nl, []

    # 3. Raggruppa per sezione
    by_theme: dict[str, list[tuple[Article, dict]]] = defaultdict(list)
    by_country: dict[str, list[tuple[Article, dict]]] = defaultdict(list)
    by_country_capability: dict[tuple[str, str], list[Article]] = defaultdict(list)

    for a, c in enriched:
        for t in c["themes"]:
            by_theme[t].append((a, c))
        for country in c["countries"]:
            by_country[country].append((a, c))
            if c["capability"]:
                by_country_capability[(country, c["capability"])].append(a)

    def top_articles(items: list[tuple[Article, dict]], k: int) -> list[Article]:
        items_sorted = sorted(items, key=lambda x: -x[1]["importance"])
        return [a for a, _ in items_sorted[:k]]

    cited_all: dict[str, Article] = {}

    def collect(bullets_and_cited: tuple[list[Bullet], list[Article]]) -> list[Bullet]:
        bullets, cited = bullets_and_cited
        for a in cited:
            cited_all[a.fingerprint] = a
        return bullets

    # 4. SVILUPPI CHIAVE
    keydev_pool = [(a, c) for a, c in enriched if "key_dev" in c["themes"] or c["importance"] >= 4]
    keydev_articles = top_articles(keydev_pool, max(12, params["bullets_key_dev"] * 2))
    print(f"[pipeline] pool sviluppi chiave: {len(keydev_pool)}")
    if keydev_articles:
        nl.key_developments = collect(_bullets_with_sources(
            write_section("SVILUPPI CHIAVE", keydev_articles,
                          target_bullets=params["bullets_key_dev"]),
            keydev_articles,
        ))

    # 5. RADAR NORMATIVO
    norm_pool = by_theme.get("normativo", []) + by_theme.get("policy", [])
    norm_articles = top_articles(norm_pool, max(8, params["bullets_normativo"] * 2))
    print(f"[pipeline] pool radar normativo: {len(norm_pool)}")
    if norm_articles:
        nl.radar_normativo = collect(_bullets_with_sources(
            write_regulatory_section(norm_articles, target_bullets=params["bullets_normativo"]),
            norm_articles,
        ))

    # 6. FOCUS ITALIA
    italia_items = by_country.get("Italia", [])
    italia_articles = top_articles(italia_items, max(8, params["bullets_focus_italia"] * 2))
    print(f"[pipeline] pool focus italia: {len(italia_items)}")
    if italia_articles:
        nl.focus_italia = collect(_bullets_with_sources(
            write_section("FOCUS ITALIA — Ecosistema AI italiano", italia_articles,
                          target_bullets=params["bullets_focus_italia"]),
            italia_articles,
        ))

    # 7. BRIEFING PER PAESE (tutti i paesi tranne Italia già coperta)
    print("[pipeline] briefing per paese…")
    for country in countries:
        if country == "Italia":
            continue  # già nella sezione Focus Italia
        items = by_country.get(country, [])
        if not items:
            continue
        country_articles = top_articles(items, max(6, params["bullets_per_country"] * 2))
        bullets_raw = write_section(
            f"BRIEFING — {country}", country_articles,
            target_bullets=params["bullets_per_country"],
        )
        if bullets_raw:
            nl.country_briefings.append(
                CountryBriefing(
                    country=country,
                    bullets=collect(_bullets_with_sources(bullets_raw, country_articles)),
                )
            )

    # 8. COMPUTE & INFRASTRUTTURE
    compute_pool = [a for a, _ in by_theme.get("compute", [])]
    if compute_pool:
        nl.compute_infra = collect(_bullets_with_sources(
            write_section("COMPUTE & INFRASTRUTTURE AI", compute_pool[:10],
                          target_bullets=params["bullets_compute"]),
            compute_pool[:10],
        ))

    # 9. INCIDENTI & RISCHI AI
    incident_pool = [a for a, _ in by_theme.get("incident", [])]
    if incident_pool:
        nl.incidents = collect(_bullets_with_sources(
            write_section("INCIDENTI & RISCHI AI", incident_pool[:10],
                          target_bullets=params["bullets_incident"]),
            incident_pool[:10],
        ))

    # 10. FUNDING & MERCATI
    funding_pool = [a for a, _ in by_theme.get("funding", [])]
    if funding_pool:
        nl.funding_markets = collect(_bullets_with_sources(
            write_section("FUNDING & MERCATI", funding_pool[:12],
                          target_bullets=params["bullets_funding"]),
            funding_pool[:12],
        ))

    # 11. SPOTLIGHT
    spotlight_pool = sorted(enriched, key=lambda x: -x[1]["importance"])[:10]
    spot_articles = [a for a, _ in spotlight_pool]
    print("[pipeline] scrittura spotlight…")
    spot = write_spotlight(spot_articles)
    nl.spotlight_title_it = spot.get("title_it", "")
    nl.spotlight_title_en = spot.get("title_en", "")
    nl.spotlight_bullets = collect(_bullets_with_sources(spot.get("bullets", []), spot_articles))

    # 12. COMPUTE STATUS per matrice
    compute_by_country: dict[str, list[Article]] = defaultdict(list)
    for a, c in by_theme.get("compute", []):
        for country in c["countries"]:
            compute_by_country[country].append(a)
    compute_cells = [
        (country, "Cloud & Data Center", compute_by_country.get(country, []))
        for country in countries
    ]
    compute_grades = grade_matrix(compute_cells)
    for cell, grade in zip(compute_cells, compute_grades):
        nl.compute_status[cell[0]] = grade["state"]

    # 13. CAPABILITY MATRIX
    print("[pipeline] valutazione matrice capacità…")
    matrix_cells = [
        (country, cap, by_country_capability.get((country, cap), []))
        for country in countries
        for cap in capabilities
    ]
    matrix_grades = grade_matrix(matrix_cells)
    for (country, cap, _), grade in zip(matrix_cells, matrix_grades):
        nl.capability_matrix.setdefault(country, {})[cap] = MatrixCell(
            state=grade["state"], note=grade["note"]
        )

    # 14. ENGLISH EXECUTIVE SUMMARY
    top_all = sorted(enriched, key=lambda x: -x[1]["importance"])[:20]
    top_articles_en = [a for a, _ in top_all]
    print("[pipeline] scrittura executive summary inglese…")
    en_bullets_raw = write_english_summary(top_articles_en, target_bullets=params["bullets_english_summary"])
    nl.english_summary = collect(_bullets_with_sources(en_bullets_raw, top_articles_en))

    return nl, list(cited_all.values())


def newsletter_to_dict(nl: Newsletter) -> dict[str, Any]:
    return asdict(nl)


def save_newsletter(nl: Newsletter, out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"weekly-{nl.issue_date}.json"
    path.write_text(
        json.dumps(newsletter_to_dict(nl), indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    return path


def load_newsletter_meta(json_path: Path) -> Newsletter:
    """Reconstruct a Newsletter with only the metadata fields needed by
    publish() and deliver(). Content sections stay at their default empty
    values — they're already baked into the HTML file we ship."""
    data = json.loads(json_path.read_text(encoding="utf-8"))
    return Newsletter(
        title=data["title"],
        tagline=data.get("tagline", ""),
        cadence=data.get("cadence", "weekly"),
        issue_date=data["issue_date"],
        reporting_period=data.get("reporting_period", ""),
    )
