-- apulia.ai — Trainer Academy: domande 9 e 10 di ogni quiz di modulo
-- Esegui DOPO seed_trainer_quizzes.sql.
--
-- Porta ogni quiz di modulo da 8 a 10 domande. Usa lo stesso helper
-- trainer_seed_question, quindi vale la stessa regola: una domanda gia'
-- presente in quella posizione non viene sovrascritta.

-- ── MODULO 1 — Le PMI pugliesi e l'AI ──────────────────────
select trainer_seed_question('pmi-pugliesi-ai', 9, 'single',
  $q$Nel settore logistica, quale stakeholder ha un peso decisionale pari a quello del titolare?$q$,
  $q$Il cliente principale, tipicamente la GDO: se il grande committente chiede tracciabilità, il titolare si muove. Il trainer deve coinvolgerlo come stakeholder.$q$,
  array[$q$Il cliente principale (GDO)$q$,
        $q$Il commercialista$q$,
        $q$Il responsabile qualità$q$,
        $q$L'agente commerciale$q$],
  array[1]);

select trainer_seed_question('pmi-pugliesi-ai', 10, 'multi',
  $q$Quali sono prerequisiti minimi da verificare prima di proporre un progetto AI a una PMI?$q$,
  $q$Servono un repository dati centralizzato, processi documentati e ripetibili e un referente interno per la raccolta dati. Un modello proprietario addestrato in casa non è un prerequisito: è semmai un punto d'arrivo remoto.$q$,
  array[$q$Un repository dati centralizzato, anche cloud low-cost$q$,
        $q$Processi documentati e ripetibili$q$,
        $q$Un referente interno per la raccolta dati$q$,
        $q$Un modello proprietario addestrato internamente$q$],
  array[1,2,3]);

-- ── MODULO 2 — Fondamenti AI e arte della traduzione ───────
select trainer_seed_question('fondamenti-ai', 9, 'single',
  $q$Qual è la differenza tra tool use e agenti, secondo il modulo?$q$,
  $q$Il tool use è un'azione alla volta sotto supervisione; l'agente esegue sequenze autonome multi-step e decide quali strumenti usare. Il trainer introduce i tool prima, gli agenti solo quando il cliente è pronto.$q$,
  array[$q$Tool use: un'azione alla volta sotto controllo; agenti: sequenze autonome multi-step$q$,
        $q$Tool use: sequenze autonome; agenti: una singola chiamata supervisionata$q$,
        $q$Sono sinonimi, cambia solo il nome commerciale$q$,
        $q$Il tool use richiede il riaddestramento del modello, l'agente no$q$],
  array[1]);

select trainer_seed_question('fondamenti-ai', 10, 'single',
  $q$Parlando con un impiegato amministrativo preoccupato di essere sostituito, qual è l'impostazione corretta?$q$,
  $q$Rassicurare esplicitamente che il ruolo evolve e non scompare: l'AI si prende il lavoro ripetitivo, la persona resta quella che decide, si relaziona e risolve i problemi.$q$,
  array[$q$Spiegare che l'AI toglie il lavoro ripetitivo e che il ruolo evolve, non scompare$q$,
        $q$Evitare l'argomento e parlare solo con il titolare$q$,
        $q$Illustrare l'architettura tecnica per dimostrare che è innocua$q$,
        $q$Confermare che alcune mansioni saranno eliminate e che è inevitabile$q$],
  array[1]);

-- ── MODULO 3 — Selezione del modello e strategia di adozione ─
select trainer_seed_question('selezione-modello', 9, 'single',
  $q$Perché il modello più economico non è automaticamente il più conveniente?$q$,
  $q$Perché va sommato il costo del rework generato dagli errori: nell'esempio dei DDT, 12,50 € in più al mese di modello comprano circa 26 errori in meno, che varrebbero 1.300 € di rilavorazione.$q$,
  array[$q$Perché al costo del modello va sommato il costo degli errori che produce$q$,
        $q$Perché i modelli economici hanno sempre latenza più alta$q$,
        $q$Perché i provider low-cost non sono conformi al GDPR$q$,
        $q$Perché il prezzo per token aumenta con il volume$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 10, 'multi',
  $q$Quali verifiche della checklist di sostituibilità vanno superate prima del go-live?$q$,
  $q$Prompt portabile su almeno due provider, abstraction layer attivo, failover effettivamente testato. Un impegno contrattuale pluriennale va nella direzione opposta: aumenta il costo di uscita.$q$,
  array[$q$Il prompt funziona su almeno 2 provider senza riscrittura$q$,
        $q$Esiste un gateway che astrae le API$q$,
        $q$Il failover è stato simulato e verificato$q$,
        $q$È stato firmato un impegno pluriennale con il provider scelto$q$],
  array[1,2,3]);

-- ── MODULO 5 — EU AI Act e conformità ──────────────────────
select trainer_seed_question('ai-act', 9, 'single',
  $q$Una PMI usa un modello GPAI di terzi per costruire il proprio AI Agent. Cosa comporta?$q$,
  $q$Diventa fornitore del sistema AI finale ed eredita gli obblighi del livello di rischio dell'applicazione: la conformità del componente GPAI non esonera dalla conformità del sistema costruito sopra.$q$,
  array[$q$Diventa fornitore del sistema finale: deve governare l'intera catena$q$,
        $q$Nessun obbligo: la conformità del modello GPAI copre tutto$q$,
        $q$Diventa solo distributore del modello GPAI$q$,
        $q$L'AI Act non si applica ai sistemi costruiti su modelli di terzi$q$],
  array[1]);

select trainer_seed_question('ai-act', 10, 'single',
  $q$Che cosa offre a una PMI una sandbox regolamentare?$q$,
  $q$Un ambiente controllato per testare sistemi AI innovativi con la guida delle autorità, senza rischio sanzionatorio durante la sperimentazione, con accesso prioritario per PMI e startup.$q$,
  array[$q$Un ambiente di test con guida delle autorità e nessun rischio sanzionatorio nella fase di prova$q$,
        $q$Un'esenzione permanente dagli obblighi dell'AI Act$q$,
        $q$Un finanziamento a fondo perduto per progetti AI$q$,
        $q$Una certificazione di conformità rilasciata automaticamente$q$],
  array[1]);

-- ── MODULO 6 — AI Agent per la qualificazione dei lead ─────
select trainer_seed_question('agent-marketing-lead', 9, 'single',
  $q$Cosa deve fare l'agente se il tool di arricchimento fallisce per timeout?$q$,
  $q$Ritentare due volte con backoff esponenziale e, se continua a fallire, proseguire con i dati parziali marcando il lead con il flag 'enrichment_incomplete'.$q$,
  array[$q$Ritentare con backoff, poi proseguire con dati parziali e un flag di incompletezza$q$,
        $q$Interrompere il flusso e scartare il lead$q$,
        $q$Inventare i dati mancanti per completare il profilo$q$,
        $q$Creare comunque il task CRM senza segnalare nulla$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 10, 'single',
  $q$Perché il principio di design dei tool viene definito "poka-yoke"?$q$,
  $q$Perché il tool va progettato in modo che sbagliare sia difficile: descrizione autoesplicativa, enum al posto del testo libero, percorsi assoluti. Un tool mal descritto è un agente che sbaglia.$q$,
  array[$q$Perché il tool va reso difficile da usare in modo sbagliato$q$,
        $q$Perché ogni tool deve avere un test automatico$q$,
        $q$Perché i tool vanno eseguiti in parallelo$q$,
        $q$Perché il tool deve essere il più generico possibile$q$],
  array[1]);

-- ── MODULO 7 — ROI e selezione degli use case ──────────────
select trainer_seed_question('roi-use-case', 9, 'single',
  $q$Nei primi 3-6 mesi, quanta parte del beneficio a regime è realistico attendersi?$q$,
  $q$Il 40-60%: la curva di maturazione prevede setup senza benefici nei primi 3 mesi, pilota al 40-60%, ramp-up al 70-80% e regime pieno solo dopo il dodicesimo mese.$q$,
  array[$q$Il 40-60%$q$, $q$Il 100% fin da subito$q$, $q$Il 90%$q$, $q$Nessun beneficio prima di 24 mesi$q$],
  array[1]);

select trainer_seed_question('roi-use-case', 10, 'single',
  $q$Nella matrice di prioritizzazione, come si tratta uno use case ad alto ROI ma bassa fattibilità?$q$,
  $q$Non si scarta e non si avvia: si investe prima nella readiness — dati, processi, competenze — per renderlo fattibile.$q$,
  array[$q$Si investe nella readiness prima di avviarlo$q$,
        $q$Si avvia subito, il ROI giustifica il rischio$q$,
        $q$Si scarta definitivamente$q$,
        $q$Si avvia solo se il budget lo consente$q$],
  array[1]);

-- ── MODULO 8 — Change management e adozione dell'AI ────────
select trainer_seed_question('change-management', 9, 'single',
  $q$Di quanto si riduce la resistenza coinvolgendo le persone prima di implementare?$q$,
  $q$Del 60-70% rispetto a chi impone il cambiamento: l'engagement non è un evento ma un processo in quattro fasi, da consapevolezza a scaling.$q$,
  array[$q$Del 60-70%$q$, $q$Del 10%$q$, $q$Non si riduce: dipende solo dagli incentivi$q$, $q$Del 100%$q$],
  array[1]);

select trainer_seed_question('change-management', 10, 'multi',
  $q$Quali sono le tre azioni immediate con cui avviare la trasformazione?$q$,
  $q$Assessment della readiness organizzativa, definizione della governance AI e lancio di un pilot con ridisegno del workflow. Si avviano in parallelo e in due settimane producono la base del percorso. La sostituzione del gestionale non c'entra.$q$,
  array[$q$Assessment della readiness organizzativa$q$,
        $q$Definizione della governance AI (sponsor e steering committee)$q$,
        $q$Un pilot con ridisegno del workflow$q$,
        $q$La sostituzione del gestionale aziendale$q$],
  array[1,2,3]);
