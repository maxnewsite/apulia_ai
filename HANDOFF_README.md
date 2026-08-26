# apulia.ai handoff bundle

Tutto quello che ti serve per portare la discussione strategica + il copy della landing nel progetto apulia.ai.

## Cosa contiene

```
apulia-handoff/
├── README.md                           ← questo file
├── LANDING_IT.md                       ← copy italiano della landing, pronto da implementare
└── memory/
    ├── MEMORY.md                       ← indice memoria
    ├── project_apulia_strategy.md      ← strategia wedge / agentic layer
    └── feedback_website_messaging.md   ← regole su cosa NON dire in pubblico
```

## Come usarlo nella cartella del progetto apulia.ai

### 1. Copia la memoria

Dentro il progetto apulia.ai trova (o crea) la cartella memoria di Claude Code. Il path tipico è:

```
C:\Users\spiri\.claude\projects\<nome-cartella-encodata>\memory\
```

Il `<nome-cartella-encodata>` è il path della tua cartella apulia.ai con `\` sostituiti da `-` e `:` rimossi. Esempi:
- `C:\Users\spiri\apulia` → `C--Users-spiri-apulia`
- `C:\dev\apulia.ai` → `C--dev-apulia.ai`

Copia i 3 file dentro `apulia-handoff/memory/` in quella cartella. La prossima sessione di Claude in quella directory vedrà automaticamente `MEMORY.md` e potrà leggere le strategie.

### 2. Implementa la landing

Apri Claude Code nella cartella del progetto apulia.ai e dagli questo prompt:

> Implementa la landing page in italiano seguendo esattamente la struttura e il copy di `LANDING_IT.md` (copia qui dal handoff bundle se non lo trovi). Usa lo stack già presente nel progetto. Crea components riusabili per Hero, ValuePillars, Methodology, Sectors, WhyUs, Founder, FinalCTA. Non rivelare la strategia wedge/agentic — vedi memory/feedback_website_messaging.md.

(Copia anche `LANDING_IT.md` dentro il progetto apulia.ai — magari in `docs/` o nella root — così Claude lo trova.)

### 3. Verifica locale prima del push

```bash
npm run dev   # o pnpm dev / yarn dev
# apri http://localhost:3000
```

Controlla:
- [ ] Tutti i testi sono in italiano
- [ ] Nessuna delle "banned words" appare (`agente`, `agentic`, `prompt`, `MCP`, `wedge`, `land and expand`)
- [ ] CTA primaria → form discovery
- [ ] CTA secondaria → newsletter
- [ ] Mobile responsive
- [ ] Meta tag SEO italiani

### 4. Push solo dopo la tua review

Quando sei soddisfatto, commit + push + deploy su Cloud Run.
