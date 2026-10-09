"""Monitoraggio settimanale SEO/tecnico di apulia.ai.

Controlla solo ciò che è pubblico (nessuna credenziale richiesta):
  - pagine chiave: stato HTTP, tempo di risposta, canonical, title, description
  - home: "Ultima edizione" allineata all'ultima edizione pubblicata
  - freschezza: allarme se l'ultima edizione ha più di 8 giorni
  - sitemap, feed RSS, robots.txt, llms.txt, file Bing e IndexNow
  - schema: autore e founder presenti
  - PageSpeed Insights (mobile) su home e ultima edizione

Scrive un report in claudedocs/seo-monitor/AAAA-MM-GG.md e aggiunge una
riga a claudedocs/seo-monitor/history.csv per seguire l'andamento.

Uso:  python scripts/seo_monitor.py
      PSI_API_KEY=... python scripts/seo_monitor.py   (quota PageSpeed più alta)
"""

from __future__ import annotations

# Patch SSL per Windows, come nella pipeline
try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

import csv
import os
import re
import sys
import time
import xml.dom.minidom
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path

import httpx

SITE = "https://apulia.ai"
INDEXNOW_KEY = "2a8d8e60722c4ce13d4692595fcea3b3"
MAX_EDITION_AGE_DAYS = 8
SLOW_RESPONSE_S = 2.0

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "claudedocs" / "seo-monitor"
HISTORY = OUT_DIR / "history.csv"

HEADERS = {"User-Agent": "apulia-seo-monitor/1.0 (+https://apulia.ai)"}


@dataclass
class Report:
    ok: list[str] = field(default_factory=list)
    warn: list[str] = field(default_factory=list)
    fail: list[str] = field(default_factory=list)
    metrics: dict[str, object] = field(default_factory=dict)
    pages: list[tuple[str, int, float, str]] = field(default_factory=list)
    psi: list[tuple[str, str]] = field(default_factory=list)


def fetch(client: httpx.Client, url: str) -> tuple[httpx.Response | None, float]:
    start = time.perf_counter()
    try:
        resp = client.get(url)
    except httpx.HTTPError as e:
        print(f"  ! {url}: {e}")
        return None, time.perf_counter() - start
    return resp, time.perf_counter() - start


def check_pages(client: httpx.Client, rep: Report, latest_url: str | None) -> None:
    pages = ["/", "/weekly", "/chi-siamo", "/chi-siamo/massimiliano-masi", "/privacy"]
    if latest_url:
        pages.append(latest_url.replace(SITE, ""))

    for path in pages:
        url = SITE + path
        resp, elapsed = fetch(client, url)
        if resp is None or resp.status_code != 200:
            code = resp.status_code if resp is not None else 0
            rep.fail.append(f"`{path}` risponde HTTP {code}")
            rep.pages.append((path, code, elapsed, "—"))
            continue

        html = resp.text
        notes: list[str] = []
        expected = SITE if path == "/" else url
        canonicals = re.findall(r'<link rel="canonical" href="([^"]+)"', html)
        if canonicals != [expected]:
            rep.fail.append(f"`{path}` canonical errato: {canonicals or 'assente'}")
            notes.append("canonical")
        if re.search(r'<meta name="robots" content="[^"]*noindex', html):
            rep.fail.append(f"`{path}` è in noindex")
            notes.append("noindex")
        title = re.search(r"<title>([^<]*)</title>", html)
        if not title or not title.group(1).strip():
            rep.fail.append(f"`{path}` senza title")
            notes.append("title")
        desc = re.search(r'<meta name="description" content="([^"]*)"', html)
        if not desc:
            rep.warn.append(f"`{path}` senza meta description")
            notes.append("description")
        elif not 50 <= len(desc.group(1)) <= 170:
            rep.warn.append(f"`{path}` description di {len(desc.group(1))} caratteri (ideale 50–160)")
        if elapsed > SLOW_RESPONSE_S:
            rep.warn.append(f"`{path}` lenta: {elapsed:.1f}s")
        rep.pages.append((path, resp.status_code, elapsed, ", ".join(notes) or "ok"))

    rep.metrics["avg_response_s"] = round(
        sum(p[2] for p in rep.pages) / max(len(rep.pages), 1), 2
    )


