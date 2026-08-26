-- apulia.ai — Trainer Academy Schema
-- Esegui nella Supabase SQL Editor del progetto apulia.ai (amkixorrowqbgohzopvi)
-- dopo schema.sql. Idempotente.
--
-- Modello di accesso:
--   • I trainer sono utenti Supabase Auth (auth.users) con un profilo 1:1.
--   • RLS: ogni trainer vede SOLO le proprie righe. I moduli/risorse sono
--     leggibili solo dai trainer con status = 'approved'.
--   • Domande e opzioni NON sono esposte al client: nessuna policy per
--     'authenticated'. Vengono servite dalle API route con service-role,
--     che rimuovono is_correct prima di rispondere.

-- ────────────────────────────────────────────────────────────
-- PROFILI TRAINER  (1:1 con auth.users)
-- ────────────────────────────────────────────────────────────
create table if not exists trainer_profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text not null,
  full_name        text not null,
  phone            text,
  city             text,
  linkedin_url     text,
  bio              text,
  motivation       text,
  cv_path          text,
  status           text not null default 'pending'
                     check (status in ('pending','approved','rejected','suspended')),
  reviewed_by      text,
  reviewed_at      timestamptz,
  review_notes     text,
  consent_privacy  boolean not null default false,
  consent_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists trainer_profiles_status_idx on trainer_profiles (status);
create index if not exists trainer_profiles_email_idx  on trainer_profiles (email);

alter table trainer_profiles enable row level security;

drop policy if exists "Trainer reads own profile"   on trainer_profiles;
drop policy if exists "Trainer updates own profile" on trainer_profiles;
drop policy if exists "Service role full profiles"  on trainer_profiles;

create policy "Trainer reads own profile" on trainer_profiles
  for select to authenticated using (id = auth.uid());

-- Il trainer può aggiornare i propri dati anagrafici. Il blocco sul cambio di
-- status NON può stare qui: una policy su trainer_profiles che interroga
-- trainer_profiles manda l'RLS in ricorsione infinita. Se ne occupa il
-- trigger trainer_profiles_guard più sotto.
create policy "Trainer updates own profile" on trainer_profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Service role full profiles" on trainer_profiles
  for all to service_role using (true) with check (true);

-- Nessun aggiornamento dal client può toccare i campi di revisione: solo il
-- service_role (le API route admin) può promuovere, respingere o sospendere.
-- Un trigger è l'unico punto in cui questo controllo si può fare senza
-- rileggere trainer_profiles dentro una sua stessa policy.
create or replace function trainer_profiles_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $guard$
declare
  v_claims text := current_setting('request.jwt.claims', true);
begin
  -- Passa liberamente: service_role via PostgREST, e le sessioni senza JWT
  -- (SQL Editor, migrazioni, connessioni dirette).
  if current_setting('role', true) = 'service_role'
     or v_claims is null
     or v_claims = ''
     or (v_claims::json ->> 'role') = 'service_role' then
    return new;
  end if;

  new.status       := old.status;
  new.reviewed_by  := old.reviewed_by;
  new.reviewed_at  := old.reviewed_at;
  new.review_notes := old.review_notes;
  new.email        := old.email;
  return new;
end;
$guard$;

drop trigger if exists trainer_profiles_guard on trainer_profiles;
create trigger trainer_profiles_guard
  before update on trainer_profiles
  for each row execute function trainer_profiles_guard();

