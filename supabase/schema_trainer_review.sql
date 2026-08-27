-- apulia.ai — Trainer Academy: esito "integrazioni richieste" sull'esame finale
-- Esegui DOPO schema_trainer.sql. Idempotente.
--
-- Problema che risolve: la revisione dell'esame aveva due soli esiti
-- definitivi, qualificato o respinto, piu' il marcatore interno
-- `under_review`. Mancava la via di mezzo che nella pratica serve quasi
-- sempre: il video e' quasi buono, mancano venti minuti di lavoro. Senza
-- questo stato il revisore doveva scegliere tra bocciare un candidato
-- recuperabile e qualificarne uno non ancora pronto.
--
-- `needs_work` e' l'unico stato di revisione che restituisce la palla al
-- candidato: la consegna torna modificabile e il percorso riparte da li'.

alter table trainer_exam_submissions
  drop constraint if exists trainer_exam_submissions_status_check;

alter table trainer_exam_submissions
  add constraint trainer_exam_submissions_status_check
  check (status in ('draft','submitted','under_review','needs_work','qualified','rejected'));

-- Report: distribuzione delle consegne per stato.
select status, count(*) as consegne
from trainer_exam_submissions
group by status
order by status;
