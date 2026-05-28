"""RSS source fetchers for the apulia.ai newsletter pipeline.

Pulls from curated RSS feeds + Google News RSS queries (free, no API key),
normalizes everything into Article objects, dedupes, and filters to the
configured lookback window. Focus: AI in Europe and Italy.
"""

from __future__ import annotations

import hashlib
import re
import time
import urllib.parse
from dataclasses import dataclass, asdict, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable

import feedparser
import httpx
import yaml
from bs4 import BeautifulSoup


@dataclass
class Article:
    title: str
    url: str
    source: str            # feed name (e.g. "Wired Italia")
    published: str         # ISO 8601
    summary: str
    publisher: str = ""    # actual publication, parsed from Google News title suffix
    fingerprint: str = field(default="")

    def to_dict(self) -> dict:
        return asdict(self)


def _extract_publisher(title: str, fallback_source: str) -> tuple[str, str]:
    """For Google News items, the title is 'Headline - Publisher'.
    Returns (cleaned_title, publisher). Falls back to (title, fallback_source).
    """
    if " - " in title:
        head, _, tail = title.rpartition(" - ")
        if 1 <= len(tail.split()) <= 6 and not tail.endswith((".", "?", "!")):
            return head.strip(), tail.strip()
    return title, fallback_source


def _strip_html(text: str) -> str:
    if not text:
        return ""
    soup = BeautifulSoup(text, "html.parser")
    return re.sub(r"\s+", " ", soup.get_text(" ").strip())


def _fingerprint(title: str, url: str) -> str:
    norm = re.sub(r"[^a-z0-9 ]", "", title.lower()).strip()
    norm = re.sub(r"\s+", " ", norm)[:120]
    h = hashlib.sha1(f"{norm}|{urllib.parse.urlparse(url).path}".encode()).hexdigest()
    return h[:16]


def _parse_published(entry) -> datetime | None:
    for key in ("published_parsed", "updated_parsed"):
        val = entry.get(key)
        if val:
            try:
                return datetime.fromtimestamp(time.mktime(val), tz=timezone.utc)
            except (TypeError, ValueError, OverflowError):
                continue
    return None


def _fetch_feed(url: str, source_name: str) -> list[Article]:
    """Fetch one RSS feed via httpx and parse into Articles."""
    try:
        resp = httpx.get(
            url,
            timeout=20.0,
            follow_redirects=True,
            headers={"User-Agent": "ApuliaAI-Newsletter/1.0 (+newsletter pipeline)"},
        )
        resp.raise_for_status()
    except httpx.HTTPError as e:
        print(f"  [warn] {source_name}: fetch failed: {e}")
        return []

    parsed = feedparser.parse(resp.content)
    out: list[Article] = []
    for entry in parsed.entries:
        title = _strip_html(entry.get("title", "")).strip()
        link = entry.get("link", "").strip()
        if not title or not link:
            continue
        published_dt = _parse_published(entry)
        published_iso = (
            published_dt.isoformat() if published_dt else datetime.now(timezone.utc).isoformat()
        )
        summary = _strip_html(entry.get("summary", "") or entry.get("description", ""))
        if len(summary) > 800:
            summary = summary[:800].rsplit(" ", 1)[0] + "…"

        if source_name.startswith("Google News:"):
            cleaned_title, publisher = _extract_publisher(title, source_name)
        else:
            cleaned_title, publisher = title, source_name

        out.append(
            Article(
                title=cleaned_title,
                url=link,
                source=source_name,
                publisher=publisher,
                published=published_iso,
                summary=summary,
                fingerprint=_fingerprint(cleaned_title, link),
            )
        )
    return out


def _google_news_url(query: str) -> str:
    q = urllib.parse.quote_plus(query)
    return f"https://news.google.com/rss/search?q={q}+when:7d&hl=it-IT&gl=IT&ceid=IT:it"


