# apulia.ai — Guida di Produzione: Briefing Strategico Mensile

> Analisi premium. Esce **il primo martedì del mese** (ore 8:00 IT).
> Riservato agli iscritti premium. 8-12 pagine PDF + HTML.
> Tempo di produzione: 2-3 giorni (ultima settimana del mese precedente)

---

## Struttura del Briefing Mensile

```
┌─────────────────────────────────────────┐
│  MASTHEAD                               │  Logo + mese + numero issue
├─────────────────────────────────────────┤
│  HERO + AUDIENCE                        │  Tesi del mese + chi legge
│  4 indicatori chiave del mese           │
├──────────────────────────────────────────┤
│  STORIA 1: THE MOVE                     │  Fatto strutturale del mese
│  (800-1.000 parole)                     │
├──────────────────────────────────────────┤
│  STORIA 2: THE OPENING                  │  Finestre di opportunità
│  (600-800 parole)                       │
├──────────────────────────────────────────┤
│  STORIA 3: THE SIGNAL                   │  Tendenza emergente
│  (600-800 parole)                       │
├──────────────────────────────────────────┤
│  MAPPA DELLE OPPORTUNITÀ                │  Tabella 6-8 finestre strategiche
├──────────────────────────────────────────┤
│  INVESTMENT RADAR                       │  Top deal del mese EU/IT
│  REGULATORY PULSE                       │  AI Act + normative IT del mese
│  THE NUMBER                             │  Dato mensile più rilevante
│  ITALY SPOTLIGHT                        │  Focus esclusivo ecosistema IT
│  NEXT MONTH WATCH                       │  Cosa monitoriamo a giugno
├──────────────────────────────────────────┤
│  CTA → COMMUNITY / CONSULENZA          │  Passo successivo per il lettore
└──────────────────────────────────────────┘
```

---

## Framework di Analisi Strategica

### La tesi mensile
Ogni briefing deve avere **una tesi centrale**: una proposizione verificabile e non ovvia su dove sta andando l'AI europea/italiana questo mese.

**Formato:**
> "Il mese di [MESE] ha dimostrato che [TESI]. Le implicazioni per chi opera nel mercato italiano/europeo sono [IMPLICAZIONI CHIAVE]."

**Esempi di tesi forti:**
- "Maggio 2026: il ritardo italiano nell'AI Act compliance è diventato un vantaggio competitivo per le PMI early mover"
- "Giugno 2026: Mistral + Aleph Alpha convergono su un'architettura LLM sovrana europea che sfida il duopolio USA-Cina"
- "Luglio 2026: il PNRR AI italiano produce i primi 3 unicorn-candidate — ma il problema di scalabilità rimane irrisolto"

---

## La Mappa delle Opportunità

La sezione più distintiva del briefing. Formato tabella con 6-8 righe:

| # | Finestra | Attori target | Tempistica | Punto di ingresso | Impatto strategico |
|---|----------|---------------|-----------|-------------------|-------------------|
| 1 | [nome finestra] | [chi può agire] | [quando] | [come entrare] | [upside] |

**Criteri per includere una finestra:**
- Deve essere aperta ADESSO (non tra 2 anni)
- Deve essere specifica per il mercato EU/IT
- Deve avere un'azione concreta associata
- Deve avere un orizzonte temporale definito

**Categorie di finestre ricorrenti:**
1. **Procurement pubblico**: bandi UE/nazionali aperti
2. **Partnership industriale**: accordi strategici in formazione
3. **Arbitraggio normativo**: vantaggio da asimmetrie regolamentari
4. **Funding gap**: round aperti con slot disponibili
5. **Talent pool**: competenze disponibili per acquisizione
6. **M&A**: target identificabili in settori consolidati
7. **Export opportunity**: mercati EU aperti a soluzioni italiane
8. **Research commercializzabile**: tecnologia accademica matura per il mercato

---

## Prompt Claude per Produzione Mensile

### FASE 1: Raccolta e clustering (giorno 1)

```
Sei l'analista senior di apulia.ai, newsletter di intelligence strategica sull'AI in Europa con focus Italia.

Questo mese [MESE ANNO] ho raccolto le seguenti notizie principali dall'ecosistema AI europeo e italiano:
[INCOLLA QUI 20-30 NOTIZIE DEL MESE]

Esegui questo framework di analisi:

1. CLUSTERING TEMATICO: Raggruppa le notizie in 5-8 cluster tematici. Per ogni cluster: nome, notizie incluse, tendenza che rappresenta.

2. IDENTIFICAZIONE TESI: Proponi 3 possibili tesi mensili (proposizioni non ovvie e verificabili). Ordina per rilevanza per il lettore italiano.

3. RANKING OPPORTUNITÀ: Identifica le 8 finestre di opportunità più concrete emerse questo mese per aziende e professionisti italiani/europei. Per ognuna: nome, descrizione 2 righe, timing, attori target.

4. SEGNALI DEBOLI: Identifica 3 segnali deboli (trend emergenti non ancora mainstream) che potrebbero diventare dominanti nei prossimi 6 mesi.
```

