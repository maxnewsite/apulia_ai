-- apulia.ai — Trainer Academy: domande 11-20, il pool oltre il quiz
-- Esegui DOPO seed_trainer_quizzes_9_10.sql e schema_trainer_pool.sql.
--
-- Porta ogni modulo a 20 domande. Il quiz ne estrae 10, quindi ogni
-- tentativo è una prova diversa e due candidati non ricevono lo stesso
-- compito. Senza questo file l'estrazione è di 10 su 10 e non randomizza
-- nulla: è il pool a dare senso al meccanismo.
--
-- Stesso helper, stessa regola: una posizione già occupata non viene
-- sovrascritta.

-- ════════ MODULO 1 — Le PMI pugliesi e l'AI ════════
select trainer_seed_question('pmi-pugliesi-ai', 11, 'single',
  $q$Che cosa contraddistingue la maturità digitale del settore moda-calzaturiero pugliese?$q$,
  $q$Micro-laboratori da 5 a 20 addetti nei distretti della Murgia e del Nord barese, con l'IT quasi del tutto assente.$q$,
  array[$q$Micro-laboratori 5-20 addetti con IT quasi assente$q$,
        $q$Aziende oltre i 100 addetti con ERP integrato$q$,
        $q$Forte automazione e tracciabilità digitale della filiera$q$,
        $q$Presenza diffusa di CAD/CAM e gestionale integrato$q$],
  array[1]);

select trainer_seed_question('pmi-pugliesi-ai', 12, 'single',
  $q$Quanto pesa mediamente la spesa ICT sul fatturato delle PMI, e cosa comporta?$q$,
  $q$Il 2,7%, insufficiente per progetti AI strutturati: è una delle barriere che spinge a partire da interventi piccoli e a ritorno rapido.$q$,
  array[$q$2,7%, insufficiente per progetti AI strutturati$q$,
        $q$10%, in linea con le grandi imprese$q$,
        $q$0,1%, praticamente nulla$q$,
        $q$25%, il principale centro di costo$q$],
  array[1]);

select trainer_seed_question('pmi-pugliesi-ai', 13, 'boolean',
  $q$Nella PMI pugliese tipo esiste quasi sempre un interlocutore tecnico interno con cui il trainer può parlare di architetture.$q$,
  $q$Falso. Non esiste un reparto IT: il ruolo è assorbito dal titolare o dal commercialista esterno, e il trainer parla direttamente a chi decide con logica imprenditoriale, non tecnologica.$q$,
  array[$q$Vero$q$, $q$Falso$q$],
  array[2]);

select trainer_seed_question('pmi-pugliesi-ai', 14, 'single',
  $q$Nella fase 2 del framework diagnostico, chi è l'interlocutore chiave?$q$,
  $q$Gli operativi sul campo: la mappa dei processi AS-IS si costruisce con chi i processi li esegue, non con chi li racconta dall'alto.$q$,
  array[$q$Gli operativi sul campo$q$,
        $q$Il titolare$q$,
        $q$Il tecnico IT esterno$q$,
        $q$Il commercialista$q$],
  array[1]);

select trainer_seed_question('pmi-pugliesi-ai', 15, 'multi',
  $q$Quali informazioni raccoglie la sezione «Mappa sistemi IT» della Scheda Cliente?$q$,
  $q$Inventario software, natura dei flussi dati, stato di backup e sicurezza, e il fornitore IT esterno con frequenza e contratto. Le criticità operative stanno invece nella sezione 5.$q$,
  array[$q$Inventario software: gestionale, office, cloud, mobile$q$,
        $q$Flussi dati: integrati, manuali o assenti$q$,
        $q$Backup e sicurezza: presenti, parziali o assenti$q$,
        $q$Le tre principali criticità operative$q$],
  array[1,2,3]);

select trainer_seed_question('pmi-pugliesi-ai', 16, 'single',
  $q$Nel flowchart decisionale, cosa si fa se il ROI a 6 mesi non regge?$q$,
  $q$Si propone un quick-win non-AI: si porta comunque valore e si costruisce la relazione, invece di forzare un progetto che non si ripaga.$q$,
  array[$q$Si propone un quick-win non-AI$q$,
        $q$Si presenta comunque la proposta AI$q$,
        $q$Si chiude la relazione con il cliente$q$,
        $q$Si aumenta il prezzo per giustificare il progetto$q$],
  array[1]);

select trainer_seed_question('pmi-pugliesi-ai', 17, 'single',
  $q$Nel settore turismo, chi è tipicamente l'influencer principale della decisione?$q$,
  $q$Il figlio o la figlia che gestisce il booking online: nativo digitale, entusiasta, senza potere di spesa ma alleato prezioso del trainer.$q$,
  array[$q$Il figlio o la figlia che gestisce il booking online$q$,
        $q$Il capo-stabilimento$q$,
        $q$L'agente commerciale$q$,
        $q$Il modellista senior$q$],
  array[1]);

