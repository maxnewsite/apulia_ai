"""Notifica IndexNow dopo la pubblicazione di un'edizione.

IndexNow avvisa Bing (e quindi la ricerca di ChatGPT e Copilot), Yandex,
Seznam e Naver che un URL è nuovo o cambiato, senza aspettare il crawl.
Google non aderisce: per Google restano la sitemap e Search Console.

La chiave è pubblica per design: il file `<chiave>.txt` servito dal sito
dimostra che chi notifica controlla il dominio.
"""

from __future__ import annotations

import httpx

SITE_HOST = "apulia.ai"
SITE_URL = f"https://{SITE_HOST}"
INDEXNOW_KEY = "2a8d8e60722c4ce13d4692595fcea3b3"
INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"


def notify_new_issue(issue_date: str) -> bool:
    """Segnala edizione, archivio, home e feed. Non solleva mai eccezioni:
    un fallimento qui non deve bloccare consegna o dedup."""
    urls = [
        f"{SITE_URL}/weekly/{issue_date}",
        f"{SITE_URL}/weekly",
        f"{SITE_URL}/",
        f"{SITE_URL}/weekly/feed.xml",
    ]
    payload = {
        "host": SITE_HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": f"{SITE_URL}/{INDEXNOW_KEY}.txt",
        "urlList": urls,
    }
    try:
        resp = httpx.post(INDEXNOW_ENDPOINT, json=payload, timeout=15)
    except httpx.HTTPError as e:
        print(f"[indexnow] notifica fallita: {e}")
        return False
    # 200 = accettato, 202 = ricevuto in attesa di verifica della chiave
    if resp.status_code in (200, 202):
        print(f"[indexnow] notificati {len(urls)} URL (HTTP {resp.status_code})")
        return True
    print(f"[indexnow] risposta inattesa HTTP {resp.status_code}: {resp.text[:200]}")
    return False
