-- apulia.ai — Accesso iscritti all'archivio (magic link)
-- Esegui DOPO schema.sql e schema_trainer_security.sql. Idempotente.
--
-- Nessuna password: l'iscritto ha già dimostrato di controllare la sua casella
-- confermando l'iscrizione. L'accesso è un link monouso a scadenza breve.
--
-- Del token si conserva solo l'impronta SHA-256: chi legge il database non
-- ottiene un link utilizzabile.

create table if not exists subscriber_login_tokens (
  id            uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  token_hash    text not null unique,
  expires_at    timestamptz not null,
  used_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists subscriber_login_tokens_hash_idx
  on subscriber_login_tokens (token_hash);
create index if not exists subscriber_login_tokens_subscriber_idx
  on subscriber_login_tokens (subscriber_id, created_at desc);

alter table subscriber_login_tokens enable row level security;

drop policy if exists "Service role full login tokens" on subscriber_login_tokens;
create policy "Service role full login tokens" on subscriber_login_tokens
  for all to service_role using (true) with check (true);

/**
 * Consuma un token di accesso: lo marca usato e restituisce l'iscritto, ma
 * solo se il token è valido, non scaduto e mai usato prima.
 *
 * La verifica e il consumo stanno nella stessa istruzione: due richieste
 * simultanee con lo stesso link non possono entrambe andare a buon fine.
 */
create or replace function consume_subscriber_login_token(p_token_hash text)
returns table (subscriber_id uuid, email text)
language plpgsql
security definer
set search_path = public
as $fn$
begin
  delete from subscriber_login_tokens
  where expires_at < now() - interval '7 days';

  return query
  with consumed as (
    update subscriber_login_tokens t
       set used_at = now()
     where t.token_hash = p_token_hash
       and t.used_at is null
       and t.expires_at > now()
    returning t.subscriber_id
  )
  select s.id, s.email
    from consumed c
    join subscribers s on s.id = c.subscriber_id
   where s.status = 'active';
end;
$fn$;