select trainer_seed_question('pmi-pugliesi-ai', 18, 'single',
  $q$Quale osservazione sintetizza il profilo dell'economia pugliese rispetto alla media nazionale?$q$,
  $q$Più piccola, più frammentata e più concentrata nei servizi: l'economia è trainata da servizi e turismo più che dal manifatturiero.$q$,
  array[$q$Più piccola, più frammentata, più concentrata nei servizi$q$,
        $q$Più grande e più industrializzata della media$q$,
        $q$Equivalente alla media nazionale in ogni parametro$q$,
        $q$Dominata da grandi imprese manifatturiere$q$],
  array[1]);

select trainer_seed_question('pmi-pugliesi-ai', 19, 'single',
  $q$Qual è la consegna dell'esercitazione sui tre dossier aziendali?$q$,
  $q$Tre schede complete più una presentazione di 10 minuti per caso, con al massimo due opportunità AI raccomandate per ciascuno.$q$,
  array[$q$Tre schede complete e 10 minuti di presentazione per caso, max 2 opportunità AI$q$,
        $q$Un prototipo funzionante per ciascuna azienda$q$,
        $q$Un preventivo economico dettagliato per caso$q$,
        $q$Una sola scheda, a scelta tra i tre casi$q$],
  array[1]);

select trainer_seed_question('pmi-pugliesi-ai', 20, 'boolean',
  $q$La mappa del potere decisionale va ricalibrata ogni volta che cambia settore: non esiste un modello universale.$q$,
  $q$Vero. Il decisore economico è quasi sempre il titolare, ma influencer e bloccanti cambiano radicalmente tra agroalimentare, meccanica, moda, turismo, logistica e servizi.$q$,
  array[$q$Vero$q$, $q$Falso$q$],
  array[1]);

-- ════════ MODULO 2 — Fondamenti AI e arte della traduzione ════════
select trainer_seed_question('fondamenti-ai', 11, 'single',
  $q$Che cos'è un embedding?$q$,
  $q$La rappresentazione vettoriale del significato di un testo: frasi simili hanno vettori vicini, il che permette di cercare per significato e non per parola esatta.$q$,
  array[$q$La rappresentazione vettoriale del significato di un testo$q$,
        $q$La quantità massima di testo che il modello considera$q$,
        $q$L'unità minima di costo di una richiesta$q$,
        $q$Il processo di riaddestramento del modello$q$],
  array[1]);

select trainer_seed_question('fondamenti-ai', 12, 'single',
  $q$Nel RAG, in quante parti viene tipicamente spezzato un documento e quanti frammenti vengono recuperati per rispondere?$q$,
  $q$Chunk da circa 500 parole in fase di indicizzazione, e i 3-5 più simili alla domanda vengono passati al modello come contesto.$q$,
  array[$q$Chunk da ~500 parole, se ne recuperano i 3-5 più pertinenti$q$,
        $q$Chunk da una parola, se ne recuperano centinaia$q$,
        $q$Un solo chunk per l'intero documento$q$,
        $q$Chunk da 50.000 parole, se ne recupera uno$q$],
  array[1]);

select trainer_seed_question('fondamenti-ai', 13, 'multi',
  $q$In quali contesti le allucinazioni sono classificate come pericolose?$q$,
  $q$Consulenza legale o fiscale senza verifica, dati finanziari presentati come certi, informazioni su salute e sicurezza. Il brainstorming, con output sempre validato, è invece a rischio gestibile.$q$,
  array[$q$Consulenza legale o fiscale senza verifica$q$,
        $q$Dati finanziari presentati come certi al cliente$q$,
        $q$Informazioni su salute o sicurezza$q$,
        $q$Brainstorming e generazione di idee$q$],
  array[1,2,3]);

select trainer_seed_question('fondamenti-ai', 14, 'single',
  $q$Che cosa comporta la strategia di routing tra modelli descritta nel modulo?$q$,
  $q$Indirizzare circa il 70% del traffico su modelli mid-tier e il 30% sui flagship, con un risparmio del 41-55%.$q$,
  array[$q$70% mid-tier e 30% flagship, con risparmio del 41-55%$q$,
        $q$Tutto sul modello più potente disponibile$q$,
        $q$Tutto sul modello più economico disponibile$q$,
        $q$Alternare i provider ogni mese$q$],
  array[1]);

