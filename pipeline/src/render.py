"""Renderizza un oggetto Newsletter in HTML via Jinja2."""

from __future__ import annotations

import shutil
from datetime import datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from .pipeline import Newsletter


def render_html(
    nl: Newsletter,
    templates_dir: Path,
    out_dir: Path,
    countries: list[str],
    capabilities: list[str],
) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)

    env = Environment(
        loader=FileSystemLoader(str(templates_dir)),
        autoescape=select_autoescape(["html", "xml"]),
        trim_blocks=True,
        lstrip_blocks=True,
    )
    tmpl = env.get_template("weekly.html.j2")
    html = tmpl.render(
        nl=nl,
        countries=countries,
        capabilities=capabilities,
        now=datetime.now().strftime("%Y-%m-%d %H:%M"),
    )

    css_src = templates_dir / "styles.css"
    css_dst = out_dir / "styles.css"
    if css_src.exists():
        shutil.copyfile(css_src, css_dst)

    for asset in templates_dir.glob("*.webp"):
        shutil.copyfile(asset, out_dir / asset.name)

    fonts_src = templates_dir / "fonts"
    if fonts_src.is_dir():
        shutil.copytree(fonts_src, out_dir / "fonts", dirs_exist_ok=True)

    out = out_dir / f"weekly-{nl.issue_date}.html"
    out.write_text(html, encoding="utf-8")
    return out
