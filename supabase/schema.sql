-- apulia.ai — Supabase Schema
-- Esegui questo script nella Supabase SQL Editor del progetto apulia.ai

-- ────────────────────────────────────────────────────────────
-- SUBSCRIBERS
-- ────────────────────────────────────────────────────────────
create table if not exists subscribers (
  id                   uuid default gen_random_uuid() primary key,
  email                text unique not null,
  preferred_language   text default 'it' check (preferred_language in ('it', 'en')),
  products             text[] default array['weekly'],
  status               text default 'pending' check (status in ('pending', 'active', 'unsubscribed', 'bounced')),
  confirmed_at         timestamp with time zone,
  unsubscribed_at      timestamp with time zone,
  source               text default 'landing',
  created_at           timestamp with time zone default now(),
  updated_at           timestamp with time zone default now()
);

-- indice su email per lookup rapido
create index if not exists subscribers_email_idx on subscribers (email);
create index if not exists subscribers_status_idx on subscribers (status);

-- RLS: solo il service role può leggere/scrivere
alter table subscribers enable row level security;

-- policy: insert anonimo consentito (per la landing page)
create policy "Allow anon insert" on subscribers
  for insert to anon
  with check (true);

-- policy: solo authenticated (service key) può leggere
create policy "Allow service read" on subscribers
  for select to service_role
  using (true);

-- policy: solo service role può aggiornare
create policy "Allow service update" on subscribers
  for update to service_role
  using (true);


-- ────────────────────────────────────────────────────────────
-- NEWSLETTER ISSUES
-- ────────────────────────────────────────────────────────────
create table if not exists newsletter_issues (
  id             uuid default gen_random_uuid() primary key,
  type           text not null check (type in ('weekly', 'monthly')),
  issue_number   integer not null,
  title          text not null,
  title_en       text,
  slug           text unique not null,
  dek            text,
  dek_en         text,
  html_content   text,
  pdf_url        text,
  status         text default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at   timestamp with time zone,
  created_at     timestamp with time zone default now(),
  updated_at     timestamp with time zone default now()
);

create index if not exists issues_type_idx     on newsletter_issues (type);
create index if not exists issues_status_idx   on newsletter_issues (status);
create index if not exists issues_published_idx on newsletter_issues (published_at desc);

alter table newsletter_issues enable row level security;

-- issues pubblicate visibili a tutti
create policy "Public can read published issues" on newsletter_issues
  for select to anon
  using (status = 'published');

create policy "Service role full access issues" on newsletter_issues
  for all to service_role
  using (true);


-- ────────────────────────────────────────────────────────────
-- EMAIL SENDS LOG
-- ────────────────────────────────────────────────────────────
create table if not exists email_sends (
  id              uuid default gen_random_uuid() primary key,
  issue_id        uuid references newsletter_issues(id),
  subscriber_id   uuid references subscribers(id),
  sent_at         timestamp with time zone default now(),
  status          text default 'sent' check (status in ('sent', 'delivered', 'bounced', 'opened', 'clicked')),
  zepto_message_id text
);

create index if not exists sends_issue_idx on email_sends (issue_id);
create index if not exists sends_subscriber_idx on email_sends (subscriber_id);

alter table email_sends enable row level security;

create policy "Service role full access sends" on email_sends
  for all to service_role
  using (true);


-- ────────────────────────────────────────────────────────────
-- FUNZIONE: aggiorna updated_at automaticamente
-- ────────────────────────────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger subscribers_updated_at
  before update on subscribers
  for each row execute function update_updated_at_column();

create trigger issues_updated_at
  before update on newsletter_issues
  for each row execute function update_updated_at_column();
