"""Renderizza un oggetto MonthlyBrief in HTML via Jinja2."""

from __future__ import annotations

import shutil
from datetime import datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from .pipeline_monthly import MonthlyBrief


def render_monthly_html(
    brief: MonthlyBrief,
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
    tmpl = env.get_template("monthly.html.j2")
    html = tmpl.render(
        brief=brief,
        countries=countries,
        capabilities=capabilities,
        now=datetime.now().strftime("%Y-%m-%d %H:%M"),
    )

    css_src = templates_dir / "styles.css"
    css_dst = out_dir / "styles.css"
    if css_src.exists():
        shutil.copyfile(css_src, css_dst)

    month_str = datetime.now().strftime("%Y-%m")
    out = out_dir / f"monthly-{month_str}.html"
    out.write_text(html, encoding="utf-8")
    return out
