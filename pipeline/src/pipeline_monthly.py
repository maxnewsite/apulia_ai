"""Pipeline mensile end-to-end: articoli del mese -> oggetto MonthlyBrief strutturato."""

from __future__ import annotations

import json
from collections import defaultdict
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import yaml

from .agents import (
    CAPABILITIES,
    COUNTRIES,
    classify_articles,
    grade_matrix,
    write_section,
    write_regulatory_section,
    write_english_summary,
)
from .agents_monthly import (
    write_strategic_analysis,
    write_executive_summary,
    write_company_watch,
    write_outlook,
)
from .dedupe import SeenStore
from .sources import Article, fetch_relevant


PUBLICATION_TITLE = "BRIEFING STRATEGICO MENSILE"
PUBLICATION_TAGLINE = "Analisi approfondita dell'AI in Europa e Italia"

MONTHLY_LOOKBACK_DAYS = 30


@dataclass
class Bullet:
    text: str
    sources: list[dict] = field(default_factory=list)


@dataclass
class CompanyEntry:
    name: str
    country: str
    sector: str
    summary: str
    why_watch: str
    sources: list[dict] = field(default_factory=list)


@dataclass
class CountryBriefing:
    country: str
    bullets: list[Bullet] = field(default_factory=list)


@dataclass
class MatrixCell:
    state: str
    note: str = ""


@dataclass
class MonthlyBrief:
    title: str
    tagline: str
    issue_date: str           # YYYY-MM-DD
    reporting_period: str     # "Maggio 2026"
    reporting_period_en: str  # "May 2026"
    # Sezioni
    executive_summary_it: list[str] = field(default_factory=list)   # paragrafi
    executive_summary_en: list[str] = field(default_factory=list)
    strategic_analysis: list[Bullet] = field(default_factory=list)
    radar_normativo: list[Bullet] = field(default_factory=list)
    country_briefings: list[CountryBriefing] = field(default_factory=list)
    funding_markets: list[Bullet] = field(default_factory=list)
    research_innovation: list[Bullet] = field(default_factory=list)
    compute_infra: list[Bullet] = field(default_factory=list)
    company_watch: list[CompanyEntry] = field(default_factory=list)
    capability_matrix: dict[str, dict[str, MatrixCell]] = field(default_factory=dict)
    outlook: list[Bullet] = field(default_factory=list)
    article_count: int = 0
    source_count: int = 0


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
                src_links.append({"name": pub, "url": a.url, "date": _format_short_date(a.published)})
                cited[a.fingerprint] = a
        out.append(Bullet(text=b["text"], sources=src_links))
    return out, list(cited.values())


def _format_month(today) -> tuple[str, str]:
    months_it = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
                 "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"]
    months_en = ["January", "February", "March", "April", "May", "June",
                 "July", "August", "September", "October", "November", "December"]
    return f"{months_it[today.month - 1]} {today.year}", f"{months_en[today.month - 1]} {today.year}"


