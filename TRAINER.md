# Trainer Academy — area riservata apulia.ai

Percorso formativo e di qualifica per i trainer del metodo apulia.ai, servito
da `apulia.ai/trainer` dentro l'app `landing` già in produzione su Cloud Run.

## Il flusso in breve

1. **Candidatura** — `/trainer/registrati`: dati anagrafici, motivazione, CV e
   consenso privacy. Crea un utente Supabase Auth e una riga
   `trainer_profiles` in stato `pending`. Partono due email: la ricevuta al
   candidato e l'avviso al revisore, all'indirizzo in `ADMIN_EMAIL`.
2. **Verifica** — l'admin apre il dossier in `/admin/trainer`, legge il CV
   (link firmato) e approva o respinge. In entrambi i casi parte un'email.
3. **Formazione** — a trainer approvato, `/trainer/dashboard` mostra i moduli
   pubblicati. L'avanzamento è **sequenziale**: il modulo N si apre solo quando
   il quiz del modulo N−1 è superato.
4. **Quiz di modulo** — 10 domande, soglia 80%, massimo 3 tentativi. Esauriti i tentativi
   il modulo si blocca finché l'admin non concede un tentativo extra.
5. **Esame finale** — si apre quando tutti i 10 moduli sono pubblicati e
   superati. Due parti: domande (corrette in automatico, soglia 80%) e un
   video più i materiali allegati, valutati manualmente dal revisore.
6. **Esito** — l'admin qualifica o respinge; il candidato riceve l'email.

## Architettura

| Aspetto | Scelta |
|---|---|
| Autenticazione trainer | Supabase Auth (email + password), sessione in cookie httpOnly via `@supabase/ssr` |
| Autenticazione admin | invariata: cookie HMAC di `src/lib/auth.ts` |
| Gating rotte | `src/proxy.ts` (il middleware di Next 16) su `/trainer/*` e `/api/trainer/*` |
| Isolamento dati | RLS: ogni trainer legge solo le proprie righe; moduli e quiz visibili solo se `status = 'approved'` |
| Domande e risposte corrette | nessuna policy per `authenticated`: servite dalle API route con service-role, che rimuovono `is_correct` |
| Anti-escalation | trigger `trainer_profiles_guard`: un client può modificare la propria anagrafica ma `status`, `email` e i campi di revisione tornano ai valori precedenti. Non è una policy perché una policy su `trainer_profiles` che interroga `trainer_profiles` manda l'RLS in ricorsione infinita |
| PDF e slide | bucket privato `trainer-materials`, signed URL da 120 secondi generata dopo il controllo di autorizzazione |
| Video dei moduli | link esterni (YouTube/Vimeo non in elenco), campo `external_url` |
| CV e consegne d'esame | bucket privati `trainer-cv` e `trainer-submissions` |
| Rate limit registrazione | 5 per IP all'ora e 3 per email al giorno, contatore in tabella (`trainer_rate_check`) e non in memoria: su Cloud Run le istanze sono più di una |
| Verifica email | token nostro su ZeptoMail; l'approvazione è **bloccata** finché l'indirizzo non è confermato |
| Audit | ogni azione del revisore in `trainer_admin_actions`, in append, con l'email del candidato conservata anche dopo la cancellazione |
| Cancellazione GDPR | azione in console: rimuove CV, allegati d'esame e utente Auth, con cascata su profilo, tentativi e consegne |

### File principali

```
supabase/
  schema_trainer.sql          tabelle, RLS, vista di avanzamento, bucket
  seed_trainer.sql            10 moduli + quiz + esame
  schema_trainer_activity.sql tracciamento aperture dei materiali
  schema_trainer_security.sql rate limit, verifica email, audit trail
  seed_trainer_quizzes.sql    70 domande derivate dai deck dei moduli
  seed_trainer_quizzes_9_10.sql  domande 9 e 10 di ogni quiz di modulo
  verify_trainer.sql          report di verifica post-installazione

landing/src/
  lib/supabase-ssr.ts         client Supabase server + refresh sessione nel proxy
  lib/supabase-browser.ts     client Supabase lato browser
  lib/trainer.ts              tipi, curriculum, sblocco sequenziale, correzione
  lib/trainer-session.ts      sessione e gate "trainer approvato"
  lib/trainer-emails.ts       template email transazionali
  proxy.ts                    gating /trainer e /api/trainer

  app/trainer/…               pagine dell'area riservata
  app/admin/trainer/          console di revisione
  app/api/trainer/…           registrazione, quiz, risorse, upload, esame
  app/api/admin/trainers/…    elenco, dossier, azioni del revisore

  components/trainer/         TrainerNav, QuestionList, QuizRunner, ExamClient
```

## Messa in opera

### 1. Database

