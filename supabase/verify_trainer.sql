-- apulia.ai — Trainer Academy: verifica post-installazione
-- Incollare nella SQL Editor di Supabase ed eseguire. Restituisce un unico
-- report: ogni riga dice cosa è stato controllato e il valore trovato.
--
-- Valori attesi su un'installazione corretta:
--   • 20 domande nel pool di ciascuno dei 7 moduli con contenuti
--     (il quiz ne estrae 10 a caso per tentativo)
--   • 0 domande per modulo-4, modulo-9, modulo-10 (segnaposto)
--   • 14 domande per l'esame finale
--   • tutti i controlli di integrità a 0
--   • 3 bucket trainer-*

with quiz_counts as (
  select
    coalesce(m.slug, 'ESAME FINALE') as nome,
    count(qq.id)                     as domande
  from trainer_quizzes q
  left join trainer_modules   m  on m.id = q.module_id
  left join trainer_questions qq on qq.quiz_id = q.id
  group by 1
),
trainer_tables as (
  select tablename
  from pg_tables
  where schemaname = 'public' and tablename like 'trainer%'
)
select '1. domande per quiz' as sezione, nome as controllo, domande::text as valore
from quiz_counts

union all
select '2. totali', 'domande',
       (select count(*)::text from trainer_questions)
union all
select '2. totali', 'opzioni di risposta',
       (select count(*)::text from trainer_question_options)
union all
select '2. totali', 'domande aperte (solo esame)',
       (select count(*)::text from trainer_questions where kind = 'open')
union all
select '2. totali', 'moduli',
       (select count(*)::text from trainer_modules)

union all
select '3. integrita (atteso 0)', 'domande chiuse senza risposta corretta',
       (select count(*)::text
        from trainer_questions q
        where q.kind <> 'open'
          and not exists (select 1 from trainer_question_options o
                          where o.question_id = q.id and o.is_correct))
union all
select '3. integrita (atteso 0)', 'domande chiuse senza opzioni',
       (select count(*)::text
        from trainer_questions q
        where q.kind <> 'open'
          and not exists (select 1 from trainer_question_options o
                          where o.question_id = q.id))
union all
select '3. integrita (atteso 0)', 'moduli senza quiz',
       (select count(*)::text
        from trainer_modules m
        where not exists (select 1 from trainer_quizzes q where q.module_id = m.id))

union all
select '4. sicurezza (atteso 0)', 'tabelle trainer senza RLS attivo',
       (select count(*)::text
        from trainer_tables t
        join pg_class c on c.oid = ('public.' || quote_ident(t.tablename))::regclass
        where not c.relrowsecurity)
union all
select '4. sicurezza (atteso 0)', 'domande/opzioni leggibili da authenticated',
       (select count(*)::text
        from (values ('trainer_questions'), ('trainer_question_options')) as v(t)
        where has_table_privilege('authenticated', v.t::regclass, 'SELECT')
          and exists (select 1 from pg_policies p
                      where p.tablename = v.t and 'authenticated' = any(p.roles)))
union all
select '4. sicurezza', 'tabelle trainer con GRANT SELECT ad authenticated',
       (select count(*)::text
        from trainer_tables t
        where has_table_privilege('authenticated',
              ('public.' || quote_ident(t.tablename))::regclass, 'SELECT'))
union all
select '4. sicurezza', 'trigger anti-escalation presente',
       (select case when count(*) > 0 then 'si' else 'NO — RIAPPLICARE schema_trainer.sql' end
        from pg_trigger where tgname = 'trainer_profiles_guard')

union all
select '5. storage', 'bucket trainer creati',
       (select count(*)::text from storage.buckets where id like 'trainer-%')
union all
select '5. storage', 'bucket pubblici per errore (atteso 0)',
       (select count(*)::text from storage.buckets where id like 'trainer-%' and public)

union all
select '6. pubblicazione', 'moduli pubblicati',
       (select count(*)::text from trainer_modules where is_published)
union all
select '6. pubblicazione', 'quiz pubblicati',
       (select count(*)::text from trainer_quizzes where is_published)

order by sezione, controllo;