-- ────────────────────────────────────────────────────────────
-- HELPER
-- Definita qui e non in testa allo script: Postgres valida il corpo di una
-- funzione SQL alla creazione, quindi trainer_profiles deve già esistere.
-- security definer perché la funzione è usata dentro le policy di altre
-- tabelle, dove il chiamante non ha accesso diretto a trainer_profiles.
-- ────────────────────────────────────────────────────────────
create or replace function trainer_is_approved(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $fn$
  select exists (
    select 1 from trainer_profiles
    where id = uid and status = 'approved'
  );
$fn$;

-- ────────────────────────────────────────────────────────────
-- MODULI
-- ────────────────────────────────────────────────────────────
create table if not exists trainer_modules (
  id            uuid primary key default gen_random_uuid(),
  position      integer not null unique,
  slug          text not null unique,
  title         text not null,
  summary       text,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table trainer_modules enable row level security;

drop policy if exists "Approved trainers read modules" on trainer_modules;
drop policy if exists "Service role full modules"      on trainer_modules;

create policy "Approved trainers read modules" on trainer_modules
  for select to authenticated
  using (is_published and trainer_is_approved(auth.uid()));

create policy "Service role full modules" on trainer_modules
  for all to service_role using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- RISORSE DI MODULO (pdf, slide, video, link)
-- ────────────────────────────────────────────────────────────
create table if not exists trainer_module_resources (
  id               uuid primary key default gen_random_uuid(),
  module_id        uuid not null references trainer_modules(id) on delete cascade,
  position         integer not null,
  kind             text not null check (kind in ('pdf','slides','video','link')),
  title            text not null,
  description      text,
  storage_path     text,
  external_url     text,
  duration_minutes integer,
  created_at       timestamptz not null default now(),
  unique (module_id, position),
  -- pdf/slides vivono nel bucket privato; video/link sono URL esterni.
  constraint resource_location_ck check (
    (kind in ('pdf','slides') and storage_path is not null)
    or (kind in ('video','link') and external_url is not null)
  )
);

create index if not exists trainer_resources_module_idx on trainer_module_resources (module_id);

alter table trainer_module_resources enable row level security;

drop policy if exists "Approved trainers read resources" on trainer_module_resources;
drop policy if exists "Service role full resources"      on trainer_module_resources;

create policy "Approved trainers read resources" on trainer_module_resources
  for select to authenticated
  using (
    trainer_is_approved(auth.uid())
    and exists (
      select 1 from trainer_modules m
      where m.id = module_id and m.is_published
    )
  );

create policy "Service role full resources" on trainer_module_resources
  for all to service_role using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- QUIZ  (kind='module' per i 10 moduli, kind='exam' per l'esame finale)
-- ────────────────────────────────────────────────────────────
create table if not exists trainer_quizzes (
  id                 uuid primary key default gen_random_uuid(),
  kind               text not null default 'module' check (kind in ('module','exam')),
  module_id          uuid unique references trainer_modules(id) on delete cascade,
  title              text not null,
  intro              text,
  pass_score         integer not null default 70 check (pass_score between 1 and 100),
  max_attempts       integer not null default 3 check (max_attempts >= 1),
  time_limit_minutes integer,
  is_published       boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- un quiz di modulo è legato a un modulo; l'esame finale no.
  constraint quiz_kind_ck check (
    (kind = 'module' and module_id is not null)
    or (kind = 'exam' and module_id is null)
  )
);

-- Un solo esame finale.
create unique index if not exists trainer_quizzes_single_exam_idx
  on trainer_quizzes (kind) where kind = 'exam';

alter table trainer_quizzes enable row level security;

drop policy if exists "Approved trainers read quizzes" on trainer_quizzes;
drop policy if exists "Service role full quizzes"      on trainer_quizzes;

create policy "Approved trainers read quizzes" on trainer_quizzes
  for select to authenticated
  using (is_published and trainer_is_approved(auth.uid()));

create policy "Service role full quizzes" on trainer_quizzes
  for all to service_role using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- DOMANDE E OPZIONI
-- Nessuna policy per 'authenticated': is_correct non deve mai raggiungere
-- il browser. Le API route leggono con service-role e filtrano.
-- ────────────────────────────────────────────────────────────
create table if not exists trainer_questions (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid not null references trainer_quizzes(id) on delete cascade,
  position    integer not null,
  kind        text not null check (kind in ('single','multi','boolean','open')),
  prompt      text not null,
  explanation text,
  points      numeric(5,2) not null default 1 check (points > 0),
  created_at  timestamptz not null default now(),
  unique (quiz_id, position)
);

create index if not exists trainer_questions_quiz_idx on trainer_questions (quiz_id);

alter table trainer_questions enable row level security;
drop policy if exists "Service role full questions" on trainer_questions;
create policy "Service role full questions" on trainer_questions
  for all to service_role using (true) with check (true);

create table if not exists trainer_question_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references trainer_questions(id) on delete cascade,
  position    integer not null,
  label       text not null,
  is_correct  boolean not null default false,
  unique (question_id, position)
);

create index if not exists trainer_options_question_idx on trainer_question_options (question_id);

alter table trainer_question_options enable row level security;
drop policy if exists "Service role full options" on trainer_question_options;
create policy "Service role full options" on trainer_question_options
  for all to service_role using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- TENTATIVI E RISPOSTE
-- ────────────────────────────────────────────────────────────
create table if not exists trainer_quiz_attempts (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null references trainer_quizzes(id) on delete cascade,
  trainer_id     uuid not null references trainer_profiles(id) on delete cascade,
  attempt_number integer not null check (attempt_number >= 1),
  status         text not null default 'in_progress'
                   check (status in ('in_progress','submitted','expired')),
  score          numeric(5,2),
  passed         boolean,
  started_at     timestamptz not null default now(),
  submitted_at   timestamptz,
  unique (quiz_id, trainer_id, attempt_number)
);

create index if not exists trainer_attempts_trainer_idx on trainer_quiz_attempts (trainer_id);
create index if not exists trainer_attempts_quiz_idx    on trainer_quiz_attempts (quiz_id);

-- Un solo tentativo aperto per quiz/trainer alla volta.
create unique index if not exists trainer_attempts_one_open_idx
  on trainer_quiz_attempts (quiz_id, trainer_id)
  where status = 'in_progress';

alter table trainer_quiz_attempts enable row level security;

drop policy if exists "Trainer reads own attempts" on trainer_quiz_attempts;
drop policy if exists "Service role full attempts" on trainer_quiz_attempts;

create policy "Trainer reads own attempts" on trainer_quiz_attempts
  for select to authenticated using (trainer_id = auth.uid());

create policy "Service role full attempts" on trainer_quiz_attempts
  for all to service_role using (true) with check (true);

create table if not exists trainer_quiz_answers (
  id                  uuid primary key default gen_random_uuid(),
  attempt_id          uuid not null references trainer_quiz_attempts(id) on delete cascade,
  question_id         uuid not null references trainer_questions(id) on delete cascade,
  selected_option_ids uuid[] not null default '{}',
  answer_text         text,
  is_correct          boolean,
  points_awarded      numeric(5,2) not null default 0,
  created_at          timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index if not exists trainer_answers_attempt_idx on trainer_quiz_answers (attempt_id);

alter table trainer_quiz_answers enable row level security;

drop policy if exists "Trainer reads own answers" on trainer_quiz_answers;
drop policy if exists "Service role full answers"  on trainer_quiz_answers;

create policy "Trainer reads own answers" on trainer_quiz_answers
  for select to authenticated
  using (exists (
    select 1 from trainer_quiz_attempts a
    where a.id = attempt_id and a.trainer_id = auth.uid()
  ));

create policy "Service role full answers" on trainer_quiz_answers
  for all to service_role using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- TENTATIVI EXTRA CONCESSI DALL'ADMIN
-- (dopo 3 fallimenti il trainer è bloccato finché l'admin non concede)
-- ────────────────────────────────────────────────────────────
create table if not exists trainer_attempt_grants (
  id             uuid primary key default gen_random_uuid(),
  trainer_id     uuid not null references trainer_profiles(id) on delete cascade,
  quiz_id        uuid not null references trainer_quizzes(id) on delete cascade,
  extra_attempts integer not null default 1 check (extra_attempts > 0),
  granted_by     text,
  reason         text,
  created_at     timestamptz not null default now(),
  unique (trainer_id, quiz_id)
);

alter table trainer_attempt_grants enable row level security;

drop policy if exists "Trainer reads own grants" on trainer_attempt_grants;
drop policy if exists "Service role full grants" on trainer_attempt_grants;

create policy "Trainer reads own grants" on trainer_attempt_grants
  for select to authenticated using (trainer_id = auth.uid());

create policy "Service role full grants" on trainer_attempt_grants
  for all to service_role using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- CONSEGNE ESAME FINALE  (video + materiali, review manuale admin)
-- ────────────────────────────────────────────────────────────
create table if not exists trainer_exam_submissions (
  id            uuid primary key default gen_random_uuid(),
  trainer_id    uuid not null references trainer_profiles(id) on delete cascade,
  attempt_id    uuid references trainer_quiz_attempts(id) on delete set null,
  video_url     text,
  notes         text,
  files         jsonb not null default '[]'::jsonb,
  auto_score    numeric(5,2),
  status        text not null default 'submitted'
                  check (status in ('draft','submitted','under_review','qualified','rejected')),
  reviewed_by   text,
  reviewed_at   timestamptz,
  review_notes  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists trainer_exam_trainer_idx on trainer_exam_submissions (trainer_id);
create index if not exists trainer_exam_status_idx  on trainer_exam_submissions (status);

alter table trainer_exam_submissions enable row level security;

drop policy if exists "Trainer reads own exam"  on trainer_exam_submissions;
drop policy if exists "Service role full exams" on trainer_exam_submissions;

create policy "Trainer reads own exam" on trainer_exam_submissions
  for select to authenticated using (trainer_id = auth.uid());

create policy "Service role full exams" on trainer_exam_submissions
  for all to service_role using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- VISTA: avanzamento per modulo
-- Derivata dai tentativi — nessuno stato duplicato da tenere in sync.
-- ────────────────────────────────────────────────────────────
create or replace view trainer_module_progress
with (security_invoker = true) as
select
  a.trainer_id,
  q.module_id,
  q.id                                               as quiz_id,
  count(*) filter (where a.status = 'submitted')     as attempts_used,
  bool_or(coalesce(a.passed, false))                 as passed,
  max(a.score) filter (where a.status = 'submitted') as best_score,
  max(a.submitted_at)                                as last_submitted_at
from trainer_quiz_attempts a
join trainer_quizzes q on q.id = a.quiz_id
group by a.trainer_id, q.module_id, q.id;

-- ────────────────────────────────────────────────────────────
-- TRIGGER updated_at  (update_updated_at_column() è definita in schema.sql)
-- ────────────────────────────────────────────────────────────
do $mig$
declare t text;
begin
  foreach t in array array[
    'trainer_profiles','trainer_modules','trainer_quizzes','trainer_exam_submissions'
  ] loop
    execute format('drop trigger if exists %I_updated_at on %I', t, t);
    execute format(
      'create trigger %I_updated_at before update on %I
       for each row execute function update_updated_at_column()', t, t);
  end loop;
end $mig$;

-- ────────────────────────────────────────────────────────────
-- STORAGE BUCKETS (tutti privati — accesso solo via signed URL server-side)
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('trainer-cv',          'trainer-cv',          false,  10485760),   --  10 MB
  ('trainer-materials',   'trainer-materials',   false, 104857600),   -- 100 MB
  ('trainer-submissions', 'trainer-submissions', false, 209715200)    -- 200 MB
on conflict (id) do update set
  public          = excluded.public,
  file_size_limit = excluded.file_size_limit;

-- Nessuna policy storage per 'authenticated': ogni download passa da una
-- signed URL generata dalle API route dopo il controllo di autorizzazione.