### FASE 2: Stesura approfondita (giorno 2)

```
Sei l'editor di apulia.ai. Sulla base del clustering e della tesi selezionata [TESI], scrivi:

THE MOVE (800-1.000 parole):
Il fatto strutturale del mese — l'evento, decisione o trend che ha cambiato le condizioni del mercato AI europeo/italiano. Deve rispondere a: cosa è successo esattamente, perché è strutturale (non episodico), cosa apre o chiude per chi opera nel settore, quali attori sono avvantaggiati/svantaggiati.

THE OPENING (600-800 parole):
La finestra di opportunità più importante del mese. Deve essere concreta, tempificata, con attori specifici identificati. Deve rispondere a: qual è l'opportunità, chi può coglierla, entro quando, come entrare, qual è il rischio principale.

THE SIGNAL (600-800 parole):
Il segnale più rilevante per i prossimi 6-12 mesi. Può essere un paper accademico, un movimento geopolitico, un cambiamento nelle preferenze dei consumatori, una mossa corporate. Deve rispondere a: cosa indica questo segnale, come si collega ai trend esistenti, quando diventerà mainstream, come posizionarsi adesso.

Tono: analitico ma non accademico. Diretto. Ogni affermazione è supportata da evidenza. Il lettore ha 10 minuti — ogni parola deve guadagnarsi lo spazio.
```

### FASE 3: Italy Spotlight (giorno 2)

```
Scrivi la sezione ITALY SPOTLIGHT per il briefing di [MESE]:

Questa sezione è esclusiva del mercato italiano e deve includere:

1. TOP 3 SVILUPPI ITALIANI DEL MESE (100 parole ciascuno):
   - Startup/azienda italiana con movimento significativo
   - Policy/bando/regolamento italiano rilevante
   - Ricerca/università italiana con impatto di mercato

2. MAPPA STARTUP ITALIANA (tabella):
   Startup | Città | Focus AI | Stage | News del mese | Da monitorare

3. PA DIGITALE UPDATE (150 parole):
   Implementazioni AI nella Pubblica Amministrazione italiana — chi sta sperimentando cosa, risultati misurabili, implicazioni per vendor.

4. TALENT & SKILLS (100 parole):
   Tendenze nel mercato del lavoro AI italiano — ruoli emergenti, università che producono profili, brain drain vs. retention.
```

### FASE 4: Sintesi e revisione (giorno 3)

```
Completa il briefing di [MESE] con:

INVESTMENT RADAR (tabella):
I 5 deal più significativi del mese in EU/IT:
Azienda | Paese | Round | €M | Lead investor | Focus AI | Implicazione strategica

REGULATORY PULSE:
3 aggiornamenti normativi del mese (150 parole ciascuno):
- AI Act: milestone o sviluppo recente
- Italia: normativa AGCOM/MIMIT/ACN rilevante
- GDPR × AI: guidance o enforcement del mese

THE NUMBER:
Il dato statistico mensile più rilevante — con fonte, contesto e implicazione (5-6 righe).

NEXT MONTH WATCH:
5 elementi da monitorare il mese prossimo (1-2 righe ciascuno):
- Data/scadenza
- Evento atteso
- Rischio/opportunità associata
```

---

## Metriche di Qualità del Briefing

Il briefing mensile è premium — standard più alti della weekly:

**Test "decision-maker in 10 minuti":**
- [ ] La tesi mensile è espressa chiaramente entro la prima pagina?
- [ ] La Mappa Opportunità ha almeno 6 voci concrete con timing?
- [ ] Ogni storia principale ha numeri verificabili?
- [ ] L'Italy Spotlight copre almeno un fatto non trovabile altrove?
- [ ] Il lettore può citare 3 fatti specifici dopo la lettura?

**Test di unicità:**
- [ ] Almeno il 50% del contenuto NON è trovabile con Google News?
- [ ] L'analisi aggiunge una prospettiva non presente nelle fonti originali?
- [ ] Le implicazioni pratiche sono specifiche per il contesto IT/EU?

**Test tecnico:**
- [ ] PDF generato correttamente (8-12 pagine, ottimizzato per stampa)?
- [ ] HTML funziona su mobile e desktop?
- [ ] Tutti i link alle fonti funzionano?
- [ ] Template numerato e archiviato in `issues/monthly/`?

---

## Archivio Issues

Ogni issue mensile viene salvata in:
```
issues/monthly/
├── YYYY-MM/
│   ├── briefing-YYYY-MM.html     # Versione web
│   ├── briefing-YYYY-MM.pdf      # Versione PDF
│   └── metadata.json             # Titolo, tesi, data, numero
```

---

## KPI del Briefing Mensile

| Metrica | Target anno 1 |
|---------|---------------|
| Open rate | >45% |
| Click-through rate | >12% |
| Tasso retention abbonati | >85% |
| NPS (survey trimestrale) | >60 |
| Citazioni su media/LinkedIn | >5 per issue |
