-- apulia.ai — Trainer Academy: tracciamento dell'attività sui materiali
-- Esegui DOPO schema_trainer.sql. Idempotente.
--
-- Serve al revisore per valutare l'impegno reale del candidato: i punteggi
-- dei quiz dicono il risultato, non quanto tempo ci ha messo ad arrivarci.
-- Qui si registra ogni apertura di un materiale di modulo.
--
-- Limite dichiarato: si misura l'APERTURA di una risorsa, non i minuti di
-- lettura o di visione. Sapere quanto a lungo qualcuno guarda un PDF
-- richiederebbe telemetria nel client, che è invasiva e facile da falsare.
-- L'indicatore onesto è "quali materiali ha aperto, quante volte, e con
-- quanto anticipo rispetto al quiz".

create table if not exists trainer_resource_views (
  id          uuid primary key default gen_random_uuid(),
  trainer_id  uuid not null references trainer_profiles(id) on delete cascade,
  resource_id uuid not null references trainer_module_resources(id) on delete cascade,
  module_id   uuid not null references trainer_modules(id) on delete cascade,
  viewed_at   timestamptz not null default now()
);

create index if not exists trainer_views_trainer_idx on trainer_resource_views (trainer_id);
create index if not exists trainer_views_module_idx  on trainer_resource_views (trainer_id, module_id);

alter table trainer_resource_views enable row level security;

drop policy if exists "Trainer reads own views" on trainer_resource_views;
drop policy if exists "Service role full views"  on trainer_resource_views;

create policy "Trainer reads own views" on trainer_resource_views
  for select to authenticated using (trainer_id = auth.uid());

create policy "Service role full views" on trainer_resource_views
  for all to service_role using (true) with check (true);

-- Riepilogo per trainer e modulo, pronto per la console del revisore.
create or replace view trainer_module_activity
with (security_invoker = true) as
select
  v.trainer_id,
  v.module_id,
  count(*)            as aperture,
  count(distinct v.resource_id) as materiali_distinti,
  min(v.viewed_at)    as prima_apertura,
  max(v.viewed_at)    as ultima_apertura
from trainer_resource_views v
group by v.trainer_id, v.module_id;
