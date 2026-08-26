# apulia.ai — Landing page (italiano)

Copy pronto per implementazione. Struttura sezione-per-sezione con testo italiano definitivo, classi suggerite e note di intent. **Non rivelare la strategia wedge/agentic** nel testo pubblico (vedi `memory/feedback_website_messaging.md`).

---

## 0. Meta / SEO

- **Title:** apulia.ai — AI applicata che lavora dentro la tua azienda
- **Meta description:** apulia.ai costruisce sistemi di AI che leggono il tuo mercato, si collegano ai tuoi dati e indicano al tuo team cosa fare. Decisioni, non dashboard.
- **OG image:** generare un'immagine 1200×630 con il claim "AI che lavora dentro la tua azienda, non accanto."
- **Lingua HTML:** `<html lang="it">`

---

## 1. Hero

**Eyebrow:** `AI APPLICATA · PMI E AZIENDE MID-MARKET`

**H1:**
> Trasforma i segnali del tuo settore e i dati della tua azienda in decisioni che puoi prendere questa settimana.

**Sottotitolo:**
> apulia.ai costruisce i sistemi di AI che leggono ciò che succede nel tuo mercato, li collegano a ciò che succede nella tua azienda, e dicono al tuo team cosa fare di concreto.

**CTA primaria:** `Prenota una call di discovery (30 min)` → form / Calendly
**CTA secondaria:** `Leggi il brief settimanale` → link al newsletter (proof point, non prodotto)

**Note di intent:**
- L'H1 vende *decisioni*, non tecnologia.
- Il newsletter è posizionato come prova di competenza di mercato, non come offerta principale.
- Evita parole come "agente", "agentic", "prompt".

---

## 2. Tre pilastri di valore (cards)

**Eyebrow:** `COSA FACCIAMO`
**H2:** Dall'intelligenza di mercato all'azione operativa.

### Card 1 — Intelligenza di settore, industrializzata
Monitoriamo il tuo settore in modo continuo e portiamo in superficie ciò che conta — finanziamenti, concorrenti, regolamentazione, shift tecnologici — filtrato sul contesto della tua azienda.

### Card 2 — Collegata ai tuoi sistemi
Il nostro lavoro non si ferma a un PDF. Ci integriamo con gli strumenti che il tuo team usa già, così che ogni insight diventi un'azione, non un'altra scheda da aprire.

### Card 3 — Decisioni, non dashboard
Ogni progetto si chiude con raccomandazioni concrete che la leadership può firmare: cosa fare, entro quando, quanto vale.

**Note di intent:** Card 2 è il cavallo di Troia strategico — normalizza l'integrazione come scope standard senza nominare CRM/ERP.

---

## 3. Come lavoriamo — la metodologia in 3 step

**Eyebrow:** `IL METODO APULIA`
**H2:** Tre passi, dal primo segnale all'azione automatizzata.

### Step 1 — Ascoltare
Intelligence settimanale sul tuo settore, costruita sul profilo della tua azienda. È il modo più semplice per cominciare a lavorare insieme.
*Tag:* `Entry · Basso impegno`

### Step 2 — Collegare
Mappiamo i tuoi dati interni e i tuoi processi rispetto ai segnali esterni che li influenzano. Capiamo dove l'AI può davvero spostare l'ago.
*Tag:* `Discovery · 2–4 settimane`

### Step 3 — Agire
Mettiamo in produzione i sistemi di AI che trasformano quella mappatura in workflow automatizzati e supporto alle decisioni.
*Tag:* `Progetto / retainer`

**Note di intent:** Questa è la scala land-and-expand espressa come metodologia di consulenza. Il cliente la legge come rigore professionale.

---

## 4. Settori serviti / credibilità

**Eyebrow:** `SETTORI`
**H2:** Lavoriamo dove l'AI applicata fa la differenza più velocemente.

Lista (logo o pill):
- Servizi finanziari
- Industria e manifattura
- Servizi professionali
- Pubblica amministrazione
- Retail e distribuzione

**Sotto:** una riga di outcome concreti (sostituire con dati reali appena disponibili):
- *"Da 6 ore a 20 minuti per la review competitiva settimanale."*
- *"Tre cambi regolatori intercettati prima dei concorrenti."*
- *"Pipeline commerciale arricchita con segnali esterni in tempo reale."*

---

## 5. Perché apulia.ai

**H2:** Non vendiamo slide. Mettiamo in produzione.

Tre punti brevi:

- **AI applicata, non teorica.** Consegniamo sistemi funzionanti, non deck di consulenza.
- **Radicati nel settore.** Competenza verticale per ogni progetto, non AI generica.
- **Prezzo legato al risultato.** I nostri compensi sono ancorati al valore di business, non alle ore.

**Note di intent:** Il pricing a valore qualifica i buyer per la motion ad ACV più alto e filtra i tire-kicker.

---

## 6. Founder / about

**Eyebrow:** `CHI SIAMO`
**H2:** Massimiliano Masi — Founder, apulia.ai

Massimiliano lavora con team C-level per progettare ed eseguire programmi di adozione dell'AI ancorati alla chiarezza strategica, non all'hype. apulia.ai nasce per portare la stessa disciplina dentro i sistemi operativi delle aziende italiane.

Link:
- spiridione.com
- LinkedIn

---

## 7. CTA finale

**H2 (domanda):**
> Cosa farebbe il tuo team in modo diverso se i tuoi sistemi sapessero già cosa sta per succedere nel tuo mercato?

**CTA primaria:** `Prenota una call di discovery`
**CTA secondaria:** `Ricevi il brief settimanale`

**Note di intent:** La domanda pianta la visione del sistema agentico senza nominarla. Le due CTA mappano high-intent (call) e low-intent (newsletter), entrambe verso la stessa pipeline.

---

## 8. Footer

- Link: Metodo · Settori · Brief settimanale · Contatti · Privacy · Cookie
- Riga legale: `© {anno} apulia.ai · P.IVA xxxxxxxxxx · Tutti i diritti riservati`

---

## Banned words (non usare nel testo pubblico)

`agente · agentic · prompt · MCP · integration layer · wedge · land and expand · feed strutturato · packet di intelligence`

## Parole-chiave preferite

`decisioni · agire · collegato ai tuoi sistemi · dall'insight all'azione · AI applicata · risultati · settore · concreto · automatizzato`

---

## Stack & implementazione suggerita

- Se il sito apulia.ai è già su Next.js → una singola route `/` con i blocchi sopra, components riusabili `<Hero>`, `<ValuePillars>`, `<Methodology>`, `<Sectors>`, `<WhyUs>`, `<Founder>`, `<FinalCTA>`.
- Form di contatto: invio via email (riusare ZeptoMail se già configurato lato apulia.ai) o salvataggio su Supabase.
- Newsletter CTA: punta all'URL pubblico del brief Kalym (o subdominio apulia.ai dedicato se preferisci tenere il branding separato).
- i18n: solo italiano per ora; predisporre struttura `messages/it.json` se in futuro serve EN.
