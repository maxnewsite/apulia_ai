"""Render un file HTML newsletter in PDF via Playwright/Chromium."""

from __future__ import annotations

from pathlib import Path

from playwright.sync_api import sync_playwright


def render_pdf(html_path: Path, pdf_path: Path | None = None) -> Path:
    """Renderizza `html_path` in PDF (accanto ad esso o in `pdf_path`)."""
    if pdf_path is None:
        pdf_path = html_path.with_suffix(".pdf")

    file_url = html_path.resolve().as_uri()

    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            page = browser.new_page()
            page.goto(file_url, wait_until="networkidle")
            page.emulate_media(media="print")
            footer = """
<div style="width:100%; margin:0 12mm; padding-top:2mm; border-top:0.5px solid #E2E8F0;
            font-family:'Segoe UI',Arial,sans-serif; font-size:6.5px; color:#94A3B8;
            display:flex; justify-content:space-between; align-items:center;">
  <span style="font-weight:700; color:#0A1628;">apulia<span style="color:#2563EB;">.ai</span></span>
  <span>Intelligence strategica sull'AI in Europa e Italia &nbsp;&middot;&nbsp; apulia.ai</span>
  <span style="color:#475569;">Pagina <span class="pageNumber"></span> di <span class="totalPages"></span></span>
</div>"""
            page.pdf(
                path=str(pdf_path),
                format="A4",
                print_background=True,
                display_header_footer=True,
                header_template="<div></div>",
                footer_template=footer,
                prefer_css_page_size=True,
            )
        finally:
            browser.close()

    return pdf_path


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("usage: python -m src.pdf <html_path>", file=sys.stderr)
        sys.exit(1)
    out = render_pdf(Path(sys.argv[1]))
    print(f"[pdf] scritto {out}")
