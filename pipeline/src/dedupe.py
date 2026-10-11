"""Cross-edition deduplication.

After each successful render, the fingerprints of articles cited in the
newsletter are persisted to `cache/published_seen.json`. Subsequent runs
filter the fetched pool against this set so the same story never appears
in two consecutive editions.

Each entry: {fingerprint, url, title, first_seen}.
A retention window (default 60 days) prunes very old entries so the file
doesn't grow without bound.

On Cloud Run the container filesystem is discarded after every execution,
so the local file alone never survives between editions. When Supabase
credentials are present the file is mirrored to the private storage bucket:
`pull_remote()` before loading, `push_remote()` after saving.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .sources import Article


REMOTE_BUCKET = "apulia-archive"
REMOTE_DIR = "state"


def _storage():
    """Bucket Supabase, o None se le credenziali non sono configurate."""
    url = (os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or "").strip()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or not key:
        return None
    from supabase import create_client
    return create_client(url, key).storage.from_(REMOTE_BUCKET)


def pull_remote(path: Path) -> bool:
    """Scarica la copia remota del seen store su `path`. True se scaricata.

    Senza credenziali, o se il file remoto non esiste ancora, resta valido
    il file locale: la deduplica non deve mai bloccare la pipeline.
    """
    try:
        bucket = _storage()
        if bucket is None:
            return False
        remote = f"{REMOTE_DIR}/{path.name}"
        if not any(f["name"] == path.name for f in bucket.list(REMOTE_DIR)):
            print(f"[dedupe] nessuna copia remota ({REMOTE_BUCKET}/{remote}); uso il file locale")
            return False
        data = bucket.download(remote)
    except Exception as e:  # noqa: BLE001 — qualsiasi errore: si prosegue col locale
        print(f"[dedupe] WARN download copia remota fallito: {e}")
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return True


def push_remote(path: Path) -> bool:
    """Carica `path` nello storage Supabase. True se caricato."""
    try:
        bucket = _storage()
        if bucket is None:
            return False
        remote = f"{REMOTE_DIR}/{path.name}"
        bucket.upload(
            path=remote,
            file=path.read_bytes(),
            file_options={"content-type": "application/json", "upsert": "true"},
        )
    except Exception as e:  # noqa: BLE001 — l'edizione è già pubblicata: solo avviso
        print(f"[dedupe] ERRORE upload copia remota fallito, la prossima edizione potrà ripetere notizie: {e}")
        return False
    print(f"[dedupe] copia remota aggiornata ({REMOTE_BUCKET}/{remote})")
    return True


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
