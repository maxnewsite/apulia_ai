# apulia.ai — Comandi operativi newsletter

Riferimento completo per generare, pubblicare e automatizzare le edizioni di **AI Europa Weekly** e il **Briefing Strategico Mensile**.

---

## 1. Setup iniziale (una volta sola)

### 1.1 Dipendenze Python
```powershell
cd C:\Users\spiri\apulia_ai\pipeline
pip install -r requirements.txt
playwright install chromium
```

### 1.2 Variabili d'ambiente
```powershell
# Copia il template e compila con i valori reali
Copy-Item .env.example .env
notepad .env
```

Valori richiesti in `.env`:
```
ANTHROPIC_API_KEY=sk-ant-...          # obbligatorio sempre
SUPABASE_URL=https://xxx.supabase.co  # obbligatorio per --publish
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # obbligatorio per --publish
ZEPTO_API_KEY=Zoho-enczapikey ...     # obbligatorio per --deliver
ZEPTO_FROM_EMAIL=newsletter@apulia.ai
ZEPTO_FROM_NAME=apulia.ai
```

### 1.3 Supabase — struttura tabella
Crea la tabella `newsletter_issues` nel tuo progetto Supabase (SQL editor):
```sql
create table newsletter_issues (
  id              uuid primary key default gen_random_uuid(),
  type            text not null,          -- 'weekly' | 'monthly'
  issue_number    int  not null,
  title           text not null,
  title_en        text,
  slug            text not null unique,   -- 'weekly-2026-05-25'
  dek             text,
  dek_en          text,
  html_content    text,
  pdf_url         text,
  status          text default 'published',
  published_at    timestamptz not null default now()
);
create index on newsletter_issues (type, published_at desc);
```

### 1.4 Supabase — storage bucket
Nel pannello Supabase → Storage → New bucket:
- **Nome**: `apulia-archive`
- **Public**: No (privato — URL firmati a 7 giorni generati automaticamente)

### 1.5 Variabili d'ambiente landing (Next.js)
Nel file `landing/.env.local` (già esistente o da creare):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
Necessarie perché la landing legga le edizioni e le esponga su `/weekly`.

---

## 2. Pipeline weekly — comandi

Tutti i comandi si eseguono dalla directory `pipeline/`:
```powershell
cd C:\Users\spiri\apulia_ai\pipeline
```

### 2.1 Genera solo (HTML + PDF locali, nessun upload)
```powershell
python run_weekly.py
```
Output in `output/weekly-YYYY-MM-DD.html` e `output/weekly-YYYY-MM-DD.pdf`.

### 2.2 Genera e apri nel browser
```powershell
python run_weekly.py --open
```

### 2.3 Solo HTML, senza PDF (più veloce per revisione testo)
```powershell
python run_weekly.py --no-pdf --open
```

### 2.4 Genera e pubblica su Supabase (senza email)
```powershell
python run_weekly.py --publish --no-deliver
```
Esegue upload PDF su `apulia-archive`, upsert su `newsletter_issues`.  
La pagina `/weekly/YYYY-MM-DD` sarà live entro 1 ora (ISR revalidate=3600).

### 2.5 Genera, pubblica e invia agli iscritti (produzione)
```powershell
python run_weekly.py --publish --deliver
```

### 2.6 Test layout con articoli già pubblicati (bypassa dedup)
```powershell
python run_weekly.py --no-dedup --no-pdf --open
```

### 2.7 Resetta la storia di deduplicazione
```powershell
python run_weekly.py --reset-seen
```
Utile se vuoi che il fetch ignori gli articoli già usati in passato.

---

## 3. Pipeline monthly — comandi

```powershell
cd C:\Users\spiri\apulia_ai\pipeline
```

### 3.1 Genera solo
```powershell
python run_monthly.py
```

### 3.2 Genera, pubblica e invia (produzione)
```powershell
python run_monthly.py --publish --deliver
```

### 3.3 Solo HTML, senza PDF
```powershell
python run_monthly.py --no-pdf --open
```

---

## 4. Automazione Windows Task Scheduler

