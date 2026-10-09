"""Riscrive titolo e sottotitolo delle edizioni weekly già pubblicate.

Le edizioni pubblicate prima dei titoli SEO hanno tutte un titolo del tipo
"AI EUROPA WEEKLY — 28 settembre – 4 ottobre 2026", che nessuno cerca.
Questo script legge gli sviluppi chiave dall'HTML archiviato e genera
titolo e description con lo stesso agente usato dalla pipeline.

Uso (dalla cartella pipeline/):
  python scripts/backfill_seo_titles.py            # prova: mostra, non scrive
  python scripts/backfill_seo_titles.py --apply    # scrive, con backup
  python scripts/backfill_seo_titles.py --restore output/seo-backfill-backup-*.json

URL e slug non cambiano: cambiano solo title e dek.
"""

from __future__ import annotations

try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

import argparse
import html
import json
import re
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env")

from src.agents import write_seo_meta  # noqa: E402
from src.publish import _client  # noqa: E402

# Titolo generico pubblicato prima dei titoli SEO: solo questi si riscrivono
GENERIC_TITLE = re.compile(r"^AI EUROPA WEEKLY\b", re.IGNORECASE)


def key_developments(html_content: str) -> list[str]:
    """Testi della sezione "Sviluppi Chiave" dell'HTML di un'edizione."""
    start = html_content.find("Sviluppi Chiave")
    if start == -1:
        return []
    end = html_content.find('<div class="section"', start)
    section = html_content[start : end if end != -1 else None]
    out = []
    for m in re.finditer(
        r'<span class="bullet-text">([\s\S]*?)(?:<span class="bullet-sources"|</span>)', section
    ):
        text = html.unescape(re.sub(r"<[^>]+>", "", m.group(1)))
        text = re.sub(r"\s+", " ", text).strip()
        if len(text) > 20:
            out.append(text)
    return out


def restore(supabase, backup: Path) -> int:
    rows = json.loads(backup.read_text(encoding="utf-8"))
    for row in rows:
        supabase.table("newsletter_issues").update(
            {"title": row["title"], "dek": row["dek"]}
        ).eq("id", row["id"]).execute()
        print(f"  ripristinata {row['slug']}")
    print(f"[restore] {len(rows)} edizioni ripristinate da {backup.name}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--apply", action="store_true", help="scrive su Supabase (default: solo prova)")
    parser.add_argument("--restore", type=Path, help="ripristina title/dek da un file di backup")
    args = parser.parse_args()

    supabase = _client()
    if args.restore:
        return restore(supabase, args.restore)

    issues = (
        supabase.table("newsletter_issues")
        .select("id, slug, issue_number, title, dek, html_content")
        .eq("type", "weekly")
        .eq("status", "published")
        .order("issue_number")
        .execute()
        .data
        or []
    )
    todo = [i for i in issues if GENERIC_TITLE.match(i["title"] or "")]
    print(f"[backfill] {len(issues)} edizioni, {len(todo)} con titolo generico")

    changes = []
    # Titoli già decisi (esistenti non generici + generati in questo giro),
    # in ordine di edizione: evitano titoli duplicati fra settimane vicine.
    headlines = [i["title"] for i in issues if not GENERIC_TITLE.match(i["title"] or "")]
    for issue in todo:
        devs = key_developments(issue["html_content"] or "")
        seo = write_seo_meta(devs, recent_headlines=headlines[-4:])
        if seo:
            headlines.append(seo["headline"])
        if not seo:
            print(f"  #{issue['issue_number']} {issue['slug']}: SALTATA (nessun titolo valido)")
            continue
        print(f"\n  #{issue['issue_number']} {issue['slug']}")
        print(f"    prima:  {issue['title']}")
        print(f"    titolo: {seo['headline']}  ({len(seo['headline'])} car.)")
        print(f"    descr.: {seo['description']}  ({len(seo['description'])} car.)")
        changes.append((issue, seo))

    if not args.apply:
        print(f"\n[backfill] prova: {len(changes)} edizioni da aggiornare. Nulla è stato scritto. Usa --apply.")
        return 0

    backup = ROOT / "output" / f"seo-backfill-backup-{datetime.now():%Y%m%d-%H%M%S}.json"
    backup.parent.mkdir(parents=True, exist_ok=True)
    backup.write_text(
        json.dumps(
            [{"id": i["id"], "slug": i["slug"], "title": i["title"], "dek": i["dek"]} for i, _ in changes],
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"\n[backfill] backup dei valori originali: {backup}")

    for issue, seo in changes:
        supabase.table("newsletter_issues").update(
            {"title": seo["headline"], "dek": seo["description"]}
        ).eq("id", issue["id"]).execute()
    print(f"[backfill] {len(changes)} edizioni aggiornate")
    return 0


if __name__ == "__main__":
    sys.exit(main())