Nella SQL Editor del progetto Supabase `amkixorrowqbgohzopvi`, in quest'ordine:

```
supabase/schema.sql              (già applicato)
supabase/schema_trainer.sql
supabase/schema_trainer_activity.sql
supabase/schema_trainer_security.sql
supabase/seed_trainer.sql
supabase/seed_trainer_quizzes.sql
supabase/seed_trainer_quizzes_9_10.sql
```

Se hai gia' applicato una versione precedente, rieseguire `seed_trainer.sql`
aggiorna soglia e tentativi dei quiz esistenti (da 70% a 80%) senza toccare
le domande, e `seed_trainer_quizzes_9_10.sql` porta ogni quiz da 8 a 10
domande.

Poi eseguire `supabase/verify_trainer.sql`: restituisce un report unico con il
conteggio delle domande per quiz, i controlli di integrità, lo stato di RLS,
grant, trigger e bucket. Serve perché il seed **salta in silenzio** una domanda
se non trova il quiz corrispondente — emette solo una `NOTICE`, che la SQL
Editor di Supabase non mostra.

Gli script sono idempotenti. `seed_trainer_quizzes.sql` **non** sovrascrive una
domanda già presente in una data posizione: serve a proteggere i tentativi
già sostenuti, che referenziano le domande. Per rigenerare un quiz vanno
cancellate prima le sue domande a mano.

I tre bucket privati vengono creati dallo script stesso (`storage.buckets`).

### 2. Variabili d'ambiente

Nessuna nuova. L'area trainer usa quelle già configurate da
`scripts/deploy-landing.sh`: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_APP_URL`, `ZEPTO_API_TOKEN`.

### 3. Configurazione Supabase Auth

Nel dashboard, **Authentication → URL Configuration**, aggiungere ai redirect
consentiti:

```
https://apulia.ai/trainer/nuova-password
http://localhost:3000/trainer/nuova-password
```

Serve al link di recupero password, che è l'unica email inviata da Supabase
(tutte le altre passano da ZeptoMail). Con l'SMTP di default di Supabase i
limiti di invio sono bassi: se il volume cresce, configurare un SMTP proprio.

### 4. Deploy

```bash
./scripts/deploy-landing.sh
```

## Caricare i contenuti dei moduli

I moduli nascono **non pubblicati**: nessun trainer li vede finché non lo si
decide esplicitamente.

1. Caricare PDF e slide nel bucket `trainer-materials`, con un percorso
   leggibile, per esempio `fondamenti-ai/slide.pdf`.
2. Inserire le risorse:

```sql
insert into trainer_module_resources (module_id, position, kind, title, storage_path)
select id, 1, 'slides', 'Slide del modulo', 'fondamenti-ai/slide.pdf'
from trainer_modules where slug = 'fondamenti-ai';

