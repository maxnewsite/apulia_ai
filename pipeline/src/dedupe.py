"""Cross-edition deduplication.

After each successful render, the fingerprints of articles cited in the
newsletter are persisted to `cache/published_seen.json`. Subsequent runs
filter the fetched pool against this set so the same story never appears
in two consecutive editions.

Each entry: {fingerprint, url, title, first_seen}.
A retention window (default 60 days) prunes very old entries so the file
doesn't grow without bound.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .sources import Article


@dataclass
class SeenEntry:
    fingerprint: str
    url: str
    title: str
    first_seen: str  # ISO date


class SeenStore:
    def __init__(self, path: Path, retention_days: int = 60):
        self.path = path
        self.retention_days = retention_days
        self.entries: dict[str, SeenEntry] = {}
        self._load()

    def _load(self) -> None:
        if not self.path.exists():
            return
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            print(f"[dedupe] impossibile leggere {self.path}; ripartenza da zero")
            return
        cutoff = datetime.now(timezone.utc) - timedelta(days=self.retention_days)
        for row in data:
            try:
                seen_at = datetime.fromisoformat(row["first_seen"])
                if seen_at.tzinfo is None:
                    seen_at = seen_at.replace(tzinfo=timezone.utc)
                if seen_at < cutoff:
                    continue
                self.entries[row["fingerprint"]] = SeenEntry(**row)
            except (KeyError, TypeError, ValueError):
                continue

    def fingerprints(self) -> set[str]:
        return set(self.entries.keys())

    def filter_unseen(self, articles: list[Article]) -> tuple[list[Article], int]:
        """Return (kept, dropped_count)."""
        seen = self.fingerprints()
        kept = [a for a in articles if a.fingerprint not in seen]
        return kept, len(articles) - len(kept)

    def add(self, articles: list[Article], when: datetime | None = None) -> int:
        when = when or datetime.now(timezone.utc)
        added = 0
        for a in articles:
            if a.fingerprint and a.fingerprint not in self.entries:
                self.entries[a.fingerprint] = SeenEntry(
                    fingerprint=a.fingerprint,
                    url=a.url,
                    title=a.title,
                    first_seen=when.isoformat(),
                )
                added += 1
        return added

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        rows = [e.__dict__ for e in self.entries.values()]
        self.path.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")

    def reset(self) -> None:
        self.entries.clear()
        if self.path.exists():
            self.path.unlink()
