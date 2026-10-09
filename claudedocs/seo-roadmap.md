# Roadmap SEO + GEO — apulia.ai

Documento interno. Non riportare nel copy pubblico i temi di strategia commerciale.

## Fase 1 — Fondamenta tecniche (branch `feat/seo-fase1`)

Fatto nel codice:
- Canonical: rimosso quello hard-coded nel layout che puntava ogni pagina alla home; ora ogni pagina dichiara il proprio.
- hreflang `it-IT`/`en-GB` sullo stesso URL rimosso (layout, chi-siamo, pagina fondatore).
- Schema: `sameAs` di X rimosso (dava 404), `SearchAction` rimossa (il sito non ha ricerca), FAQ schema solo in home dove le FAQ sono visibili.
- Massimiliano Masi come autore (`NewsArticle.author`) e fondatore (`NewsMediaOrganization.founder`), firma visibile su ogni edizione, foto spostata su apulia.ai.
- Sitemap con date reali; aggiunta la pagina del fondatore; tolta `/unsubscribe` (ora `noindex`).
- Feed RSS: `/weekly/feed.xml` (solo sintesi, non aggira il blocco dell'archivio).
- IndexNow: chiave in `landing/public/<chiave>.txt`, notifica dalla pipeline dopo ogni pubblicazione.
- `llms.txt` / `llms-full.txt`: fondatore, archivio, feed.

Da fare a mano (richiede accesso agli account):
- [ ] Verificare `apulia.ai` in Google Search Console e inviare `https://apulia.ai/sitemap.xml`.
- [ ] Verificare `apulia.ai` in Bing Webmaster Tools (importabile da Search Console) e inviare la sitemap.
- [ ] Estrarre il punto di partenza: pagine indicizzate, impression e click per query non-brand.

## Attività rimandate

- [ ] **Account X/Twitter di apulia.ai.** Oggi `twitter.com/apuliaai` non esiste. Quando l'account viene creato, aggiungerlo a `sameAs` in `landing/src/components/SchemaOrg.tsx` e a `landing/public/llms-full.txt`. Un `sameAs` verso una pagina inesistente indebolisce l'identità del brand.
- [ ] **Profilo LinkedIn aziendale.** Verificare che `linkedin.com/company/apulia-ai` esista e sia attivo (LinkedIn blocca i controlli automatici).
- [ ] **Rivedere le FAQ della home.** Alcune risposte (startup citate, cifre di investimento 2024) vanno verificate e aggiornate.
- [ ] **`dateModified` reale** sulle edizioni: serve una colonna `updated_at` in `newsletter_issues`.

## Decisione aperta

- [ ] **Archivio.** Consigliato: testo completo pubblico dopo 4 settimane. In alternativa: gate pieno + `noindex` sulle edizioni bloccate (oggi mostrano ~290 parole contro ~2.930 di un'edizione aperta).

## Fase 2 — Titoli e struttura delle edizioni (pipeline)

- Titolo SEO con la notizia principale; "AI Europa Weekly #N" nel sottotitolo.
- Meta description dalle due notizie principali.
- `<h2>` descrittivo e ancora per ogni notizia; fonte primaria linkata e datata.

## Fase 3 — Pagine tematiche alimentate dalla pipeline

- AI Act: scadenze e obblighi per le aziende italiane.
- Round e investimenti AI in Italia ed Europa.
- Bandi e finanziamenti pubblici per l'AI.
- AI per settore (manifattura, sanità, finanza, PA).
- Regola: una pagina nasce solo con almeno ~5 notizie reali; revisione umana prima della pubblicazione.

## Fase 4 — Autorità e GEO

- Pagina "Redazione e metodo", collegata nello schema al posto di `/privacy`.
- Un dataset originale al trimestre da proporre a testate e associazioni.
- Revisione mensile su 30 domande fisse in ChatGPT, Perplexity, Gemini, Claude.
