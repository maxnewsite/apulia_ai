-- apulia.ai — Trainer Academy: domande dei quiz di modulo e dell'esame finale
-- Esegui DOPO seed_trainer.sql.
--
-- Le domande sono derivate dai deck dei moduli (apulia_trainer/*.pptx).
-- I moduli 4, 9 e 10 non hanno ancora contenuti: i loro quiz restano vuoti
-- e non pubblicati.
--
-- Idempotenza: una domanda già presente in una data posizione NON viene
-- sovrascritta. Questo protegge i tentativi già sostenuti, che referenziano
-- le domande. Per rigenerare un quiz, cancellare prima le sue domande a mano.

-- ────────────────────────────────────────────────────────────
-- HELPER DI SEED
-- ────────────────────────────────────────────────────────────
create or replace function trainer_seed_question(
  p_module_slug text,
  p_position    integer,
  p_kind        text,
  p_prompt      text,
  p_explanation text,
  p_options     text[],
  p_correct     integer[]
) returns void
language plpgsql
as $fn$
declare
  v_quiz_id     uuid;
  v_question_id uuid;
  i             integer;
begin
  if p_module_slug = '__exam__' then
    select id into v_quiz_id from trainer_quizzes where kind = 'exam';
  else
    select q.id into v_quiz_id
    from trainer_quizzes q
    join trainer_modules m on m.id = q.module_id
    where m.slug = p_module_slug;
  end if;

  if v_quiz_id is null then
    raise notice 'Quiz non trovato per %, domanda % saltata', p_module_slug, p_position;
    return;
  end if;

  if exists (select 1 from trainer_questions where quiz_id = v_quiz_id and position = p_position) then
    return;
  end if;

  insert into trainer_questions (quiz_id, position, kind, prompt, explanation)
  values (v_quiz_id, p_position, p_kind, p_prompt, p_explanation)
  returning id into v_question_id;

  for i in 1 .. coalesce(array_length(p_options, 1), 0) loop
    insert into trainer_question_options (question_id, position, label, is_correct)
    values (v_question_id, i, p_options[i], i = any(p_correct));
  end loop;
end;
$fn$;

-- ════════════════════════════════════════════════════════════
-- MODULO 1 — Le PMI pugliesi e l'AI
-- ════════════════════════════════════════════════════════════
select trainer_seed_question('pmi-pugliesi-ai', 1, 'single',
  $q$Qual è la dimensione media in addetti di un'impresa pugliese, rispetto al dato nazionale?$q$,
  $q$2,14 addetti contro 2,60 della media nazionale: le imprese pugliesi sono più piccole e più frammentate, e le soluzioni AI vanno calibrate su questa scala.$q$,
  array[$q$2,14 addetti, sotto la media nazionale di 2,60$q$,
        $q$2,60 addetti, in linea con la media nazionale$q$,
        $q$4,80 addetti, sopra la media nazionale$q$,
        $q$8 addetti, come la media del Nord-ovest$q$],
  array[1]);

select trainer_seed_question('pmi-pugliesi-ai', 2, 'single',
  $q$Nella PMI pugliese tipo, chi è il decisore economico?$q$,
  $q$Nel 85% dei casi la proprietà è familiare e il titolare-fondatore è l'unico decisore: sotto i 20 addetti non esiste un CdA formalizzato.$q$,
  array[$q$Il titolare-fondatore, quasi sempre unico decisore$q$,
        $q$Il responsabile IT interno$q$,
        $q$Il consiglio di amministrazione$q$,
        $q$Il responsabile di produzione$q$],
  array[1]);

select trainer_seed_question('pmi-pugliesi-ai', 3, 'multi',
  $q$Quali di questi ruoli sono descritti come potenziali BLOCCANTI di un progetto AI in una PMI pugliese?$q$,
  $q$Il commercialista blocca se non vede un vantaggio fiscale; il responsabile di produzione resiste per timore di perdere controllo; il tecnico IT esterno può sabotare se la soluzione lo scavalca.$q$,
  array[$q$Il commercialista, se non vede vantaggio fiscale$q$,
        $q$Il responsabile di produzione o capo officina$q$,
        $q$Il tecnico IT esterno, se la soluzione lo scavalca$q$,
        $q$Il figlio o la figlia in azienda$q$],
  array[1,2,3]);

select trainer_seed_question('pmi-pugliesi-ai', 4, 'single',
  $q$Qual è definito come il rischio numero uno del trainer con profilo tecnico?$q$,
  $q$Proporre soluzioni eleganti a problemi che non esistono: un modello predittivo della domanda è inutile a chi non ha nemmeno lo storico vendite digitalizzato.$q$,
  array[$q$Proporre soluzioni eleganti a problemi che non esistono$q$,
        $q$Usare troppi acronimi durante la presentazione$q$,
        $q$Sottostimare il budget disponibile del cliente$q$,
        $q$Non conoscere abbastanza modelli linguistici$q$],
  array[1]);

select trainer_seed_question('pmi-pugliesi-ai', 5, 'single',
  $q$In quale fase del framework diagnostico arriva la proposta AI?$q$,
  $q$La proposta arriva solo alla fase 5: le prime quattro fasi costruiscono la credibilità e la comprensione che la rendono accettabile.$q$,
  array[$q$Fase 5, dopo anagrafica, processi AS-IS, sistemi IT e organigramma decisionale$q$,
        $q$Fase 1, subito dopo il primo incontro con il titolare$q$,
        $q$Fase 2, appena mappati i processi$q$,
        $q$Fase 3, dopo l'inventario dei sistemi IT$q$],
  array[1]);

select trainer_seed_question('pmi-pugliesi-ai', 6, 'single',
  $q$Qual è il tasso di adozione AI nelle imprese del Sud Italia rispetto al Nord?$q$,
  $q$Sud Italia 4-5% contro Nord 10-12%: il mercato pugliese è quasi vergine, il che è un'opportunità ma impone di partire dalle basi.$q$,
  array[$q$Sud 4-5% contro Nord 10-12%$q$,
        $q$Sud 10-12% contro Nord 4-5%$q$,
        $q$Sud e Nord entrambi intorno all'8%$q$,
        $q$Sud 20% contro Nord 25%$q$],
  array[1]);

select trainer_seed_question('pmi-pugliesi-ai', 7, 'boolean',
  $q$La Scheda Cliente Strutturata è il deliverable minimo di ogni assessment: senza scheda compilata non si presenta alcuna proposta AI al titolare.$q$,
  $q$Vero. La scheda copre le cinque fasi del framework e va completata prima di formulare qualsiasi proposta.$q$,
  array[$q$Vero$q$, $q$Falso$q$],
  array[1]);

select trainer_seed_question('pmi-pugliesi-ai', 8, 'single',
  $q$Qual è la situazione IT tipica della PMI pugliese descritta nel modulo?$q$,
  $q$Nessun reparto IT interno, gestionale usato solo per fatturare, Excel per la pianificazione, WhatsApp come canale principale e dati clienti nella rubrica del titolare.$q$,
  array[$q$Nessun IT interno: gestionale solo per fatturare, Excel, WhatsApp e dati nella rubrica del titolare$q$,
        $q$Un reparto IT di 2-3 persone con CRM e data warehouse$q$,
        $q$Un IT manager part-time con backup strutturato$q$,
        $q$Sistemi cloud integrati gestiti da un system integrator$q$],
  array[1]);

-- ════════════════════════════════════════════════════════════
-- MODULO 2 — Fondamenti AI e arte della traduzione
-- ════════════════════════════════════════════════════════════
select trainer_seed_question('fondamenti-ai', 1, 'single',
  $q$Che cosa fa, tecnicamente, un LLM?$q$,
  $q$Predice il token successivo più probabile: è un motore di completamento statistico, non un sistema che ragiona causalmente.$q$,
  array[$q$Predice il token successivo più probabile$q$,
        $q$Ragiona causalmente sulle relazioni tra i fatti$q$,
        $q$Consulta in tempo reale una base dati aggiornata$q$,
        $q$Memorizza tutte le conversazioni precedenti$q$],
  array[1]);

select trainer_seed_question('fondamenti-ai', 2, 'multi',
  $q$Quali di queste affermazioni descrivono ciò che un LLM NON fa?$q$,
  $q$Un LLM non ragiona causalmente, non accede a dati in tempo reale e non garantisce accuratezza fattuale. Riassumere documenti lunghi, invece, è tra le cose che fa bene.$q$,
  array[$q$Non ragiona causalmente: simula catene logiche$q$,
        $q$Non accede a dati in tempo reale: è congelato al training$q$,
        $q$Non garantisce accuratezza fattuale$q$,
        $q$Non riesce a riassumere documenti lunghi$q$],
  array[1,2,3]);

select trainer_seed_question('fondamenti-ai', 3, 'single',
  $q$Quale analogia il modulo associa al context window?$q$,
  $q$La scrivania: ci sta un fascicolo alla volta, non tutto l'archivio. Il dipendente-che-ha-letto-tutto è l'analogia del RAG, il contatore dell'acqua quella della tokenizzazione.$q$,
  array[$q$La scrivania: ci sta un fascicolo alla volta, non tutto l'archivio$q$,
        $q$Il contatore dell'acqua: si paga a consumo$q$,
        $q$Il dipendente che ha letto tutti i documenti aziendali$q$,
        $q$Il raccoglitore in cui si aggiunge un foglio$q$],
  array[1]);

select trainer_seed_question('fondamenti-ai', 4, 'single',
  $q$Qual è il vantaggio principale del RAG per una PMI?$q$,
  $q$Rende interrogabili i documenti esistenti senza riaddestrare il modello: costo di training zero, aggiornamento immediato, dati che restano dove sono.$q$,
  array[$q$Rende interrogabili i documenti aziendali senza riaddestrare il modello$q$,
        $q$Riaddestra il modello sui dati dell'azienda ogni notte$q$,
        $q$Elimina completamente il costo delle query$q$,
        $q$Permette al modello di accedere a internet in tempo reale$q$],
  array[1]);

select trainer_seed_question('fondamenti-ai', 5, 'boolean',
  $q$Le allucinazioni vanno spiegate al cliente come un difetto strutturale del funzionamento di un LLM, non come un bug da correggere.$q$,
  $q$Vero. Il modello calcola la sequenza più plausibile: il trainer deve insegnare a distinguere i contesti a basso rischio da quelli pericolosi.$q$,
  array[$q$Vero$q$, $q$Falso$q$],
  array[1]);

select trainer_seed_question('fondamenti-ai', 6, 'single',
  $q$Di quanto il grounding tramite RAG riduce le allucinazioni, secondo il modulo?$q$,
  $q$Del 70-90%, a costo basso. Combinato con prompt vincolati e revisione umana sulle decisioni critiche copre il 95% dei rischi.$q$,
  array[$q$Del 70-90%$q$, $q$Del 10-20%$q$, $q$Del 100%$q$, $q$Del 30-40%$q$],
  array[1]);

select trainer_seed_question('fondamenti-ai', 7, 'single',
  $q$Quanto costa l'italiano rispetto all'inglese, a parità di contenuto?$q$,
  $q$Circa il 30% in più: la tokenizzazione dell'italiano produce più token per la stessa quantità di significato.$q$,
  array[$q$Circa il 30% in più$q$, $q$Circa il 30% in meno$q$, $q$Esattamente uguale$q$, $q$Circa il triplo$q$],
  array[1]);

select trainer_seed_question('fondamenti-ai', 8, 'single',
  $q$Che cosa afferma la "regola dei 4 minuti"?$q$,
  $q$Se non riesci a spiegare un concetto a un titolare di 58 anni in quattro minuti, non l'hai capito abbastanza: la traduzione non è semplificazione, è padronanza.$q$,
  array[$q$Se non sai spiegarlo a un titolare in 4 minuti, non l'hai capito abbastanza$q$,
        $q$Ogni demo tecnica deve durare almeno 4 minuti$q$,
        $q$Il cliente decide entro 4 minuti dall'inizio dell'incontro$q$,
        $q$Ogni risposta dell'AI deve arrivare entro 4 minuti$q$],
  array[1]);

-- ════════════════════════════════════════════════════════════
-- MODULO 3 — Selezione del modello e strategia di adozione
-- ════════════════════════════════════════════════════════════
select trainer_seed_question('selezione-modello', 1, 'single',
  $q$Qual è la regola aurea nella selezione del modello?$q$,
  $q$Si sceglie il modello DOPO il caso d'uso, mai prima: partire dalla tecnologia espone il cliente a mode, vendor push e lock-in.$q$,
  array[$q$Si sceglie il modello dopo aver definito il caso d'uso$q$,
        $q$Si sceglie il modello più diffuso sul mercato$q$,
        $q$Si sceglie sempre il modello con il contesto più ampio$q$,
        $q$Si sceglie il modello più economico e si adatta il caso d'uso$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 2, 'single',
  $q$Nella matrice di selezione apulia.ai, quale criterio ha il peso più alto?$q$,
  $q$L'accuratezza, al 30%: è il criterio primario perché l'imprecisione genera rework. Seguono costo 25%, latenza e integrazione 15%, roadmap 10%, compliance 5%.$q$,
  array[$q$Accuratezza, 30%$q$, $q$Costo, 25%$q$, $q$Compliance, 5%$q$, $q$Integrazione, 15%$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 3, 'boolean',
  $q$Uno score pari a 1 sul criterio Compliance comporta l'esclusione automatica del modello, indipendentemente dal punteggio totale.$q$,
  $q$Vero. La compliance pesa solo il 5%, ma funziona come veto assoluto.$q$,
  array[$q$Vero$q$, $q$Falso$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 4, 'multi',
  $q$Quali sono i quattro livelli di lock-in AI descritti nel modulo?$q$,
  $q$Cognitivo (prompt e processi decisionali), dati (embedding e indici vettoriali), API/tooling (SDK proprietari) e infrastrutturale (modelli legati a un hyperscaler).$q$,
  array[$q$Lock-in cognitivo$q$, $q$Lock-in dati$q$, $q$Lock-in API/tooling$q$, $q$Lock-in infrastrutturale$q$],
  array[1,2,3,4]);

select trainer_seed_question('selezione-modello', 5, 'single',
  $q$Qual è l'investimento architetturale più importante da raccomandare contro il lock-in?$q$,
  $q$Il gateway/router LLM: astrae le API, permette routing e failover automatico, costa poco e protegge da tutto.$q$,
  array[$q$Un gateway/router LLM che astrae le API dei provider$q$,
        $q$Un contratto pluriennale con il provider scelto$q$,
        $q$Un modello open-source installato on-premise$q$,
        $q$Un secondo abbonamento consumer di riserva$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 6, 'single',
  $q$Come va presentata la matrice di selezione al cliente?$q$,
  $q$Prima si concordano criteri e pesi con il cliente, poi si mostrano i punteggi grezzi: chi partecipa alla pesatura non contesta la conclusione.$q$,
  array[$q$Prima criteri e pesi concordati col cliente, poi i punteggi del benchmark$q$,
        $q$Già compilata, mostrando subito il risultato finale$q$,
        $q$Solo il ranking finale, per non confondere il cliente$q$,
        $q$Soltanto dopo la firma del contratto$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 7, 'single',
  $q$Qual è la dimensione minima del campione per un test comparativo credibile?$q$,
  $q$30-50 documenti reali del cliente, con gold standard verificabile: un benchmark su esempi giocattolo non è difendibile.$q$,
  array[$q$30-50 documenti reali del cliente$q$,
        $q$3-5 esempi rappresentativi$q$,
        $q$Almeno 1.000 documenti$q$,
        $q$Un solo documento, purché complesso$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 8, 'multi',
  $q$Quali sono i tre principi che costituiscono il DNA del trainer apulia.ai?$q$,
  $q$Caso d'uso first, matrice difendibile, zero lock-in. Se anche uno solo manca, la consulenza è incompleta.$q$,
  array[$q$Caso d'uso first$q$, $q$Matrice difendibile$q$, $q$Zero lock-in$q$, $q$Modello flagship sempre$q$],
  array[1,2,3]);

-- ════════════════════════════════════════════════════════════
-- MODULO 5 — EU AI Act e conformità
-- ════════════════════════════════════════════════════════════
select trainer_seed_question('ai-act', 1, 'single',
  $q$Qual è il riferimento normativo dell'AI Act?$q$,
  $q$Regolamento (UE) 2024/1689, approvato a marzo 2024 e pubblicato in Gazzetta Ufficiale UE il 12 luglio 2024.$q$,
  array[$q$Regolamento (UE) 2024/1689$q$, $q$Direttiva (UE) 2023/970$q$,
        $q$Regolamento (UE) 2016/679$q$, $q$Raccomandazione UE 2021/402$q$],
  array[1]);

select trainer_seed_question('ai-act', 2, 'single',
  $q$Quali sono i quattro livelli della piramide di rischio dell'AI Act?$q$,
  $q$Inaccettabile (vietato), alto, limitato (obblighi di trasparenza), minimo (nessun obbligo specifico).$q$,
  array[$q$Inaccettabile, alto, limitato, minimo$q$,
        $q$Critico, elevato, medio, basso$q$,
        $q$Vietato, regolato, libero$q$,
        $q$Rosso, arancione, giallo, verde$q$],
  array[1]);

select trainer_seed_question('ai-act', 3, 'single',
  $q$Quale ruolo dell'AI Act ricopre tipicamente una PMI pugliese che usa uno strumento AI di terzi?$q$,
  $q$Deployer: usa un sistema AI sotto la propria autorità. Ma chi personalizza o ri-etichetta un sistema diventa automaticamente fornitore, con obblighi molto più gravosi.$q$,
  array[$q$Deployer$q$, $q$Fornitore$q$, $q$Importatore$q$, $q$Organismo notificato$q$],
  array[1]);

select trainer_seed_question('ai-act', 4, 'single',
  $q$Qual è la sanzione massima prevista per la violazione delle pratiche vietate (art. 5)?$q$,
  $q$Il maggiore tra 35 milioni di euro o il 7% del fatturato annuo mondiale, con proporzionalità obbligatoria per PMI e startup.$q$,
  array[$q$Il maggiore tra €35M o il 7% del fatturato mondiale$q$,
        $q$Il maggiore tra €15M o il 3% del fatturato mondiale$q$,
        $q$Il maggiore tra €7,5M o l'1% del fatturato mondiale$q$,
        $q$Una sanzione fissa di €20.000$q$],
  array[1]);

select trainer_seed_question('ai-act', 5, 'single',
  $q$Una PMI che espone un chatbot sul proprio sito in quale livello di rischio ricade e con quale obbligo?$q$,
  $q$Rischio limitato: obbligo di informare l'utente che sta interagendo con un sistema AI. Anche i contenuti generati per il pubblico vanno etichettati.$q$,
  array[$q$Rischio limitato, con obbligo di informare l'utente$q$,
        $q$Rischio alto, con marcatura CE$q$,
        $q$Rischio minimo, senza alcun obbligo$q$,
        $q$Rischio inaccettabile, quindi vietato$q$],
  array[1]);

select trainer_seed_question('ai-act', 6, 'multi',
  $q$Quali di queste pratiche rientrano tra quelle vietate dall'art. 5 dell'AI Act?$q$,
  $q$Social scoring pubblico, manipolazione subliminale e riconoscimento delle emozioni sul lavoro o a scuola sono vietati. Il credit scoring automatizzato non è vietato: è classificato ad alto rischio.$q$,
  array[$q$Social scoring da parte di autorità pubbliche$q$,
        $q$Manipolazione subliminale che causa danno significativo$q$,
        $q$Riconoscimento delle emozioni in ambito lavorativo o scolastico$q$,
        $q$Credit scoring automatizzato$q$],
  array[1,2,3]);

select trainer_seed_question('ai-act', 7, 'boolean',
  $q$La classificazione del rischio dipende dall'uso previsto del sistema: lo stesso strumento AI può essere a rischio minimo per un'azienda e ad alto rischio per un'altra.$q$,
  $q$Vero. La classificazione non è auto-dichiarata né statica: cambia con il contesto d'uso.$q$,
  array[$q$Vero$q$, $q$Falso$q$],
  array[1]);

select trainer_seed_question('ai-act', 8, 'multi',
  $q$Quali agevolazioni l'AI Act riserva a PMI e startup?$q$,
  $q$Documentazione tecnica semplificata, accesso prioritario alle sandbox regolamentari e proporzionalità delle sanzioni rispetto a dimensione e capacità economica. L'esenzione totale dagli obblighi non esiste.$q$,
  array[$q$Documentazione tecnica semplificata e proporzionata$q$,
        $q$Accesso prioritario alle sandbox regolamentari$q$,
        $q$Proporzionalità delle sanzioni alla dimensione dell'impresa$q$,
        $q$Esenzione totale dagli obblighi per i sistemi ad alto rischio$q$],
  array[1,2,3]);

-- ════════════════════════════════════════════════════════════
-- MODULO 6 — AI Agent per la qualificazione dei lead
-- ════════════════════════════════════════════════════════════
select trainer_seed_question('agent-marketing-lead', 1, 'single',
  $q$L'agente di qualificazione lead descritto nel modulo è un workflow o un agente autonomo, e perché?$q$,
  $q$È un workflow con routing e prompt chaining: il percorso è noto in anticipo e i sotto-task sono fissi. La prevedibilità è un vantaggio, non un limite.$q$,
  array[$q$Un workflow: percorso noto in anticipo e sotto-task fissi$q$,
        $q$Un agente autonomo: decide a runtime il proprio percorso$q$,
        $q$Un semplice prompt singolo senza tool$q$,
        $q$Un sistema multi-agente con orchestratore$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 2, 'single',
  $q$Come sono pesati i quattro criteri BANT nello scoring dell'agente?$q$,
  $q$Pesi uniformi: 25 punti ciascuno per Budget, Authority, Need e Timeline, per un totale di 100.$q$,
  array[$q$25 punti ciascuno, per un totale di 100$q$,
        $q$40 al Budget e 20 agli altri tre$q$,
        $q$50 all'Authority e 50 al Need$q$,
        $q$I pesi li assegna il commerciale caso per caso$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 3, 'single',
  $q$Quale priorità viene assegnata a un lead con score 78?$q$,
  $q$Priorità Alta: la fascia 70-100 comporta azione immediata e assegnazione a un commerciale senior.$q$,
  array[$q$Alta: azione immediata, assegnazione a un senior$q$,
        $q$Media: follow-up entro 24 ore$q$,
        $q$Bassa: nurturing automatico$q$,
        $q$Scartato: archiviazione$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 4, 'single',
  $q$Cosa deve fare l'agente quando la confidence della classificazione è inferiore a 0,7?$q$,
  $q$Alzare un flag di revisione umana con notifica al team e non procedere fino a conferma: meglio escalare troppo che agire con incertezza.$q$,
  array[$q$Flag di revisione umana e stop fino a conferma$q$,
        $q$Procedere comunque e annotare il dubbio$q$,
        $q$Classificare automaticamente come spam$q$,
        $q$Riprovare la classificazione all'infinito$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 5, 'single',
  $q$Qual è la sequenza corretta dei quattro step del workflow?$q$,
  $q$Routing, arricchimento, qualificazione, azione CRM. Ogni step è una singola chiamata focalizzata: la semplicità di ciascun anello rende robusto l'insieme.$q$,
  array[$q$Routing → arricchimento → qualificazione → azione CRM$q$,
        $q$Arricchimento → routing → azione CRM → qualificazione$q$,
        $q$Qualificazione → routing → arricchimento → azione CRM$q$,
        $q$Azione CRM → qualificazione → arricchimento → routing$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 6, 'single',
  $q$Qual è il costo medio per lead qualificato dell'agente, e il target da rispettare?$q$,
  $q$Circa €0,02 per lead, con target sotto €0,05. Un SDR umano part-time costa circa €24 per lead.$q$,
  array[$q$Circa €0,02 con target sotto €0,05$q$,
        $q$Circa €0,50 con target sotto €1$q$,
        $q$Circa €5 con target sotto €10$q$,
        $q$Circa €24, come un SDR part-time$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 7, 'single',
  $q$Quale soglia di concordanza tra agente e commerciale va raggiunta prima del go-live?$q$,
  $q$Almeno l'80% di concordanza sullo score, misurata su 30 lead reali durante la fase di dry run.$q$,
  array[$q$Almeno l'80%$q$, $q$Almeno il 50%$q$, $q$Il 100%$q$, $q$Nessuna soglia: si va live e si corregge$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 8, 'boolean',
  $q$Nel design dei guardrail vale il principio "meglio escalare troppo che agire con incertezza".$q$,
  $q$Vero. Il costo di un falso positivo (una revisione umana non necessaria) è molto inferiore a quello di un lead importante perso o di una risposta inappropriata.$q$,
  array[$q$Vero$q$, $q$Falso$q$],
  array[1]);

-- ════════════════════════════════════════════════════════════
-- MODULO 7 — ROI e selezione degli use case
-- ════════════════════════════════════════════════════════════
select trainer_seed_question('roi-use-case', 1, 'single',
  $q$Qual è l'orizzonte temporale corretto per valutare il ROI di un progetto AI in una PMI?$q$,
  $q$18-36 mesi. Il 60% del valore si genera dopo il primo anno: un progetto giudicato fallimentare a 12 mesi può valere +120.000 € a 36.$q$,
  array[$q$18-36 mesi$q$, $q$6 mesi$q$, $q$12 mesi$q$, $q$5 anni$q$],
  array[1]);

select trainer_seed_question('roi-use-case', 2, 'single',
  $q$Di quanto le PMI sottostimano mediamente il costo reale di un progetto AI?$q$,
  $q$Del 40%: considerano la licenza software ma ignorano tempo interno, integrazione, formazione, change management e manutenzione.$q$,
  array[$q$Del 40%$q$, $q$Del 5%$q$, $q$Del 15%$q$, $q$Non lo sottostimano: lo sovrastimano$q$],
  array[1]);

select trainer_seed_question('roi-use-case', 3, 'single',
  $q$Qual è la formula per rendere credibile un beneficio operativo?$q$,
  $q$Miglioramento × costo unitario × volume × tempo. Un beneficio non tradotto in questa formula resta un'opinione.$q$,
  array[$q$Miglioramento × costo unitario × volume × tempo$q$,
        $q$Costo della licenza ÷ numero di utenti$q$,
        $q$Fatturato annuo × percentuale di crescita attesa$q$,
        $q$Ore risparmiate ÷ ore lavorate$q$],
  array[1]);

select trainer_seed_question('roi-use-case', 4, 'single',
  $q$Quanta parte del budget AI può finire in data preparation quando i dati non sono pronti?$q$,
  $q$Fino al 60%. Solo il 20% dei dati aziendali è "AI-ready" senza intervento: la data readiness va valutata prima di investire.$q$,
  array[$q$Fino al 60%$q$, $q$Circa il 5%$q$, $q$Circa il 15%$q$, $q$Praticamente nulla, se si usa il cloud$q$],
  array[1]);

select trainer_seed_question('roi-use-case', 5, 'single',
  $q$Tra i quattro casi analizzati, quale ha il payback più rapido e il ROI più alto al secondo anno?$q$,
  $q$Il lead scoring vendite: payback in 5 mesi e ROI 606% al secondo anno, perché agisce direttamente sulla leva dei ricavi anziché solo sui costi.$q$,
  array[$q$Lead scoring vendite: payback 5 mesi, ROI 606%$q$,
        $q$Chatbot customer service: payback 8 mesi, ROI 333%$q$,
        $q$Automazione fatture: payback 9 mesi, ROI 313%$q$,
        $q$Manutenzione predittiva: payback 16 mesi, ROI 293%$q$],
  array[1]);

select trainer_seed_question('roi-use-case', 6, 'multi',
  $q$Quali di questi sono errori frequenti nel calcolo del ROI di un progetto AI?$q$,
  $q$Ignorare il change management, sovrastimare l'adozione, usare un orizzonte troppo breve e dimenticare i costi ricorrenti. Confrontare con il costo del "non fare niente" invece è una best practice.$q$,
  array[$q$Ignorare i costi di change management$q$,
        $q$Sovrastimare il tasso di adozione$q$,
        $q$Usare un orizzonte temporale troppo breve$q$,
        $q$Calcolare il costo del "non fare niente" proiettato a 36 mesi$q$],
  array[1,2,3]);

select trainer_seed_question('roi-use-case', 7, 'single',
  $q$A quale percentuale del benchmark di settore vanno stimati i benefici, secondo il principio di stima conservativa?$q$,
  $q$Al 70%, mai al 100%: meglio una sorpresa positiva che una negativa.$q$,
  array[$q$Al 70%$q$, $q$Al 100%$q$, $q$Al 120%$q$, $q$Al 30%$q$],
  array[1]);

select trainer_seed_question('roi-use-case', 8, 'boolean',
  $q$Anche i benefici intangibili vanno inclusi nel calcolo del ROI, purché associati a un proxy misurabile.$q$,
  $q$Vero. NPS, tempo di decisione, turnover, win rate: ogni miglioramento ha un proxy monetizzabile.$q$,
  array[$q$Vero$q$, $q$Falso$q$],
  array[1]);

-- ════════════════════════════════════════════════════════════
-- MODULO 8 — Change management e adozione dell'AI
-- ════════════════════════════════════════════════════════════
select trainer_seed_question('change-management', 1, 'single',
  $q$Nel 2026, quale quota di organizzazioni usa regolarmente l'AI e quale si qualifica come high performer?$q$,
  $q$L'88% usa regolarmente l'AI in almeno una funzione, ma solo il 6% è high performer con impatto finanziario significativo.$q$,
  array[$q$88% usa AI, 6% è high performer$q$,
        $q$50% usa AI, 25% è high performer$q$,
        $q$88% usa AI, 44% è high performer$q$,
        $q$37% usa AI, 6% è high performer$q$],
  array[1]);

select trainer_seed_question('change-management', 2, 'single',
  $q$Qual è la causa strutturale del divario tra adozione diffusa e impatto misurabile?$q$,
  $q$Il mancato ridisegno dei workflow: lo fa il 73% degli high performer contro il 25% di tutti gli altri. Senza ridisegno l'AI resta un passo in più nel processo esistente.$q$,
  array[$q$Il mancato ridisegno dei workflow (73% vs 25%)$q$,
        $q$La scarsa potenza dei modelli disponibili$q$,
        $q$Il costo eccessivo delle licenze$q$,
        $q$La mancanza di dati sufficienti$q$],
  array[1]);

select trainer_seed_question('change-management', 3, 'multi',
  $q$Quali sono le tre forme di resistenza al cambiamento descritte nel modulo?$q$,
  $q$Rifiuto attivo, compliance superficiale e sabotaggio passivo. La resistenza va letta come segnale, non come ostacolo irrazionale.$q$,
  array[$q$Rifiuto attivo: non uso degli strumenti$q$,
        $q$Compliance superficiale: uso minimo per rispettare la policy$q$,
        $q$Sabotaggio passivo: rallentamento deliberato$q$,
        $q$Adozione entusiasta non supervisionata$q$],
  array[1,2,3]);

select trainer_seed_question('change-management', 4, 'single',
  $q$Qual è il rapporto raccomandato per il champion network?$q$,
  $q$Un champion ogni 15-20 persone, attivo lungo tutto il percorso insieme a stakeholder mapping e feedback loop.$q$,
  array[$q$1 champion ogni 15-20 persone$q$, $q$1 champion ogni 100 persone$q$,
        $q$1 champion per ogni dipendente$q$, $q$1 champion per azienda$q$],
  array[1]);

select trainer_seed_question('change-management', 5, 'single',
  $q$Come si struttura il programma di upskilling a tre livelli?$q$,
  $q$Alfabetizzazione AI per tutta l'organizzazione, competenze applicate per circa il 30%, expertise avanzata per il 5-10%. Metodologia 70-20-10: learning by doing, peer coaching, formazione formale.$q$,
  array[$q$Livello 1 tutti, livello 2 circa il 30%, livello 3 il 5-10%$q$,
        $q$Livello 1 il 10%, livello 2 il 30%, livello 3 il 60%$q$,
        $q$Un unico corso uguale per tutta l'organizzazione$q$,
        $q$Solo i team tecnici vengono formati$q$],
  array[1]);

select trainer_seed_question('change-management', 6, 'single',
  $q$Che rapporto c'è tra riduzioni di organico temute dai dipendenti e riduzioni effettivamente realizzate?$q$,
  $q$Il 39% le teme contro il 14% che le ha registrate: la paura supera la realtà di quasi 3 a 1, ma ha effetti reali su engagement e disponibilità al cambiamento.$q$,
  array[$q$39% le teme, 14% le ha registrate: quasi 3 a 1$q$,
        $q$14% le teme, 39% le ha registrate$q$,
        $q$Timore e realtà coincidono$q$,
        $q$Nessuna organizzazione ha registrato riduzioni$q$],
  array[1]);

select trainer_seed_question('change-management', 7, 'multi',
  $q$Quali elementi compongono la governance AI proposta nel modulo?$q$,
  $q$Steering committee cross-funzionale con mandato del CEO, executive sponsor C-level con accountability personale, budget ring-fenced e mandato esplicito a ridisegnare processi e ruoli.$q$,
  array[$q$AI Steering Committee cross-funzionale$q$,
        $q$Executive sponsor C-level con accountability personale$q$,
        $q$Budget dedicato ring-fenced$q$,
        $q$Divieto di modificare i processi esistenti$q$],
  array[1,2,3]);

select trainer_seed_question('change-management', 8, 'boolean',
  $q$Il divario tra produttività individuale (80% dei dipendenti) e impatto enterprise (37% sull'EBIT) è un problema organizzativo, non tecnologico.$q$,
  $q$Vero. Il passaggio da produttività individuale a impatto d'impresa richiede trasformazione dei processi, non semplice distribuzione di tool.$q$,
  array[$q$Vero$q$, $q$Falso$q$],
  array[1]);

-- ════════════════════════════════════════════════════════════
-- ESAME FINALE — trasversale ai moduli
-- Parte chiusa corretta automaticamente (soglia 80%) + due domande
-- aperte e il video, valutati manualmente dal revisore.
-- ════════════════════════════════════════════════════════════
select trainer_seed_question('__exam__', 1, 'single',
  $q$Un titolare ti chiede di prevedere la domanda con un modello predittivo, ma l'azienda non ha lo storico vendite digitalizzato. Qual è la mossa corretta?$q$,
  $q$Prima si colma il gap infrastrutturale: la prima proposta spesso non è un algoritmo ma un repository dati condiviso.$q$,
  array[$q$Proporre prima un quick-win non-AI che centralizzi i dati$q$,
        $q$Accettare e costruire il modello sui dati disponibili$q$,
        $q$Rifiutare l'incarico e chiudere la relazione$q$,
        $q$Proporre direttamente il modello più accurato sul mercato$q$],
  array[1]);

select trainer_seed_question('__exam__', 2, 'single',
  $q$In quale fase del framework diagnostico si presenta la proposta AI al cliente?$q$,
  $q$Alla fase 5, dopo anagrafica, mappa dei processi, sistemi IT e organigramma decisionale.$q$,
  array[$q$Fase 5$q$, $q$Fase 1$q$, $q$Fase 2$q$, $q$Fase 3$q$],
  array[1]);

select trainer_seed_question('__exam__', 3, 'multi',
  $q$Quali affermazioni su un LLM sono corrette?$q$,
  $q$Predice il token successivo, non accede a dati in tempo reale ed è soggetto ad allucinazioni per costruzione. Non ragiona causalmente.$q$,
  array[$q$Predice il token successivo più probabile$q$,
        $q$Non accede a dati in tempo reale senza architetture esterne$q$,
        $q$Può generare informazioni false con piena confidenza$q$,
        $q$Ragiona causalmente sulle relazioni di causa-effetto$q$],
  array[1,2,3]);

select trainer_seed_question('__exam__', 4, 'single',
  $q$Un cliente vuole rendere interrogabili cinque anni di manuali e cataloghi senza cambiare gestionale. Quale soluzione proponi?$q$,
  $q$RAG: i documenti esistenti diventano conoscenza interrogabile, senza riaddestramento e con costi contenuti.$q$,
  array[$q$Un sistema RAG sui documenti esistenti$q$,
        $q$Il fine-tuning di un modello sui documenti aziendali$q$,
        $q$L'addestramento di un modello proprietario da zero$q$,
        $q$La migrazione a un nuovo gestionale con AI integrata$q$],
  array[1]);

select trainer_seed_question('__exam__', 5, 'single',
  $q$Nella matrice di selezione, quale criterio funziona da veto assoluto pur pesando solo il 5%?$q$,
  $q$La compliance: uno score 1 esclude il modello indipendentemente dal totale.$q$,
  array[$q$Compliance$q$, $q$Accuratezza$q$, $q$Latenza$q$, $q$Roadmap del provider$q$],
  array[1]);

select trainer_seed_question('__exam__', 6, 'single',
  $q$Una PMI usa un software AI di terzi per lo screening dei CV. Quale combinazione ruolo/rischio si applica?$q$,
  $q$Deployer di un sistema ad alto rischio (Allegato III, area occupazione): obblighi di supervisione umana, trasparenza verso i candidati e valutazione d'impatto.$q$,
  array[$q$Deployer, sistema ad alto rischio$q$,
        $q$Deployer, sistema a rischio minimo$q$,
        $q$Fornitore, sistema a rischio limitato$q$,
        $q$Nessun ruolo: l'AI Act non si applica agli utilizzatori$q$],
  array[1]);

select trainer_seed_question('__exam__', 7, 'multi',
  $q$Quali obblighi ricadono su una PMI deployer di un sistema ad alto rischio?$q$,
  $q$Usare il sistema secondo le istruzioni del fornitore, garantire supervisione competente, monitorare e segnalare malfunzionamenti, informare le persone soggette a decisione AI. La marcatura CE spetta al fornitore.$q$,
  array[$q$Usare il sistema secondo le istruzioni d'uso del fornitore$q$,
        $q$Garantire che chi supervisiona abbia competenza adeguata$q$,
        $q$Informare le persone fisiche soggette a decisione AI$q$,
        $q$Apporre la marcatura CE sul sistema$q$],
  array[1,2,3]);

select trainer_seed_question('__exam__', 8, 'single',
  $q$Un agente di qualificazione lead restituisce confidence 0,55 sulla classificazione. Cosa deve accadere?$q$,
  $q$Escalation a revisione umana con blocco del flusso: sotto 0,7 non si procede in automatico.$q$,
  array[$q$Flag di revisione umana, il flusso si ferma in attesa di conferma$q$,
        $q$Si procede: 0,55 è comunque superiore a 0,5$q$,
        $q$Il lead viene archiviato come spam$q$,
        $q$Si crea comunque il task CRM con priorità bassa$q$],
  array[1]);

select trainer_seed_question('__exam__', 9, 'single',
  $q$Su quale orizzonte va calcolato il ROI di un progetto AI in PMI, e con quale stima dei benefici?$q$,
  $q$18-36 mesi, stimando i benefici al 70% del benchmark di settore e includendo tutti i costi ricorrenti.$q$,
  array[$q$18-36 mesi, benefici stimati al 70% del benchmark$q$,
        $q$12 mesi, benefici stimati al 100% del benchmark$q$,
        $q$6 mesi, considerando solo il costo delle licenze$q$,
        $q$5 anni, ignorando la curva di adozione$q$],
  array[1]);

select trainer_seed_question('__exam__', 10, 'multi',
  $q$Quali costi vanno inclusi in un business case AI e sono tipicamente dimenticati dalle PMI?$q$,
  $q$Preparazione e pulizia dei dati, formazione e change management, manutenzione e re-training del modello. La licenza software è invece l'unica voce che tutti ricordano.$q$,
  array[$q$Preparazione e pulizia dei dati$q$,
        $q$Formazione del team e change management$q$,
        $q$Manutenzione e re-training periodico del modello$q$,
        $q$Licenza del software$q$],
  array[1,2,3]);

select trainer_seed_question('__exam__', 11, 'single',
  $q$Quale pratica distingue più nettamente gli high performer nell'adozione AI?$q$,
  $q$Il ridisegno end-to-end dei workflow: lo fa il 73% degli high performer contro il 25% degli altri.$q$,
  array[$q$Ridisegnano i workflow invece di inserire l'AI nei processi esistenti$q$,
        $q$Acquistano il modello più costoso disponibile$q$,
        $q$Affidano l'AI esclusivamente al reparto IT$q$,
        $q$Evitano di comunicare i progetti AI ai dipendenti$q$],
  array[1]);

select trainer_seed_question('__exam__', 12, 'boolean',
  $q$Il costo del "non fare niente" — stipendi e volumi che crescono comunque — va incluso nella baseline di confronto di un business case AI.$q$,
  $q$Vero. Confrontare con una baseline statica è uno dei cinque errori più frequenti nel calcolo del ROI.$q$,
  array[$q$Vero$q$, $q$Falso$q$],
  array[1]);

select trainer_seed_question('__exam__', 13, 'open',
  $q$Un titolare di 58 anni, azienda meccanica con 12 dipendenti, ti chiede: «Ma questa intelligenza artificiale quanto mi costa e quanto mi fa risparmiare?». Scrivi la tua risposta, come la diresti a voce, in massimo quattro minuti di parlato. Nessun acronimo, nessun termine tecnico.$q$,
  $q$Valutata dal revisore su: assenza di gergo, metafora concreta, cifre di costo e risparmio, proposta di un periodo di prova misurabile, gestione delle obiezioni tipiche.$q$,
  array[]::text[], array[]::integer[]);

select trainer_seed_question('__exam__', 14, 'open',
  $q$Descrivi un caso d'uso AI per una PMI pugliese di tua scelta: settore, processo target, baseline attuale, soluzione proposta, costi del primo anno, benefici annui a regime e payback stimato. Dichiara esplicitamente le assunzioni.$q$,
  $q$Valutata dal revisore su: coerenza tra settore e caso d'uso, baseline quantificata, checklist costi completa, benefici tradotti in euro con formula esplicita, orizzonte temporale corretto, assunzioni dichiarate.$q$,
  array[]::text[], array[]::integer[]);
