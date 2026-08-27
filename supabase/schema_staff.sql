-- apulia.ai — account di staff della Trainer Academy (ruolo coach)
-- Esegui DOPO schema_trainer.sql. Idempotente.
--
-- Problema che risolve: fino a qui la console aveva un solo utente, quello
-- delle variabili d'ambiente ADMIN_EMAIL/ADMIN_PASSWORD. Valutare i trainer
-- e' pero' un lavoro continuo che non puo' dipendere da una credenziale
-- condivisa: serve poter dare un accesso nominale a chi valuta, senza
-- consegnargli anche le chiavi degli iscritti alla newsletter e delle
-- candidature.
--
-- Il ruolo `coach` vede l'avanzamento dei trainer ammessi e ne valuta gli
-- esami; NON ammette e non respinge candidati, non sospende accessi, non
-- cancella dati, non vede la dashboard iscritti. Il confine e' applicato dal
-- proxy sulle rotte e ri-applicato dentro ogni azione: l'interfaccia che
-- nasconde un pulsante non e' un controllo di sicurezza.
--
-- La password e' un hash PBKDF2-SHA256 prodotto da src/lib/staff.ts, nel
-- formato `pbkdf2$<iterazioni>$<salt_b64url>$<hash_b64url>`. Non inserire mai
-- una password in chiaro in questa tabella: usa la console admin, che chiama
-- l'API di creazione.

create table if not exists trainer_staff (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  full_name     text,
  role          text not null default 'coach' check (role in ('coach','admin')),
  password_hash text not null,
  is_active     boolean not null default true,
  created_by    text,
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- L'email e' l'identificatore di accesso: il confronto deve essere
-- insensibile alle maiuscole, altrimenti "Mario@x.it" e "mario@x.it"
-- diventano due account distinti con la stessa identita' reale.
create unique index if not exists trainer_staff_email_lower_idx
  on trainer_staff (lower(email));

alter table trainer_staff enable row level security;

-- Nessuna policy per anon/authenticated: la tabella contiene hash di
-- password e viene letta solo dalle API route con service-role.
drop policy if exists "Service role full staff" on trainer_staff;
create policy "Service role full staff" on trainer_staff
  for all to service_role using (true) with check (true);

do $mig$
begin
  execute 'drop trigger if exists trainer_staff_updated_at on trainer_staff';
  execute 'create trigger trainer_staff_updated_at before update on trainer_staff
           for each row execute function update_updated_at_column()';
end
$mig$;

-- Report
select role, count(*) filter (where is_active) as attivi, count(*) as totali
from trainer_staff
group by role
order by role;
