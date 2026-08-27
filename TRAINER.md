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
4. **Quiz di modulo** — 10 domande estratte a caso da un pool di 20, 20
   minuti di tempo, soglia 80%, massimo 3 tentativi. Ogni tentativo propone
   un campione diverso e un diverso ordine delle opzioni. Esauriti i tentativi
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
  schema_trainer_pool.sql     pool di domande ed estrazione per tentativo
  seed_trainer_quizzes.sql    70 domande derivate dai deck dei moduli
  seed_trainer_quizzes_9_10.sql  domande 9 e 10 di ogni quiz di modulo
  seed_trainer_pool_11_20.sql    domande 11-20, moduli 1-3
  seed_trainer_pool_11_20_b.sql  domande 11-20, moduli 5-8
  schema_trainer_review.sql   esito "integrazioni richieste" sull'esame
  schema_staff.sql            account di staff della console (ruolo coach)
  publish_trainer_modules.sql pubblica i moduli il cui pool e' pronto
  verify_trainer.sql          report di verifica post-installazione

landing/src/
  lib/supabase-ssr.ts         client Supabase server + refresh sessione nel proxy
  lib/supabase-browser.ts     client Supabase lato browser
  lib/trainer.ts              tipi, curriculum, sblocco sequenziale, correzione
  lib/trainer-session.ts      sessione e gate "trainer approvato"
  lib/trainer-emails.ts       template email transazionali
  proxy.ts                    gating /trainer e /api/trainer

  lib/trainer-preview.ts      estrazione e correzione in anteprima, senza tentativi
  lib/trainer-cohort.ts       coorte di avanzamento di ciascun trainer
  lib/staff-roles.ts          ruoli e permessi (senza dipendenze: lo usa il proxy)
  lib/staff.ts                account di staff: lettura, password PBKDF2
  lib/admin-session.ts        identita' e permessi lato server nelle API route

  app/trainer/…               pagine dell'area riservata
  app/admin/trainer/          console di revisione
  app/admin/trainer/quiz/     anteprima dei quiz per il revisore
  app/admin/staff/            gestione degli account di staff (solo admin)
  app/api/admin/quiz-preview/ campione e correzione dell'anteprima
  app/api/admin/me/           chi e' collegato e con che ruolo
  app/api/admin/staff/        creazione e stato degli account di staff
  app/api/trainer/…           registrazione, quiz, risorse, upload, esame
  app/api/admin/trainers/…    elenco, dossier, azioni del revisore

  components/trainer/         TrainerNav, QuestionList, QuizRunner, ExamClient,
                              QuizPreviewRunner
  components/admin/           StaffBadge (identita' e ruolo in alto a destra)
```

## Messa in opera

### 1. Database

Nella SQL Editor del progetto Supabase `amkixorrowqbgohzopvi`, in quest'ordine:

```
supabase/schema.sql              (già applicato)
supabase/schema_trainer.sql
supabase/schema_trainer_activity.sql
supabase/schema_trainer_security.sql
supabase/schema_trainer_pool.sql
supabase/seed_trainer.sql
supabase/seed_trainer_quizzes.sql
supabase/seed_trainer_quizzes_9_10.sql
supabase/seed_trainer_pool_11_20.sql
supabase/seed_trainer_pool_11_20_b.sql
supabase/schema_trainer_review.sql
supabase/schema_staff.sql
supabase/publish_trainer_modules.sql
```

`publish_trainer_modules.sql` chiude l'installazione pubblicando i moduli il
cui quiz ha gia' abbastanza domande. E' guidato dai dati e non da un elenco di
slug: i tre segnaposto senza pool restano invisibili, e caricare il pool del
modulo 4 e rieseguire il file lo pubblica senza modificarlo. Serve perche'
altrimenti la dashboard di un trainer approvato e' vuota — il seed crea tutto
non pubblicato — e i quiz non sono raggiungibili nemmeno per provarli.

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
decide esplicitamente. `supabase/publish_trainer_modules.sql` fa questo passo
per i moduli il cui quiz è pronto, così il percorso è navigabile mentre slide
e video sono ancora in lavorazione; la pagina di un modulo senza materiali lo
dice e mostra comunque il quiz.

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

## Provare un quiz senza essere un trainer

`/admin/trainer/quiz` elenca tutti i quiz con la dimensione del pool e lo stato
di pubblicazione; da li' si apre l'anteprima del singolo quiz.

L'anteprima estrae un campione dal pool e mescola le opzioni come farebbe
`trainer_compose_attempt`, mostra il conto alla rovescia e corregge con lo
stesso `gradeAttempt()` del quiz vero, poi rivela risposte esatte e
spiegazioni. **Non scrive nulla**: nessuna riga in `trainer_quiz_attempts`,
nessun tentativo consumato, nessun avanzamento alterato. Di conseguenza si
puo' ripetere all'infinito, si applica anche ai quiz non pubblicati, e non
serve avere un profilo trainer approvato.

Cio' che l'anteprima **non** copre, perche' vive nei tentativi persistiti: il
limite di tre prove, lo sblocco sequenziale dei moduli, l'annullamento
server-side del tentativo fuori tempo. Il conto alla rovescia in anteprima e'
solo indicativo. Quelle regole si verificano con un account trainer vero, o
dai test unitari su `buildCurriculum`.

Il percorso opposto e' altrettanto diretto: dall'anteprima si salta al modulo
corrispondente nell'area trainer, e la console di revisione ha in testa i link
a iscritti newsletter, anteprima quiz e area trainer.

## Ruoli della console

| Ruolo | Come si accede | Cosa puo' fare |
|---|---|---|
| **Admin** | `ADMIN_EMAIL`/`ADMIN_PASSWORD`, oppure un account `admin` in `trainer_staff` | tutto: iscritti newsletter, candidature, sospensioni, cancellazioni GDPR, gestione staff |
| **Coach** | account `coach` in `trainer_staff` | avanzamento dei trainer ammessi, valutazione degli esami finali, tentativi extra, anteprima quiz |
| **Trainer** | Supabase Auth, dall'area `/trainer` | il proprio percorso |

Il coach **non ammette e non respinge candidature**, non sospende accessi,
non cancella dati e non vede la dashboard iscritti. Il confine e' applicato
in tre punti, tutti che leggono la stessa `can()` di `lib/staff-roles.ts`:

1. `proxy.ts` sui percorsi — `/admin`, `/admin/staff`, `/api/admin/staff` e
   `/api/admin/subscribers` sono chiusi al coach, che viene rimandato a
   `/admin/trainer`;
2. le API route sulla singola azione — `approve`, `reject`, `suspend`,
   `reactivate` e `delete_data` rispondono 403 anche se la rotta e' concessa,
   perche' convivono con `review_exam` sullo stesso endpoint;
3. l'interfaccia, che nasconde i pulsanti. Solo il terzo punto e' visibile,
   e da solo non sarebbe un controllo di sicurezza.

Il ruolo viaggia nel token di sessione (`role` nel payload firmato), cosi' il
proxy decide senza interrogare il database a ogni richiesta.

### Creare un coach

`/admin/staff`, raggiungibile dal link «Staff» nella console Trainer Academy.
Servono email, ruolo e una password provvisoria di almeno 12 caratteri con
lettere e cifre. **La password non viene inviata via email**: la comunichi
tu. Da li' si disattiva un account o se ne reimposta la password.

Le password sono hash PBKDF2-SHA256 (210.000 iterazioni, salt per riga) nel
formato `pbkdf2$<iterazioni>$<salt>$<hash>`: non inserire mai una password in
chiaro direttamente in `trainer_staff`.

L'admin delle variabili d'ambiente resta valido e non compare nell'elenco:
e' l'unico accesso che funziona anche a tabella vuota, quindi e' l'unico modo
di creare il primo account.

### Chi sono io

Ogni pagina della console mostra in alto a destra l'indirizzo collegato e il
ruolo — Admin o Coach — con il pulsante di uscita. L'area trainer mostra la
stessa riga con l'etichetta Trainer. Con due ruoli sulla stessa console,
«manca un pulsante» e «sono entrato con l'account sbagliato» sarebbero
altrimenti indistinguibili.

## Come vanno i trainer

La console apre su **«Come vanno i trainer»**: un riquadro per coorte, con il
numero di persone e il filtro sulla tabella. Risponde alla domanda che il
filtro per stato della candidatura non copre — quello dice chi devi ancora
ammettere, non chi si e' fermato.

| Coorte | Significato | Cosa fare |
|---|---|---|
| Esame da valutare | ha consegnato video e materiali | valutare |
| Bloccato | tentativi esauriti su un modulo, non superato | concedere «+1 tentativo» |
| Fermo da oltre 14 giorni | ammesso e avviato, nessun segno di vita | contattare |
| Integrazioni richieste | il revisore ha rimandato la consegna | aspettare il candidato |
| In corso | attivo negli ultimi 14 giorni | niente |
| Mai iniziato | ammesso, non ha mai aperto un materiale ne' un quiz | avviare |
| Qualificato | esame superato e certificato | niente |

La precedenza fra i criteri e' fissata in `classify()` di
`lib/trainer-cohort.ts` ed e' coperta da test: lo stato della candidatura
vince su tutto (un sospeso inattivo da mesi resta «sospeso», non «fermo»),
poi l'esito dell'esame, poi il blocco sui tentativi, poi l'attivita'.

«Ultima attivita'» e' il piu' recente fra l'ultima consegna di un quiz e
l'ultima apertura di un materiale: un trainer che sta studiando senza aver
ancora consegnato nulla risulta attivo, non fermo.

## Valutare l'esame finale

Il dossier del candidato mostra la consegna per intero: punteggio della parte
chiusa, link al video, note del candidato e allegati con link firmati validi
10 minuti. Sotto, quattro esiti:

- **Certifica trainer** (`qualified`) — qualifica ottenuta, parte l'email.
- **Chiedi integrazioni** (`needs_work`) — l'unico esito che restituisce la
  palla al candidato: la consegna torna modificabile, lui ricarica video e
  materiali senza rifare le domande, e la coorte diventa «Integrazioni
  richieste». **La nota del revisore e' obbligatoria** — API e interfaccia la
  pretendono entrambe: un'email che dice «rifai qualcosa» senza dire cosa
  lascia il candidato fermo esattamente come una bocciatura.
- **Respingi** (`rejected`) — esito definitivo, parte l'email. Dopo un
  respingimento il candidato non puo' riconsegnare da solo: riaprire e' una
  decisione del revisore, che riporta la consegna a `needs_work`.
- **Prendi in carico** (`under_review`) — marcatore interno, nessuna email:
  al candidato non cambia niente.

La nota scritta in fondo al dossier e' quella che finisce nell'email.

## Operazioni ricorrenti dell'admin

Si arriva da `/admin` (link «Trainer Academy →» nella barra in alto) oppure
direttamente a `/admin/trainer`, che e' anche la home di un coach. La console mostra i contatori, il filtro per
stato, la tabella con l'avanzamento moduli di ciascun candidato e, aprendo un
dossier, CV, motivazione, storico dei tentativi quiz e consegna d'esame.

Azioni disponibili:

- **Approvare o respingere** una candidatura, con nota inclusa nell'email.
- **Sospendere** un accesso già concesso.
- **Concedere un tentativo extra** su un modulo bloccato (pulsante «+1
  tentativo» sulla riga del modulo). I grant sono cumulativi.
- **Valutare l'esame**: certifica, chiedi integrazioni o respingi — vedi
  «Valutare l'esame finale» qui sopra.

## Limiti noti e scelte da rivedere

- **Verifica dell'email**: l'account viene creato con email già confermata.
  Il controllo reale è la revisione umana del CV, ma questo significa che
  qualcuno può candidarsi con l'indirizzo di un altro. Se serve stringere,
  passare a `email_confirm: false` e gestire la conferma.
- **Certificato di qualifica**: non implementato. Lo stato `qualified` è a
  database e in pagina, ma non esiste un PDF verificabile.
- **Password dello staff**: non c'è recupero via email. Un coach che perde la
  password se la fa reimpostare da un admin in `/admin/staff`.
- **Notifiche al coach**: l'avviso di nuova candidatura va al solo
  `ADMIN_EMAIL`. Una consegna d'esame non avvisa nessuno: il coach la trova
  aprendo la console, nel riquadro «Esame da valutare».
- **Editor dei quiz**: le domande si gestiscono in SQL. L'anteprima in
  `/admin/trainer/quiz` permette di provarle, non di modificarle:
  un'interfaccia di authoring è il naturale passo successivo.
- **Limite di tempo sui quiz**: la colonna `time_limit_minutes` esiste ed è
  applicata dalle API (con 60 secondi di tolleranza). I seed ora la popolano:
  20 minuti sui quiz di modulo, 90 sull'esame.
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