select trainer_seed_question('fondamenti-ai', 15, 'single',
  $q$A quante parole italiane corrisponde all'incirca un milione di token?$q$,
  $q$Circa 750.000 parole, ossia intorno alle 1.500 pagine A4.$q$,
  array[$q$Circa 750.000 parole, ~1.500 pagine A4$q$,
        $q$Circa 1.000.000 di parole esatte$q$,
        $q$Circa 10.000 parole$q$,
        $q$Circa 100 milioni di parole$q$],
  array[1]);

select trainer_seed_question('fondamenti-ai', 16, 'single',
  $q$Parlando con il capo-produzione, su cosa deve concentrarsi il trainer?$q$,
  $q$Su processo, efficienza, zero interruzioni alla linea e riduzione delle rilavorazioni: la metafora è «il manuale tecnico che ti risponde», senza termini come RAG, query o chunk.$q$,
  array[$q$Processo, zero interruzioni alla linea, meno rilavorazioni$q$,
        $q$Architettura del sistema e scelta del modello$q$,
        $q$Costo per token e pricing dei provider$q$,
        $q$Ritorno sull'investimento a 90 giorni$q$],
  array[1]);

select trainer_seed_question('fondamenti-ai', 17, 'single',
  $q$Quale caso d'uso ha il costo mensile più basso tra quelli presentati?$q$,
  $q$Il chatbot di assistenza clienti su GPT-4o mini: circa 15-20 € al mese per ~2M token, con un risparmio di 10-15 ore mensili di lavoro umano.$q$,
  array[$q$Chatbot assistenza clienti: 15-20 €/mese$q$,
        $q$Automazione email commerciali: 50-60 €/mese$q$,
        $q$Analisi documenti contabili: 80-120 €/mese$q$,
        $q$Generazione contenuti marketing: 300-400 €/mese$q$],
  array[1]);

select trainer_seed_question('fondamenti-ai', 18, 'multi',
  $q$Che cosa caratterizza il «piano 1», il consolidamento tecnico del trainer?$q$,
  $q$È interno e invisibile al cliente: sapere perché il RAG funziona, conoscerne limiti e failure mode, distinguere un'allucinazione da un errore di prompt. Quantificare in euro e ore appartiene invece al piano della traduzione.$q$,
  array[$q$Sapere perché il RAG funziona: architettura, limiti, failure mode$q$,
        $q$Conoscere i costi reali e le alternative$q$,
        $q$Distinguere l'allucinazione dall'errore di prompt$q$,
        $q$Quantificare il beneficio in euro e ore per il cliente$q$],
  array[1,2,3]);

select trainer_seed_question('fondamenti-ai', 19, 'single',
  $q$Con quale obiezione tipica si confronta il trainer sul tema dei dati, e come si risponde?$q$,
  $q$«I miei dati dove vanno?» — la risposta è che restano nel server del cliente o in un cloud scelto insieme, e nessuno vi accede.$q$,
  array[$q$«I miei dati dove vanno?» → restano nel suo server o in un cloud scelto insieme$q$,
        $q$«Quanti parametri ha il modello?» → si illustra l'architettura$q$,
        $q$«Che linguaggio di programmazione usate?» → si spiega lo stack$q$,
        $q$«Posso vedere il codice sorgente?» → si condivide il repository$q$],
  array[1]);

select trainer_seed_question('fondamenti-ai', 20, 'single',
  $q$Che cosa prevede la terza settimana del percorso «Prossimi passi»?$q$,
  $q$Il primo intervento: un incontro pilota con una PMI reale del territorio, osservato da un trainer senior, seguito da debrief e affinamento dello stile personale.$q$,
  array[$q$Incontro pilota con una PMI reale, osservato da un trainer senior$q$,
        $q$Studio autonomo dei materiali tecnici$q$,
        $q$Role-play con i tre interlocutori tipo$q$,
        $q$Operatività autonoma con supporto remoto$q$],
  array[1]);

-- ════════ MODULO 3 — Selezione del modello e strategia di adozione ════════
select trainer_seed_question('selezione-modello', 11, 'single',
  $q$Qual è il criterio di uscita della fase 2, «definizione dei requisiti misurabili»?$q$,
  $q$Soglie go/no-go documentate e approvate: senza di quelle il confronto tra provider non ha un metro.$q$,
  array[$q$Soglie go/no-go documentate e approvate$q$,
        $q$Almeno due provider conformi ai requisiti$q$,
        $q$Un caso d'uso validato con KPI definiti$q$,
        $q$Il report di benchmark completato$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 12, 'single',
  $q$Per quale profilo di PMI OpenAI è indicato come scelta ideale?$q$,
  $q$Un'azienda già su Microsoft 365 che cerca automazione rapida di attività quotidiane con il minimo sforzo formativo.$q$,
  array[$q$PMI già su Microsoft 365 che vuole automazione rapida con poca formazione$q$,
        $q$Studio professionale con analisi documentale complessa e compliance rigorosa$q$,
        $q$Micro-impresa già su Google Workspace con budget minimo$q$,
        $q$Azienda che necessita esclusivamente di generazione immagini$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 13, 'single',
  $q$Quale limite di Anthropic va comunicato al cliente?$q$,
  $q$Meno strumenti multimodali — niente voce nativa né generazione di immagini — e un ecosistema di integrazioni meno maturo rispetto a OpenAI e Google.$q$,
  array[$q$Meno strumenti multimodali e integrazioni meno mature$q$,
        $q$Assenza di conformità al GDPR$q$,
        $q$Finestra di contesto tra le più piccole sul mercato$q$,
        $q$Scarsa aderenza alle istruzioni$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 14, 'single',
  $q$Perché il task scelto per il benchmark sono 50 DDT scansionati?$q$,
  $q$Perché combina OCR, NLP e strutturazione dei dati, risponde a un bisogno reale e ricorrente, e ha un gold standard verificabile che rende il confronto oggettivo.$q$,
  array[$q$Combina OCR, NLP e strutturazione, con gold standard verificabile$q$,
        $q$Perché è il task più semplice da eseguire$q$,
        $q$Perché tutti i provider lo usano come demo ufficiale$q$,
        $q$Perché non richiede dati reali del cliente$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 15, 'multi',
  $q$Quali condizioni vanno mantenute identiche perché il benchmark sia equo?$q$,
  $q$Stesso set di documenti, stesso prompt, stesso schema di output e stesso ambiente di esecuzione. Usare il modello preferito dal cliente su un campione diverso invaliderebbe il confronto.$q$,
  array[$q$Lo stesso set di documenti per tutti i modelli$q$,
        $q$Lo stesso prompt di estrazione$q$,
        $q$Lo stesso schema JSON di output$q$,
        $q$Un campione più ampio per il modello preferito dal cliente$q$],
  array[1,2,3]);

select trainer_seed_question('selezione-modello', 16, 'single',
  $q$In quale scenario operativo la latenza diventa un fattore discriminante?$q$,
  $q$Nei processi interattivi con un operatore che aspetta: per un batch notturno da 500 documenti otto secondi per documento sono irrilevanti.$q$,
  array[$q$Nei processi interattivi, dove un operatore attende la risposta$q$,
        $q$Nei batch notturni su grandi volumi$q$,
        $q$Sempre, indipendentemente dal workflow$q$,
        $q$Mai: la latenza non incide sulle scelte$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 17, 'single',
  $q$Cosa significa uno score 3 nella scala della matrice di selezione?$q$,
  $q$Sufficiente: soddisfa il minimo accettabile. Il 2 è insufficiente ma recuperabile con workaround, l'1 è inadeguato e comporta rischio operativo.$q$,
  array[$q$Sufficiente: soddisfa il minimo accettabile$q$,
        $q$Eccellente: nessun compromesso$q$,
        $q$Inadeguato: rischio operativo$q$,
        $q$Buono: margine minimo di miglioramento$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 18, 'single',
  $q$Ogni quanto va aggiornata la matrice di selezione, e perché?$q$,
  $q$Ogni sei mesi: i modelli e i prezzi evolvono rapidamente e una matrice vecchia difende una scelta che non è più la migliore.$q$,
  array[$q$Ogni 6 mesi, perché i modelli evolvono rapidamente$q$,
        $q$Una volta sola, alla firma del contratto$q$,
        $q$Ogni 5 anni$q$,
        $q$Solo se il cliente lo richiede esplicitamente$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 19, 'single',
  $q$Che cosa dimostra l'episodio del 12 giugno 2026 citato nel modulo?$q$,
  $q$Che il lock-in non è un rischio teorico: quando alcuni modelli sono finiti offline per una direttiva export-control, chi aveva un'architettura multi-provider ha commutato in pochi minuti, gli altri sono rimasti fermi.$q$,
  array[$q$Che il lock-in è già realtà: chi era multi-provider ha commutato in minuti$q$,
        $q$Che i modelli open-source sono sempre preferibili$q$,
        $q$Che la compliance europea è irrilevante$q$,
        $q$Che conviene affidarsi a un unico fornitore per semplicità$q$],
  array[1]);

select trainer_seed_question('selezione-modello', 20, 'single',
  $q$Che cosa succede se una sola verifica della checklist di sostituibilità è rossa al go-live?$q$,
  $q$Si sta consegnando un progetto vulnerabile: meglio ritardare che esporre il cliente.$q$,
  array[$q$Si sta consegnando un progetto vulnerabile: meglio ritardare$q$,
        $q$Si procede: una sola voce rossa è tollerabile$q$,
        $q$Si annulla definitivamente il progetto$q$,
        $q$Si trasferisce la responsabilità al fornitore$q$],
  array[1]);