def check_sitemap(client: httpx.Client, rep: Report) -> list[str]:
    resp, _ = fetch(client, f"{SITE}/sitemap.xml")
    if resp is None or resp.status_code != 200:
        rep.fail.append("sitemap.xml non raggiungibile")
        return []
    urls = re.findall(r"<loc>([^<]+)</loc>", resp.text)
    editions = sorted(u for u in urls if re.search(r"/weekly/\d{4}-\d{2}-\d{2}$", u))
    rep.metrics["sitemap_urls"] = len(urls)
    rep.metrics["editions"] = len(editions)
    rep.ok.append(f"sitemap: {len(urls)} URL, di cui {len(editions)} edizioni")

    broken = []
    for u in urls:
        r = client.head(u)
        if r.status_code != 200:
            broken.append(f"{u} ({r.status_code})")
    if broken:
        rep.fail.append("URL in sitemap non raggiungibili: " + "; ".join(broken))
    else:
        rep.ok.append("tutti gli URL della sitemap rispondono 200")
    return editions


def check_freshness(client: httpx.Client, rep: Report, editions: list[str]) -> str | None:
    if not editions:
        rep.fail.append("nessuna edizione in sitemap")
        return None
    latest = editions[-1]
    latest_date = date.fromisoformat(latest.rsplit("/", 1)[1])
    age = (date.today() - latest_date).days
    rep.metrics["latest_edition"] = latest_date.isoformat()
    rep.metrics["latest_age_days"] = age
    if age > MAX_EDITION_AGE_DAYS:
        rep.fail.append(
            f"ultima edizione del {latest_date.isoformat()} ({age} giorni fa): la pipeline potrebbe non aver pubblicato"
        )
    else:
        rep.ok.append(f"ultima edizione: {latest_date.isoformat()} ({age} giorni fa)")

    resp, _ = fetch(client, f"{SITE}/")
    slug = latest.rsplit("/", 1)[1]
    if resp is not None and f"/weekly/{slug}" in resp.text:
        rep.ok.append("home: \"Ultima edizione\" allineata all'ultima pubblicata")
    else:
        rep.fail.append(f"home: \"Ultima edizione\" non mostra l'edizione {slug}")

    resp, _ = fetch(client, latest)
    if resp is not None:
        if '"author":{"@type":"Person"' in resp.text and "Massimiliano Masi" in resp.text:
            rep.ok.append("ultima edizione: autore Massimiliano Masi nello schema")
        else:
            rep.fail.append("ultima edizione: autore mancante nello schema")
    return latest


def check_feed(client: httpx.Client, rep: Report, latest: str | None) -> None:
    resp, _ = fetch(client, f"{SITE}/weekly/feed.xml")
    if resp is None or resp.status_code != 200:
        rep.fail.append("feed RSS non raggiungibile")
        return
    try:
        xml.dom.minidom.parseString(resp.content)
    except Exception as e:  # noqa: BLE001 — qualsiasi errore di parsing è un fallimento
        rep.fail.append(f"feed RSS non valido: {e}")
        return
    items = resp.text.count("<item>")
    rep.metrics["feed_items"] = items
    if latest and latest not in resp.text:
        rep.warn.append("feed RSS non contiene ancora l'ultima edizione (cache fino a 1h)")
    else:
        rep.ok.append(f"feed RSS valido, {items} edizioni")


def check_static(client: httpx.Client, rep: Report) -> None:
    checks = {
        "/robots.txt": "Sitemap: https://apulia.ai/sitemap.xml",
        "/llms.txt": "Massimiliano Masi",
        "/BingSiteAuth.xml": "<user>",
        f"/{INDEXNOW_KEY}.txt": INDEXNOW_KEY,
    }
    for path, needle in checks.items():
        resp, _ = fetch(client, SITE + path)
        if resp is None or resp.status_code != 200 or needle not in resp.text:
            rep.fail.append(f"`{path}` mancante o modificato")
        else:
            rep.ok.append(f"`{path}` presente")

    resp, _ = fetch(client, f"{SITE}/")
    if resp is not None:
        if '"founder":{"@type":"Person"' not in resp.text:
            rep.fail.append("home: founder mancante nello schema dell'organizzazione")
        if "twitter.com/apuliaai" in resp.text:
            rep.warn.append("home: lo schema cita di nuovo il profilo X, che non esiste")


