# apulia.ai — Guida di Produzione: AI Europa Weekly

> Newsletter settimanale. Esce ogni **martedì mattina** (ore 8:00 IT).
> Tempo di produzione stimato: 3-4 ore totali (distribuite tra lunedì pomeriggio e martedì mattina)

---

## Struttura dell'Issue

```
┌─────────────────────────────────────┐
│  MASTHEAD                           │  Logo + data + numero issue
├─────────────────────────────────────┤
│  HERO                               │  Titolo settimana + 4 stat chiave
│  + AUDIENCE (sidebar)               │  Chi legge e perché
├──────────┬──────────┬───────────────┤
│ THE MOVE │THE OPEN. │ THE SIGNAL    │  3 colonne storie
│ (fatto   │(opport.  │ (regolamento/ │
│ chiave)  │business) │ trend)        │
├──────────┴──────────┴───────────────┤
│  FUNDING RADAR                      │  Deal della settimana EU/IT
│  REGULATORY PULSE                   │  AI Act + normative IT
│  THE NUMBER                         │  Stat della settimana
│  NEXT WEEK WATCH                    │  Da tenere d'occhio
├─────────────────────────────────────┤
│  CTA → BRIEFING MENSILE             │  Upsell premium
├─────────────────────────────────────┤
│  FOOTER                             │  Unsubscribe, contatti
└─────────────────────────────────────┘
```

---

## Calendario di Produzione

### Lunedì 14:00 — Raccolta notizie
- Scorri tutte le fonti nella lista `eu-italy-ai-sources.md`
- Raccogli 15-20 notizie candidate in un documento di lavoro
- Classifica per rilevanza (Alta / Media / Bassa)
- Identifica i pattern: c'è un tema dominante questa settimana?

### Lunedì 17:00 — Selezione e struttura
- Scegli **la storia principale** (THE MOVE): massimo un fatto che ha cambiato qualcosa
- Scegli **l'opportunità** (THE OPENING): un'apertura di mercato, partnership, bando
- Scegli **il segnale** (THE SIGNAL): regolamento, ricerca, trend emergente
- Identifica i 2-3 deal per Funding Radar
- Identifica 1-2 aggiornamenti per Regulatory Pulse
- Seleziona The Number

### Martedì 07:00 — Scrittura e revisione
- Scrivi i 3 articoli principali (300-500 parole ciascuno)
- Compila le sezioni di dati (Funding, Regulatory, Number)
- Revisione finale: accuratezza, tono, link
- Genera HTML da template
- Test su client email (Gmail, Outlook, Apple Mail)
- Invio ore 8:00

---

## Prompt Claude per Produzione Settimanale

Usa questo prompt ogni lunedì per accelerare la raccolta e sintesi:

```
Sei l'editor di apulia.ai, newsletter di intelligence strategica sull'AI in Europa con focus Italia.

Questa settimana le notizie principali che ho raccolto sono:
[INCOLLA QUI LE NOTIZIE RACCOLTE]

Produci la struttura per questa settimana:

1. THE MOVE (titolo + sommario 150 parole): Il fatto più importante che ha CAMBIATO qualcosa nel panorama AI europeo/italiano questa settimana. Deve essere concreto, con numeri se disponibili, con implicazioni pratiche per chi opera nel settore.

2. THE OPENING (titolo + sommario 150 parole): Un'opportunità di mercato concreta emersa questa settimana — bando, partnership, procurement, apertura regolatoria, funding disponibile. Per chi? Con quale urgenza?

3. THE SIGNAL (titolo + sommario 150 parole): Un segnale debole o forte che indica dove l'AI europea/italiana andrà nei prossimi 6-12 mesi. Può essere un paper di ricerca, una mossa geopolitica, un cambiamento normativo.

4. FUNDING RADAR: 3 deal della settimana in formato tabella:
   Azienda | Paese | Round | €M | Investitori chiave | Focus AI

5. REGULATORY PULSE: 2 aggiornamenti normativi brevi (2-3 righe ciascuno) — AI Act implementation, normative italiane, guidance EDPB, ecc.

6. THE NUMBER: Un dato statistico significativo con contesto (3-4 righe).

7. NEXT WEEK WATCH: 2-3 cose da tenere d'occhio la prossima settimana (eventi, scadenze, annunci attesi).

Tono: professionale ma diretto. Niente fluff. Ogni affermazione è verificabile. Il lettore è un professionista che decide — non ha tempo da perdere.
```

---

## Tono e Voce

**apulia.ai non è:**
- Una rassegna stampa (non lista notizie, le analizza)
- Un bollettino tecnico (non spiega come funziona il transformer)
- Una newsletter entusiasta (non "rivoluzione epocale" ogni settimana)

**apulia.ai è:**
- Intelligence strategica per chi decide
- Analisi del perché una notizia conta per il mercato italiano/europeo
- Segnali tradotti in implicazioni operative

**Frasi da evitare:**
- "rivoluzione", "disruptive", "game-changer" (senza numeri concreti)
- "è importante notare che..."
- "come tutti sanno..."
- Gergo tecnico senza spiegazione

**Struttura di ogni storia:**
1. **Il fatto** — cosa è successo, con chi, quando, con quali numeri
2. **Perché conta** — implicazione concreta per il lettore
3. **Cosa fare** — azione o domanda da porre

---

## Metriche di Qualità

Ogni issue deve rispondere YES a queste domande:
- [ ] Il lettore può citare almeno 2 fatti specifici dopo aver letto?
- [ ] C'è almeno un'implicazione pratica per chi opera in Italia?
- [ ] Tutte le affermazioni quantitative hanno fonte citata?
- [ ] Il template HTML è correttamente generato e testato?
- [ ] L'oggetto dell'email è specifico (non generico come "Notizie AI")?

---

## Oggetti Email Efficaci

Formato: `[DATO O FATTO CONCRETO] + angolo sorprendente`

Esempi:
- `€340M in 7 giorni: il VC europeo scommette sull'AI sovrana`
- `L'Italia approva il regolamento AI per la PA — cosa cambia da luglio`
- `Mistral supera GPT-4 su benchmark legali europei`
- `Il PNRR AI: dove sono finiti i 450M stanziati nel 2025`

---

## Checklist Pre-Invio

- [ ] Tre storie principali complete (>200 parole ciascuna)
- [ ] Funding Radar: almeno 2 deal
- [ ] Regulatory Pulse: almeno 1 aggiornamento
- [ ] The Number presente con fonte
- [ ] Link a fonti primarie funzionanti
- [ ] HTML testato su mobile
- [ ] Oggetto email approvato
- [ ] Numero issue aggiornato
- [ ] Data aggiornata
- [ ] Link unsubscribe funzionante
- [ ] Supabase: issue salvata nel database
