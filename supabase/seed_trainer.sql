-- apulia.ai — Trainer Academy: seed dei 10 moduli + esame finale
-- Esegui DOPO schema_trainer.sql. Idempotente (upsert su slug).
--
-- I moduli 4, 9 e 10 sono segnaposto non pubblicati: titolo e contenuti
-- vanno completati dall'admin. I moduli con materiale già disponibile
-- (i .pptx in apulia_trainer/) restano non pubblicati finché non si
-- caricano PDF e video — la pubblicazione è un atto esplicito.

insert into trainer_modules (position, slug, title, summary, is_published) values
  (1,  'pmi-pugliesi-ai',      'Le PMI pugliesi e l''AI',
       'Il contesto economico locale: dove l''AI crea valore concreto nelle piccole e medie imprese del territorio.', false),
  (2,  'fondamenti-ai',        'Fondamenti AI e arte della traduzione',
       'LLM, RAG, agenti e allucinazioni: cosa fanno davvero e come spiegarli a un titolare in quattro minuti.', false),
  (3,  'selezione-modello',    'Selezione del modello e strategia di adozione',
       'Caso d''uso prima del modello: criteri pesati, benchmark replicabili, ecosistema provider e difesa dal lock-in.', false),
  (4,  'modulo-4',             'Modulo 4 — da definire',
       'Segnaposto: contenuto da caricare.', false),
  (5,  'ai-act',               'EU AI Act e conformità',
       'Classificazione del rischio, obblighi per fornitori e utilizzatori, scadenze e responsabilità.', false),
  (6,  'agent-marketing-lead', 'AI Agent per la qualificazione dei lead',
       'Costruire un workflow agentico end-to-end: routing, arricchimento, scoring BANT, task CRM e guardrail.', false),
  (7,  'roi-use-case',         'ROI e selezione degli use case',
       'Come si stima il ritorno di un progetto AI: costi nascosti, benefici intangibili, orizzonte 18-36 mesi.', false),
  (8,  'change-management',    'Change management e adozione dell''AI',
       'Resistenze organizzative, ridisegno dei processi, formazione interna e misura dell''adozione.', false),
  (9,  'modulo-9',             'Modulo 9 — da definire',
       'Segnaposto: contenuto da caricare.', false),
  (10, 'modulo-10',            'Modulo 10 — da definire',
       'Segnaposto: contenuto da caricare.', false)
on conflict (slug) do update set
  position = excluded.position,
  title    = excluded.title,
  summary  = excluded.summary;

-- Un quiz per ogni modulo: 70% per passare, 3 tentativi.
insert into trainer_quizzes (kind, module_id, title, intro, pass_score, max_attempts, is_published)
select
  'module',
  m.id,
  'Quiz — ' || m.title,
  'Rispondi a tutte le domande. Servono almeno 70 punti su 100 per superare il modulo. Hai a disposizione 3 tentativi.',
  70,
  3,
  false
from trainer_modules m
on conflict (module_id) do update set
  title = excluded.title;

-- Esame finale: soglia più alta, tentativo unico, correzione ibrida
-- (parte chiusa automatica + review manuale del video da parte dell'admin).
insert into trainer_quizzes (kind, module_id, title, intro, pass_score, max_attempts, is_published)
select 'exam', null,
  'Esame finale — Metodo apulia.ai',
  'L''esame si supera con almeno l''80% nella parte a risposta chiusa E con la valutazione positiva del video e dei materiali caricati. Hai un solo tentativo.',
  80, 1, false
where not exists (select 1 from trainer_quizzes where kind = 'exam');