insert into trainer_module_resources (module_id, position, kind, title, external_url, duration_minutes)
select id, 2, 'video', 'Registrazione della sessione', 'https://youtu.be/…', 45
from trainer_modules where slug = 'fondamenti-ai';
```

3. Pubblicare modulo e quiz:

```sql
update trainer_modules set is_published = true where slug = 'fondamenti-ai';
update trainer_quizzes  set is_published = true
where module_id = (select id from trainer_modules where slug = 'fondamenti-ai');
```

L'esame si pubblica allo stesso modo:
`update trainer_quizzes set is_published = true where kind = 'exam';`

### Stato dei contenuti

| # | Slug | Materiale disponibile | Quiz |
|---|---|---|---|
| 1 | `pmi-pugliesi-ai` | `PMI_Pugliesi_AI_Mod_1.pptx` | 10 domande |
| 2 | `fondamenti-ai` | `Fondamenti_AI_Mod_2.pptx` | 10 domande |
| 3 | `selezione-modello` | `LLM_AI_Mod_3.pptx` | 10 domande |
| 4 | `modulo-4` | **mancante** | — |
| 5 | `ai-act` | `AI_ACT_Mod_5.pptx` | 10 domande |
| 6 | `agent-marketing-lead` | `AI_Agent_Marketing_Lead_Mod_6.pptx` | 10 domande |
| 7 | `roi-use-case` | `ROI_Use_Case_AI_Mod_7.pptx` | 10 domande |
| 8 | `change-management` | `Change_Mgmt_AI_Mod_8.pptx` | 10 domande |
| 9 | `modulo-9` | **mancante** | — |
| 10 | `modulo-10` | **mancante** | — |
| — | esame finale | — | 12 chiuse + 2 aperte |

Il deck del modulo 3 si chiama `LLM_AI_Mod_3.pptx` ma il contenuto è la
selezione del modello e la strategia di adozione: il titolo a database segue
il contenuto, non il nome del file.

Finché i moduli 4, 9 e 10 restano vuoti l'esame non si apre a nessuno: la
soglia è "tutti e dieci pubblicati e superati" (`REQUIRED_MODULES` in
`src/lib/trainer.ts`).

## Regole di correzione

- **Scelta singola e vero/falso**: corrette se l'opzione scelta è quella giusta.
- **Scelta multipla**: tutto o niente, una risposta parzialmente corretta vale
  zero. È esplicitato nella schermata del quiz.
- **Domande aperte**: escluse dal punteggio automatico, sia a numeratore sia a
  denominatore, e girate al revisore. Compaiono solo nell'esame finale.
- **Revisione dopo la consegna**: finche' restano tentativi e il quiz non e'
  superato, il trainer vede SOLO quali domande ha sbagliato. Risposte corrette
  e spiegazioni si aprono a quiz superato o a tentativi esauriti. Con tre
  tentativi sulle stesse domande, rivelare subito le soluzioni renderebbe il
  punteggio privo di significato. Per l'esame finale la revisione resta
  chiusa: la prova e' ancora in valutazione.
- **Punteggio**: percentuale sulla sola parte a risposta chiusa, arrotondata a
  due decimali.
- **Esame finale**: `passed` resta sempre `false` a livello di tentativo — la
  qualifica la decide il revisore su video e materiali, non l'automatismo.

## Operazioni ricorrenti dell'admin

Si arriva da `/admin` (link «Trainer Academy →» nella barra in alto) oppure
direttamente a `/admin/trainer`. La console mostra i contatori, il filtro per
stato, la tabella con l'avanzamento moduli di ciascun candidato e, aprendo un
dossier, CV, motivazione, storico dei tentativi quiz e consegna d'esame.

Azioni disponibili:

- **Approvare o respingere** una candidatura, con nota inclusa nell'email.
- **Sospendere** un accesso già concesso.
- **Concedere un tentativo extra** su un modulo bloccato (pulsante «+1
  tentativo» sulla riga del modulo). I grant sono cumulativi.
- **Valutare l'esame**: qualifica, respingi o segna in revisione. Video e
  allegati si aprono con link firmati validi 10 minuti.

## Limiti noti e scelte da rivedere

- **Verifica dell'email**: l'account viene creato con email già confermata.
  Il controllo reale è la revisione umana del CV, ma questo significa che
  qualcuno può candidarsi con l'indirizzo di un altro. Se serve stringere,
  passare a `email_confirm: false` e gestire la conferma.
- **Certificato di qualifica**: non implementato. Lo stato `qualified` è a
  database e in pagina, ma non esiste un PDF verificabile.
- **Editor dei quiz**: le domande si gestiscono in SQL. Un'interfaccia admin
  di authoring è il naturale passo successivo.
- **Limite di tempo sui quiz**: la colonna `time_limit_minutes` esiste ed è
  applicata dalle API (con 60 secondi di tolleranza), ma i seed la lasciano
  nulla: nessun quiz è a tempo finché non si popola.
- **Lingua**: l'area trainer è solo in italiano, fuori dal `LanguageContext`
  del resto del sito.

## Validazione degli script SQL

I tre script sono stati applicati e verificati su un cluster PostgreSQL 16
usa-e-getta, con uno stub dei ruoli e degli schemi Supabase (`anon`,
`authenticated`, `service_role`, `auth.users`, `auth.uid()`,
`storage.buckets`). Esito:

- applicazione pulita dei tre file, e **ri-applicazione** pulita: idempotenti;
- seed corretto: 10 moduli, 11 quiz, 70 domande, 256 opzioni, 2 domande
  aperte, nessuna domanda chiusa priva di risposta corretta;
- vincoli attivi: secondo esame rifiutato, secondo tentativo aperto sullo
  stesso quiz rifiutato;
- RLS, con un trainer `approved` e uno `pending`:

  | Come | moduli | profili | domande | opzioni | tentativi altrui |
  |---|---|---|---|---|---|
  | trainer approvato | 10 | 1 (il proprio) | **0** | **0** | 0 |
  | trainer pending | 0 | 1 (il proprio) | 0 | 0 | 0 |
  | service_role | 10 | tutti | 70 | 256 | tutti |

- il trainer `pending` che prova a promuoversi ad `approved` resta `pending`,
  e `review_notes` non viene toccato: il trigger `trainer_profiles_guard`
  riporta i campi di revisione ai valori precedenti. Il nome invece cambia,
  come previsto: l'anagrafica è sua.
- un trainer non può modificare il profilo di un altro né vederne i tentativi.

Restano non verificabili in locale i comportamenti specifici di Supabase:
i default privileges che concedono l'accesso a `anon`/`authenticated`/
`service_role` sulle tabelle create nella SQL Editor, e le signed URL dello
storage. Vanno confermati alla prima esecuzione reale.
