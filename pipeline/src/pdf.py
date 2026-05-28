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
            page.pdf(
                path=str(pdf_path),
                format="A4",
                print_background=True,
                margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
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