def fetch_all(config_path: Path, lookback_days: int | None = None) -> list[Article]:
    cfg = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    if lookback_days is None:
        lookback_days = int(cfg.get("lookback_days", 7))
    cutoff = datetime.now(timezone.utc) - timedelta(days=lookback_days)

    all_articles: list[Article] = []

    print(f"[fetch] curated RSS feeds ({len(cfg.get('rss_feeds', []))})")
    for feed in cfg.get("rss_feeds", []):
        items = _fetch_feed(feed["url"], feed["name"])
        print(f"  {feed['name']}: {len(items)} items")
        all_articles.extend(items)

    print(f"[fetch] Google News RSS queries ({len(cfg.get('google_news_queries', []))})")
    for q in cfg.get("google_news_queries", []):
        items = _fetch_feed(_google_news_url(q), f"Google News: {q}")
        print(f"  '{q}': {len(items)} items")
        all_articles.extend(items)

    # Filter by lookback window
    fresh: list[Article] = []
    for a in all_articles:
        try:
            pub = datetime.fromisoformat(a.published)
            if pub.tzinfo is None:
                pub = pub.replace(tzinfo=timezone.utc)
            if pub >= cutoff:
                fresh.append(a)
        except ValueError:
            fresh.append(a)

    # Dedupe by fingerprint, keep the freshest copy
    by_fp: dict[str, Article] = {}
    for a in fresh:
        existing = by_fp.get(a.fingerprint)
        if not existing or a.published > existing.published:
            by_fp[a.fingerprint] = a

    deduped = sorted(by_fp.values(), key=lambda a: a.published, reverse=True)
    print(f"[fetch] {len(all_articles)} raw -> {len(fresh)} fresh -> {len(deduped)} deduped")
    return deduped


CURATED_FEED_NAMES = {
    "Wired Italia", "StartupItalia", "AI4Business", "Il Sole 24 Ore Tecnologia",
    "AgendaDigitale", "CorCom", "Sifted", "Tech.eu", "EU Startups",
    "Silicon Canals", "The Next Web", "VentureBeat AI", "MIT Technology Review",
    "POLITICO Tech",
}

# AI terms in both Italian and English (include "IA" — Italian abbreviation)
_AI_TERMS = re.compile(
    r"\b(AI|IA|intelligenza artificiale|artificial intelligence|machine learning|"
    r"LLM|GPT|ChatGPT|generativo|generative|data cent(?:ro|er|re)|GPU|chip|"
    r"semiconduttore|semiconductor|neural|modello|automation|robotica|robotics|"
    r"OpenAI|Anthropic|Nvidia|Mistral|Aleph Alpha|Hugging Face|Gemini|Claude|"
    r"deeptech|deep tech|EU AI Act|AI Act|GDPR AI|large language|foundation model|"
    r"modello linguistico|apprendimento automatico|apprendimento profondo|deep learning)\b",
    re.I,
)

_REGION_TERMS = re.compile(
    r"\b(Italia|Italy|Italian|Milano|Roma|Torino|Napoli|Bologna|Firenze|"
    r"Europa|Europe|European|UE|EU|"
    r"Francia|France|French|Parigi|Paris|"
    r"Germania|Germany|German|Berlino|Berlin|"
    r"Spagna|Spain|Spanish|Barcellona|Madrid|"
    r"Olanda|Paesi Bassi|Netherlands|Amsterdam|"
    r"Svezia|Sweden|Swedish|Stoccolma|Stockholm|"
    r"Regno Unito|UK|United Kingdom|Londra|London|"
    r"Polonia|Poland|Warsaw|Varsavia|"
    r"Bruxelles|Brussels|Commissione Europea|European Commission|"
    r"Parlamento Europeo|European Parliament|eurozona|eurozone)\b",
    re.I,
)


def _filter_ai_relevant(articles: Iterable[Article]) -> list[Article]:
    """Pre-filter to keep AI-relevant EU/Italy articles.

    Logic:
    - Curated feeds (already EU/Italy-focused): keep if they mention AI terms.
    - Google News results: require both AI terms AND region terms (noisier source).
    """
    out = []
    for a in articles:
        blob = f"{a.title} {a.summary}"
        is_google_news = a.source.startswith("Google News:")
        has_ai = _AI_TERMS.search(blob)

        if is_google_news:
            # Google News is a broad discovery layer — require explicit region signal too
            if has_ai and _REGION_TERMS.search(blob):
                out.append(a)
        else:
            # Curated EU/Italy feeds — only need AI relevance
            if has_ai:
                out.append(a)
    return out


def fetch_relevant(config_path: Path, lookback_days: int | None = None) -> list[Article]:
    """Top-level entry: fetch + filter to AI-relevant EU/Italy articles."""
    raw = fetch_all(config_path, lookback_days=lookback_days)
    relevant = _filter_ai_relevant(raw)
    print(f"[filter] {len(raw)} -> {len(relevant)} AI+region relevant")
    return relevant


if __name__ == "__main__":
    import json
    cfg_path = Path(__file__).resolve().parent.parent / "config" / "sources.yaml"
    arts = fetch_relevant(cfg_path)
    out = Path(__file__).resolve().parent.parent / "cache" / "articles.json"
    out.write_text(
        json.dumps([a.to_dict() for a in arts], indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"[done] wrote {len(arts)} articles to {out}")
