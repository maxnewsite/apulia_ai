"""CLI entry point: genera il Briefing Strategico Mensile apulia.ai end-to-end.

Fasi:
  1. fetch (30 giorni) + classifica + analizza -> oggetto MonthlyBrief strutturato
  2. renderizza HTML + PDF
  3. (opzionale) pubblica su Supabase
  4. (opzionale) consegna agli iscritti premium (monthly) via email

Uso:
  python run_monthly.py
  python run_monthly.py --publish --deliver
  python run_monthly.py --no-pdf --open
"""

from __future__ import annotations

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

from src.pdf import render_pdf
from src.pipeline_monthly import build_monthly_brief, save_monthly
from src.render_monthly import render_monthly_html


ROOT = Path(__file__).resolve().parent
CONFIG = ROOT / "config" / "sources.yaml"
TEMPLATES = ROOT / "templates"
OUTPUT = ROOT / "output"


def main() -> int:
    parser = argparse.ArgumentParser(description="Genera il Briefing Strategico Mensile apulia.ai")
    parser.add_argument("--open", action="store_true",
                        help="Apri l'HTML nel browser al termine")
    parser.add_argument("--no-pdf", action="store_true",
                        help="Salta la generazione PDF (solo HTML)")
    parser.add_argument("--publish", action="store_true",
                        help="Carica su Supabase e aggiorna newsletter_issues")
    parser.add_argument("--deliver", action="store_true",
                        help="Invia agli iscritti monthly (attivato automaticamente dopo --publish)")
    parser.add_argument("--no-deliver", action="store_true", dest="no_deliver",
                        help="Sopprime la consegna anche quando si pubblica")
    args = parser.parse_args()

    load_dotenv(ROOT / ".env", override=True)
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("[fatale] ANTHROPIC_API_KEY non impostato (in env o .env)", file=sys.stderr)
        return 2

    print("=" * 60)
    print("BRIEFING STRATEGICO MENSILE — pipeline di generazione mensile")
    print("=" * 60)

    cfg = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))

    # 1. Build
    brief, cited = build_monthly_brief(CONFIG)

    json_path = save_monthly(brief, OUTPUT)
    print(f"\n[salvato] strutturato: {json_path}")

    html_path = render_monthly_html(
        brief,
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

    # 2. Pubblica
    published_issue = None
    if args.publish:
        if not pdf_path:
            print("[publish] saltato — nessun PDF prodotto")
        else:
            try:
                from src.publish_monthly import publish_monthly
                published_issue = publish_monthly(brief, html_path, pdf_path)
            except Exception as e:
                print(f"[publish] FALLITO: {e}")

    # 3. Consegna
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
                    issue_type="monthly",
                    reporting_period=brief.reporting_period,
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
