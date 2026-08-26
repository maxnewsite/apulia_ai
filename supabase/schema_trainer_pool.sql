-- apulia.ai — Trainer Academy: pool di domande ed estrazione casuale (blocco B)
-- Esegui DOPO schema_trainer.sql. Idempotente.
--
-- Problema che risolve: finché il quiz eroga tutte le domande esistenti,
-- nello stesso ordine, per tutti, due candidati si scambiano le risposte in
-- cinque minuti e i tre tentativi ripropongono le stesse identiche domande.
-- Con un pool più ampio del quiz, ogni tentativo è una prova diversa.

-- Quante domande estrarre per tentativo. NULL = tutte quelle del quiz,
-- che è il comportamento precedente e resta valido per i quiz piccoli.
alter table trainer_quizzes
  add column if not exists questions_per_attempt integer
    check (questions_per_attempt is null or questions_per_attempt > 0);

-- ────────────────────────────────────────────────────────────
-- COMPOSIZIONE DEL SINGOLO TENTATIVO
-- L'estrazione va congelata all'avvio: se si ricalcolasse a ogni lettura,
-- ricaricare la pagina cambierebbe le domande sotto le mani del candidato
-- e la consegna non corrisponderebbe a ciò che ha visto.
-- ────────────────────────────────────────────────────────────
create table if not exists trainer_attempt_questions (
  attempt_id   uuid not null references trainer_quiz_attempts(id) on delete cascade,
  question_id  uuid not null references trainer_questions(id) on delete cascade,
  position     integer not null,
  -- Ordine in cui mostrare le opzioni a questo candidato, in questo
  -- tentativo: anche la posizione della risposta giusta è un indizio
  -- trasmissibile.
  option_order uuid[] not null default '{}',
  primary key (attempt_id, question_id)
);

create index if not exists trainer_attempt_questions_idx
  on trainer_attempt_questions (attempt_id, position);

alter table trainer_attempt_questions enable row level security;

drop policy if exists "Service role full attempt questions" on trainer_attempt_questions;
create policy "Service role full attempt questions" on trainer_attempt_questions
  for all to service_role using (true) with check (true);
-- Nessuna policy per authenticated: la composizione del tentativo passa
-- dalle API route, che rimuovono is_correct prima di rispondere.

-- ────────────────────────────────────────────────────────────
-- ESTRAZIONE
-- ────────────────────────────────────────────────────────────
/**
 * Compone un tentativo: sceglie le domande e fissa l'ordine delle opzioni.
 * Idempotente sul singolo tentativo — richiamarla non ricompone nulla.
 */
create or replace function trainer_compose_attempt(p_attempt_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_quiz_id uuid;
  v_limit   integer;
  v_count   integer;
begin
  if exists (select 1 from trainer_attempt_questions where attempt_id = p_attempt_id) then
    select count(*) into v_count from trainer_attempt_questions where attempt_id = p_attempt_id;
    return v_count;
  end if;

  select a.quiz_id, q.questions_per_attempt
    into v_quiz_id, v_limit
  from trainer_quiz_attempts a
  join trainer_quizzes q on q.id = a.quiz_id
  where a.id = p_attempt_id;

  if v_quiz_id is null then
    raise exception 'Tentativo % inesistente', p_attempt_id;
  end if;

  insert into trainer_attempt_questions (attempt_id, question_id, position, option_order)
  select
    p_attempt_id,
    picked.id,
    row_number() over (order by picked.rnd),
    coalesce(
      (select array_agg(o.id order by random())
       from trainer_question_options o
       where o.question_id = picked.id),
      '{}'::uuid[]
    )
  from (
    select q.id, random() as rnd
    from trainer_questions q
    where q.quiz_id = v_quiz_id
    order by random()
    limit coalesce(v_limit, 2147483647)
  ) picked;

  get diagnostics v_count = row_count;
  return v_count;
end;
$fn$;