def build_monthly_brief(config_path: Path) -> tuple[MonthlyBrief, list[Article]]:
    """Costruisce il brief mensile. Restituisce (brief, articoli_citati)."""
    cfg = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    countries: list[str] = cfg.get("countries", COUNTRIES)
    capabilities: list[str] = cfg.get("capabilities", CAPABILITIES)

    today = datetime.now(timezone.utc).date()
    period_it, period_en = _format_month(today)

    brief = MonthlyBrief(
        title=PUBLICATION_TITLE,
        tagline=PUBLICATION_TAGLINE,
        issue_date=today.isoformat(),
        reporting_period=period_it,
        reporting_period_en=period_en,
    )

    # 1. Fetch (30 giorni)
    articles = fetch_relevant(config_path, lookback_days=MONTHLY_LOOKBACK_DAYS)
    if not articles:
        print("[pipeline_monthly] nessun articolo recuperato")
        return brief, []

    brief.article_count = len(articles)
    brief.source_count = len({a.publisher or a.source for a in articles})

    MAX_FOR_CLASSIFY = 300
    if len(articles) > MAX_FOR_CLASSIFY:
        print(f"[pipeline_monthly] cap {len(articles)} -> {MAX_FOR_CLASSIFY}")
        articles = articles[:MAX_FOR_CLASSIFY]

    # 2. Classifica
    print("[pipeline_monthly] classificazione…")
    classifications = classify_articles(articles)
    enriched = [(a, c) for a, c in zip(articles, classifications) if not c.get("skip")]
    print(f"[pipeline_monthly] {len(enriched)} articoli classificati")

    if not enriched:
        return brief, []

    # 3. Raggruppa
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

    def top(items, k):
        return [a for a, _ in sorted(items, key=lambda x: -x[1]["importance"])[:k]]

    cited_all: dict[str, Article] = {}

    def collect(bt: tuple[list[Bullet], list[Article]]) -> list[Bullet]:
        bullets, cited = bt
        for a in cited:
            cited_all[a.fingerprint] = a
        return bullets

    # 4. SINTESI ESECUTIVA
    top20 = top(enriched, 20)
    print("[pipeline_monthly] sintesi esecutiva…")
    exec_sum = write_executive_summary(top20)
    brief.executive_summary_it = exec_sum.get("paragraphs_it", [])
    brief.executive_summary_en = exec_sum.get("paragraphs_en", [])

    # 5. ANALISI STRATEGICA
    keydev_pool = [(a, c) for a, c in enriched if "key_dev" in c["themes"] or c["importance"] >= 3]
    kd_articles = top(keydev_pool, 20)
    if kd_articles:
        brief.strategic_analysis = collect(_bullets_with_sources(
            write_strategic_analysis(kd_articles, target_bullets=8), kd_articles,
        ))

    # 6. RADAR NORMATIVO
    norm_pool = by_theme.get("normativo", []) + by_theme.get("policy", [])
    norm_articles = top(norm_pool, 15)
    if norm_articles:
        brief.radar_normativo = collect(_bullets_with_sources(
            write_regulatory_section(norm_articles, target_bullets=6), norm_articles,
        ))

    # 7. BRIEFING PER PAESE
    print("[pipeline_monthly] briefing per paese…")
    for country in countries:
        items = by_country.get(country, [])
        if not items:
            continue
        country_arts = top(items, 10)
        bullets_raw = write_section(f"BRIEFING MENSILE — {country}", country_arts, target_bullets=5)
        if bullets_raw:
            brief.country_briefings.append(
                CountryBriefing(country=country,
                                bullets=collect(_bullets_with_sources(bullets_raw, country_arts)))
            )

    # 8. FUNDING & MERCATI (mensile più dettagliato)
    fund_pool = [a for a, _ in by_theme.get("funding", [])]
    if fund_pool:
        brief.funding_markets = collect(_bullets_with_sources(
            write_section("FUNDING & MERCATI (mese)", fund_pool[:20], target_bullets=8),
            fund_pool[:20],
        ))

    # 9. RICERCA & INNOVAZIONE
    research_pool = [a for a, _ in by_theme.get("research", [])]
    if research_pool:
        brief.research_innovation = collect(_bullets_with_sources(
            write_section("RICERCA & INNOVAZIONE", research_pool[:15], target_bullets=6),
            research_pool[:15],
        ))

    # 10. COMPUTE & INFRASTRUTTURE
    compute_pool = [a for a, _ in by_theme.get("compute", [])]
    if compute_pool:
        brief.compute_infra = collect(_bullets_with_sources(
            write_section("COMPUTE & INFRASTRUTTURE (mese)", compute_pool[:12], target_bullets=5),
            compute_pool[:12],
        ))

    # 11. COMPANY WATCH
    all_articles_flat = [a for a, _ in enriched]
    companies_raw = write_company_watch(all_articles_flat[:30], target=5)
    for c in companies_raw:
        src_links = []
        for idx in c.get("sources", []):
            if 0 <= idx < len(all_articles_flat[:30]):
                a = all_articles_flat[idx]
                pub = a.publisher or a.source
                src_links.append({"name": pub, "url": a.url, "date": _format_short_date(a.published)})
                cited_all[a.fingerprint] = a
        brief.company_watch.append(CompanyEntry(
            name=c["name"], country=c["country"], sector=c["sector"],
            summary=c["summary"], why_watch=c["why_watch"], sources=src_links,
        ))

    # 12. CAPABILITY MATRIX
    print("[pipeline_monthly] matrice capacità…")
    matrix_cells = [
        (country, cap, by_country_capability.get((country, cap), []))
        for country in countries
        for cap in capabilities
    ]
    matrix_grades = grade_matrix(matrix_cells)
    for (country, cap, _), grade in zip(matrix_cells, matrix_grades):
        brief.capability_matrix.setdefault(country, {})[cap] = MatrixCell(
            state=grade["state"], note=grade["note"]
        )

    # 13. OUTLOOK
    top15 = top(enriched, 15)
    print("[pipeline_monthly] outlook mese prossimo…")
    outlook_raw = write_outlook(top15, target=5)
    brief.outlook = collect(_bullets_with_sources(outlook_raw, top15))

    return brief, list(cited_all.values())


def monthly_to_dict(brief: MonthlyBrief) -> dict[str, Any]:
    return asdict(brief)


def save_monthly(brief: MonthlyBrief, out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    month_str = datetime.now(timezone.utc).strftime("%Y-%m")
    path = out_dir / f"monthly-{month_str}.json"
    path.write_text(
        json.dumps(monthly_to_dict(brief), indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    return path