def check_pagespeed(rep: Report, latest: str | None) -> None:
    key = os.environ.get("PSI_API_KEY", "").strip()
    targets = [("home", f"{SITE}/")]
    if latest:
        targets.append(("ultima edizione", latest))

    with httpx.Client(timeout=120) as client:
        for label, url in targets:
            params = {"url": url, "strategy": "mobile", "category": "performance"}
            if key:
                params["key"] = key
            try:
                resp = client.get(
                    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed", params=params
                )
            except httpx.HTTPError as e:
                rep.warn.append(f"PageSpeed {label}: {e}")
                continue
            if resp.status_code != 200:
                rep.warn.append(
                    f"PageSpeed {label}: HTTP {resp.status_code} (senza PSI_API_KEY la quota è limitata)"
                )
                continue
            data = resp.json()
            lh = data.get("lighthouseResult", {})
            score = round((lh.get("categories", {}).get("performance", {}).get("score") or 0) * 100)
            audits = lh.get("audits", {})
            lcp = audits.get("largest-contentful-paint", {}).get("displayValue", "—")
            cls = audits.get("cumulative-layout-shift", {}).get("displayValue", "—")
            tbt = audits.get("total-blocking-time", {}).get("displayValue", "—")
            # Dati reali degli utenti Chrome, se Google ne ha abbastanza
            field_metrics = data.get("loadingExperience", {}).get("metrics", {})
            inp = field_metrics.get("INTERACTION_TO_NEXT_PAINT", {}).get("percentile")
            field_note = f", INP reale {inp} ms" if inp else ", nessun dato reale CrUX"
            rep.psi.append((label, f"punteggio {score}/100 · LCP {lcp} · CLS {cls} · TBT {tbt}{field_note}"))
            rep.metrics[f"psi_{'home' if label == 'home' else 'edition'}"] = score
            if score < 50:
                rep.fail.append(f"PageSpeed mobile {label}: {score}/100")
            elif score < 80:
                rep.warn.append(f"PageSpeed mobile {label}: {score}/100")


def write_report(rep: Report) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    today = date.today().isoformat()
    status = "🔴 problemi" if rep.fail else ("🟡 da guardare" if rep.warn else "🟢 tutto ok")

    lines = [
        f"# Monitoraggio apulia.ai — {today}",
        "",
        f"**Stato:** {status} · {len(rep.fail)} problemi, {len(rep.warn)} avvisi",
        "",
    ]
    if rep.fail:
        lines += ["## Problemi", ""] + [f"- {x}" for x in rep.fail] + [""]
    if rep.warn:
        lines += ["## Avvisi", ""] + [f"- {x}" for x in rep.warn] + [""]
    if rep.psi:
        lines += ["## PageSpeed (mobile)", ""] + [f"- **{l}:** {v}" for l, v in rep.psi] + [""]
    lines += ["## Pagine", "", "| Pagina | HTTP | Tempo | Note |", "|---|---|---|---|"]
    lines += [f"| `{p}` | {c} | {t:.2f}s | {n} |" for p, c, t, n in rep.pages]
    lines += ["", "## Controlli superati", ""] + [f"- {x}" for x in rep.ok]
    lines += [
        "",
        "---",
        "Dati di traffico e posizionamento non inclusi: vanno letti in Google Search Console e Bing Webmaster Tools.",
    ]

    path = OUT_DIR / f"{today}.md"
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    columns = [
        "date", "fail", "warn", "sitemap_urls", "editions", "latest_edition",
        "latest_age_days", "feed_items", "avg_response_s", "psi_home", "psi_edition",
    ]
    new_file = not HISTORY.exists()
    with HISTORY.open("a", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        if new_file:
            writer.writerow(columns)
        row = {"date": today, "fail": len(rep.fail), "warn": len(rep.warn), **rep.metrics}
        writer.writerow([row.get(c, "") for c in columns])
    return path


def main() -> int:
    print(f"[seo-monitor] {datetime.now():%Y-%m-%d %H:%M} — controllo {SITE}")
    rep = Report()
    with httpx.Client(timeout=30, headers=HEADERS, follow_redirects=True) as client:
        editions = check_sitemap(client, rep)
        latest = check_freshness(client, rep, editions)
        check_pages(client, rep, latest)
        check_feed(client, rep, latest)
        check_static(client, rep)
    check_pagespeed(rep, latest)

    path = write_report(rep)
    print(f"[seo-monitor] {len(rep.fail)} problemi, {len(rep.warn)} avvisi — report: {path}")
    return 1 if rep.fail else 0


if __name__ == "__main__":
    sys.exit(main())
