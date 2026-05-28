"""CLI entry point: genera la newsletter settimanale AI Europa Weekly end-to-end.

Fasi:
  1. fetch + classifica + scrivi + valuta  -> oggetto Newsletter strutturato
  2. renderizza HTML + PDF
  3. (opzionale) pubblica su Supabase storage + tabella newsletter_issues
  4. (opzionale) consegna agli iscritti via email (ZeptoMail)

Uso:
  python run_weekly.py
  python run_weekly.py --publish --deliver
  python run_weekly.py --no-pdf --open
"""

from __future__ import annotations

# Patch SSL per Windows (Anthropic SDK, httpx, supabase usano HTTPS)
try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

import argparse
import os
import sys
from pathlib import Path

import yaml
from dotenv import load_dotenv

from src.dedupe import SeenStore
from src.pdf import render_pdf
from src.pipeline import build_newsletter, save_newsletter
from src.render import render_html


ROOT = Path(__file__).resolve().parent
CONFIG = ROOT / "config" / "sources.yaml"
TEMPLATES = ROOT / "templates"
OUTPUT = ROOT / "output"
SEEN_PATH = ROOT / "cache" / "published_seen_weekly.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="Genera la newsletter settimanale AI Europa Weekly")
    parser.add_argument("--open", action="store_true",
                        help="Apri l'HTML nel browser al termine")
    parser.add_argument("--reset-seen", action="store_true",
                        help="Azzera la storia di deduplicazione prima di eseguire")
    parser.add_argument("--no-dedup", action="store_true",
                        help="Salta la deduplicazione (utile per test layout)")
    parser.add_argument("--no-pdf", action="store_true",
                        help="Salta la generazione PDF (solo HTML)")
    parser.add_argument("--publish", action="store_true",
                        help="Carica PDF + HTML su Supabase e aggiorna newsletter_issues")
    parser.add_argument("--deliver", action="store_true",
                        help="Invia agli iscritti (attivato automaticamente dopo --publish)")
    parser.add_argument("--no-deliver", action="store_true", dest="no_deliver",
                        help="Sopprime la consegna anche quando si pubblica")
    args = parser.parse_args()

    load_dotenv(ROOT / ".env", override=True)
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("[fatale] ANTHROPIC_API_KEY non impostato (in env o .env)", file=sys.stderr)
        return 2

    print("=" * 60)
    print("AI EUROPA WEEKLY — pipeline di generazione settimanale")
    print("=" * 60)

    cfg = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))

    # 1. Dedup store
    seen_store = SeenStore(SEEN_PATH)
    if args.reset_seen:
        print("[dedupe] reset seen store")
        seen_store.reset()
    if args.no_dedup:
        print("[dedupe] disabilitato per questa esecuzione")
        store_for_pipeline = None
    else:
        print(f"[dedupe] caricati {len(seen_store.fingerprints())} fingerprint già pubblicati")
        store_for_pipeline = seen_store

    # 2. Build
    nl, cited = build_newsletter(CONFIG, seen_store=store_for_pipeline, cadence="weekly")

    json_path = save_newsletter(nl, OUTPUT)
    print(f"\n[salvato] strutturato: {json_path}")

    html_path = render_html(
        nl,
        templates_dir=TEMPLATES,
        out_dir=OUTPUT,
        countries=cfg["countries"],
        capabilities=cfg["capabilities"],
    )
    print(f"[salvato] html:       {html_path}")

    pdf_path = None
    if not args.no_pdf:
        try:
            pdf_path = render_pdf(html_path)
            print(f"[salvato] pdf:        {pdf_path}")
        except Exception as e:
            print(f"[warn] rendering PDF fallito: {e}")

    # 3. Persisti dedup
    if cited:
        added = seen_store.add(cited)
        seen_store.save()
        print(f"[dedupe] aggiunti {added} nuovi fingerprint (totale: {len(seen_store.fingerprints())})")

    # 4. Pubblica
    published_issue = None
    if args.publish:
        if not pdf_path:
            print("[publish] saltato — nessun PDF prodotto")
        else:
            try:
                from src.publish import publish
                published_issue = publish(nl, html_path, pdf_path)
            except Exception as e:
                print(f"[publish] FALLITO: {e}")

    # 5. Consegna — automatica dopo publish riuscito a meno che non sia soppressa
    should_deliver = not args.no_deliver and (args.publish or args.deliver)
    if should_deliver:
        if not (pdf_path and published_issue):
            print("[deliver] saltato — publish non riuscito o nessun PDF")
        else:
            try:
                from src.delivery import deliver
                deliver(
                    pdf_path=pdf_path,
                    issue_id=published_issue.issue_id,
                    issue_type="weekly",
                    reporting_period=nl.reporting_period,
                )
            except Exception as e:
                print(f"[deliver] FALLITO: {e}")

    print("\nCompletato. Apri nel browser:")
    print(f"  file:///{html_path.as_posix()}")

    if args.open:
        import webbrowser
        webbrowser.open(html_path.as_uri())

    return 0


if __name__ == "__main__":
    sys.exit(main())
