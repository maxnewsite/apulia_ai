-- apulia.ai — Trainer Academy: irrobustimento (blocco A)
-- Esegui DOPO schema_trainer.sql. Idempotente.
--
-- Copre quattro lacune:
--   1. rate limiting durevole sull'endpoint pubblico di registrazione
--   2. verifica dell'indirizzo email con token nostro
--   3. tracciabilità delle azioni del revisore
--   4. (in app) cancellazione completa dei dati di un candidato

-- ────────────────────────────────────────────────────────────
-- 1. RATE LIMITING
-- Durevole e non in memoria: su Cloud Run le istanze sono più di una e si
-- riavviano, quindi un contatore in RAM proteggerebbe solo a tratti.
-- ────────────────────────────────────────────────────────────
create table if not exists trainer_rate_events (
  id         bigserial primary key,
  bucket     text not null,          -- 'signup_ip' | 'signup_email'
  key        text not null,          -- l'IP o l'email normalizzata
  created_at timestamptz not null default now()
);

create index if not exists trainer_rate_lookup_idx
  on trainer_rate_events (bucket, key, created_at desc);

alter table trainer_rate_events enable row level security;
drop policy if exists "Service role full rate" on trainer_rate_events;
create policy "Service role full rate" on trainer_rate_events
  for all to service_role using (true) with check (true);

/**
 * Registra un evento e dice se la soglia è superata.
 * Ripulisce le righe vecchie mentre passa: nessun job di manutenzione.
 */
create or replace function trainer_rate_check(
  p_bucket   text,
  p_key      text,
  p_limit    integer,
  p_window   interval
) returns boolean
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_count integer;
begin
  delete from trainer_rate_events
  where created_at < now() - greatest(p_window, interval '1 day');

  select count(*) into v_count
  from trainer_rate_events
  where bucket = p_bucket
    and key = p_key
    and created_at > now() - p_window;

  insert into trainer_rate_events (bucket, key) values (p_bucket, p_key);

  return v_count >= p_limit;   -- true = da bloccare
end;
$fn$;

-- ────────────────────────────────────────────────────────────
-- 2. VERIFICA EMAIL
-- L'account Auth nasce confermato per non dipendere dall'SMTP di Supabase,
-- ma l'indirizzo va comunque provato: senza, ci si candida con l'email di
-- un altro. Il token è nostro e viaggia su ZeptoMail.
-- ────────────────────────────────────────────────────────────
alter table trainer_profiles
  add column if not exists email_confirm_token uuid not null default gen_random_uuid(),
  add column if not exists email_confirmed_at  timestamptz;

create index if not exists trainer_profiles_confirm_token_idx
  on trainer_profiles (email_confirm_token);

-- Il trigger anti-escalation deve proteggere anche questi due campi:
-- diversamente un client potrebbe dichiararsi verificato da solo.
create or replace function trainer_profiles_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $guard$
declare
  v_claims text := current_setting('request.jwt.claims', true);
begin
  if current_setting('role', true) = 'service_role'
     or v_claims is null
     or v_claims = ''
     or (v_claims::json ->> 'role') = 'service_role' then
    return new;
  end if;

  new.status              := old.status;
  new.reviewed_by         := old.reviewed_by;
  new.reviewed_at         := old.reviewed_at;
  new.review_notes        := old.review_notes;
  new.email               := old.email;
  new.email_confirm_token := old.email_confirm_token;
  new.email_confirmed_at  := old.email_confirmed_at;
  return new;
end;
$guard$;

-- ────────────────────────────────────────────────────────────
-- 3. AUDIT TRAIL
-- reviewed_by/reviewed_at sul profilo vengono sovrascritti a ogni azione:
-- da soli non raccontano la storia. Qui resta tutto, in append.
-- ────────────────────────────────────────────────────────────
create table if not exists trainer_admin_actions (
  id         uuid primary key default gen_random_uuid(),
  trainer_id uuid references trainer_profiles(id) on delete set null,
  -- l'email del candidato resta anche dopo la cancellazione del profilo:
  -- un registro che sparisce con ciò che deve testimoniare è inutile.
  trainer_email text,
  actor      text not null,
  action     text not null,
  details    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists trainer_actions_trainer_idx on trainer_admin_actions (trainer_id, created_at desc);
create index if not exists trainer_actions_created_idx on trainer_admin_actions (created_at desc);

alter table trainer_admin_actions enable row level security;
drop policy if exists "Service role full actions" on trainer_admin_actions;
create policy "Service role full actions" on trainer_admin_actions
  for all to service_role using (true) with check (true);
