-- apulia.ai — Trainer Academy: pubblicazione dei moduli con quiz pronto
--
-- Esegui DOPO i seed. Idempotente.
--
-- Perché serve: seed_trainer.sql crea tutto non pubblicato, quindi la
-- dashboard di un trainer approvato è vuota e i quiz non sono raggiungibili
-- nemmeno per provarli. Questo script pubblica esattamente i moduli che
-- hanno già un pool di domande — non quelli segnaposto — così il percorso
-- diventa navigabile mentre slide e video sono ancora in lavorazione.
--
-- La scelta è guidata dai dati, non da un elenco di slug: un modulo si
-- pubblica quando il suo quiz ha almeno tante domande quante ne estrae per
-- tentativo. Aggiungere il pool del modulo 4 e rieseguire questo file lo
-- pubblica senza modifiche allo script.

-- ────────────────────────────────────────────────────────────
-- 1. Quiz con pool sufficiente
-- ────────────────────────────────────────────────────────────
with pronti as (
  select q.id
  from trainer_quizzes q
  where q.kind = 'module'
    and (select count(*) from trainer_questions t where t.quiz_id = q.id)
        >= coalesce(q.questions_per_attempt, 1)
)
update trainer_quizzes q
set is_published = true
from pronti p
where q.id = p.id and q.is_published is distinct from true;

-- ────────────────────────────────────────────────────────────
-- 2. I moduli dei quiz pubblicati
-- ────────────────────────────────────────────────────────────
update trainer_modules m
set is_published = true
where exists (
  select 1 from trainer_quizzes q
  where q.module_id = m.id and q.kind = 'module' and q.is_published
)
and m.is_published is distinct from true;

-- ────────────────────────────────────────────────────────────
-- 3. Report
-- ────────────────────────────────────────────────────────────
select
  m.position,
  m.slug,
  m.is_published                                              as modulo_pubblicato,
  coalesce(q.is_published, false)                             as quiz_pubblicato,
  (select count(*) from trainer_questions t where t.quiz_id = q.id) as domande_nel_pool,
  q.questions_per_attempt                                     as estratte_per_tentativo,
  (select count(*) from trainer_module_resources r where r.module_id = m.id) as materiali
from trainer_modules m
left join trainer_quizzes q on q.module_id = m.id
order by m.position;