### 4.1 Registra i task (esegui una volta come Admin)
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
cd C:\Users\spiri\apulia_ai\pipeline
.\scripts\register_task.ps1
```

Task creati:
| Task | Quando | Comando |
|------|--------|---------|
| `ApuliaAI-Weekly` | Ogni domenica 14:00 | `run_weekly.py --publish --deliver` |
| `ApuliaAI-Monthly` | Giorno 1 del mese 06:00 | `run_monthly.py --publish --deliver` |

### 4.2 Esegui manualmente un task schedulato
```powershell
Start-ScheduledTask -TaskName 'ApuliaAI-Weekly'
Start-ScheduledTask -TaskName 'ApuliaAI-Monthly'
```

### 4.3 Monitora il log di esecuzione
```powershell
Get-Content C:\Users\spiri\apulia_ai\pipeline\output\scheduler_weekly.log -Tail 50
Get-Content C:\Users\spiri\apulia_ai\pipeline\output\scheduler_monthly.log -Tail 50
```

### 4.4 Rimuovi i task
```powershell
Unregister-ScheduledTask -TaskName 'ApuliaAI-Weekly' -Confirm:$false
Unregister-ScheduledTask -TaskName 'ApuliaAI-Monthly' -Confirm:$false
```

---

## 5. Landing page — comandi sviluppo

```powershell
cd C:\Users\spiri\apulia_ai\landing
```

### 5.1 Avvia dev server
```powershell
npm run dev
```
Apri `http://localhost:3000`.  
Archivio edizioni: `http://localhost:3000/weekly`.  
Edizione singola: `http://localhost:3000/weekly/2026-05-25`.

### 5.2 Build di produzione locale
```powershell
npm run build
npm start
```

### 5.3 Build Docker (con Supabase a build time per pre-rendering)
```powershell
docker build `
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co" `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..." `
  -t apulia-landing .
docker run -p 8080:8080 apulia-landing
```

---

## 6. Deploy su Google Cloud Run

### 6.1 Build e push immagine
```powershell
$PROJECT_ID = "your-gcp-project-id"
$IMAGE = "gcr.io/$PROJECT_ID/apulia-landing"

docker build `
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$env:NEXT_PUBLIC_SUPABASE_URL" `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$env:NEXT_PUBLIC_SUPABASE_ANON_KEY" `
  -t $IMAGE .

docker push $IMAGE
```

### 6.2 Deploy su Cloud Run
```powershell
gcloud run deploy apulia-landing `
  --image $IMAGE `
  --platform managed `
  --region europe-west1 `
  --port 8080 `
  --allow-unauthenticated `
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=$env:NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY=$env:NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

### 6.3 Deploy via GitHub Actions (CI/CD automatico)
Ogni `git push origin main` sulla directory `landing/` triggera il workflow esistente.

---

## 7. Flusso completo di pubblicazione domenicale

```
14:00  Task Scheduler avvia run_weekly.py --publish --deliver
       │
       ├── Fetch RSS + scraping fonti (10-15 min)
       ├── Classificazione AI (Haiku) + scrittura (Sonnet 4.6)
       ├── Render HTML + PDF (Playwright)
       ├── Upload PDF → Supabase Storage apulia-archive/
       ├── Upsert newsletter_issues (slug: weekly-YYYY-MM-DD)
       └── Email iscritti via ZeptoMail
              │
              └── Entro 1h ISR rigenera /weekly e /weekly/YYYY-MM-DD
                  → pagina live su apulia.ai
```

---

## 8. Output e artefatti

| Percorso | Contenuto |
|----------|-----------|
| `pipeline/output/weekly-YYYY-MM-DD.json` | Struttura dati newsletter (debug) |
| `pipeline/output/weekly-YYYY-MM-DD.html` | Copia locale HTML |
| `pipeline/output/weekly-YYYY-MM-DD.pdf` | Copia locale PDF |
| `pipeline/cache/published_seen_weekly.json` | Fingerprint articoli già usati |
| `pipeline/output/scheduler_weekly.log` | Log esecuzioni automatiche |
| Supabase `apulia-archive/weekly/YYYY-MM-DD/` | PDF pubblico (URL firmato 7gg) |
| Supabase `newsletter_issues` | Metadati + HTML content |
| `https://apulia.ai/weekly/YYYY-MM-DD` | Pagina pubblica edizione |

---

## 9. Checklist prima del go-live

- [ ] `.env` compilato con chiavi reali (Anthropic, Supabase, ZeptoMail)
- [ ] Bucket `apulia-archive` creato in Supabase Storage
- [ ] Tabella `newsletter_issues` creata con schema SQL (sezione 1.3)
- [ ] `landing/.env.local` con `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Test manuale: `python run_weekly.py --no-pdf --open` (verifica output non vuoto)
- [ ] Test publish: `python run_weekly.py --publish --no-deliver`
- [ ] Verifica pagina su `localhost:3000/weekly/YYYY-MM-DD`
- [ ] Task Scheduler registrato: `.\scripts\register_task.ps1` (come Admin)
- [ ] ZeptoMail configurato e testato con `--deliver`
