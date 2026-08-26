-- apulia.ai — Trainer Academy: domande 11-20, moduli 5-8
-- Esegui DOPO seed_trainer_pool_11_20.sql. Stesse regole.

-- ════════ MODULO 5 — EU AI Act e conformità ════════
select trainer_seed_question('ai-act', 11, 'single',
  $q$Quale scadenza dell'AI Act riguarda i sistemi ad alto rischio dell'Allegato III?$q$,
  $q$Agosto 2026: è la scadenza chiave per le PMI, mentre i divieti sono attivi da febbraio 2025 e gli obblighi GPAI da agosto 2025.$q$,
  array[$q$Agosto 2026$q$, $q$Febbraio 2025$q$, $q$Agosto 2027$q$, $q$Luglio 2024$q$],
  array[1]);

select trainer_seed_question('ai-act', 12, 'single',
  $q$Una software house pugliese sviluppa un algoritmo di scoring creditizio e lo immette sul mercato con il proprio nome. Che ruolo assume?$q$,
  $q$Fornitore: deve garantire conformità tecnica, marcatura CE, documentazione e monitoraggio post-market.$q$,
  array[$q$Fornitore$q$, $q$Deployer$q$, $q$Importatore$q$, $q$Distributore$q$],
  array[1]);

select trainer_seed_question('ai-act', 13, 'single',
  $q$Quale quota dei sistemi AI usati dalle PMI ricade nel rischio minimo o limitato?$q$,
  $q$Circa il 95%. L'attenzione va concentrata sui sistemi che toccano decisioni rilevanti: lavoro, credito, salute.$q$,
  array[$q$Circa il 95%$q$, $q$Circa il 50%$q$, $q$Circa il 10%$q$, $q$Nessuno: sono tutti ad alto rischio$q$],
  array[1]);

select trainer_seed_question('ai-act', 14, 'multi',
  $q$Quali obblighi gravano su una PMI **fornitore** di un sistema ad alto rischio?$q$,
  $q$Risk assessment continuo lungo il ciclo di vita, documentazione della qualità e dei bias dei dataset, documentazione tecnica completa prima dell'immissione e log automatici per la tracciabilità. Usare il sistema secondo le istruzioni è invece un obbligo del deployer.$q$,
  array[$q$Processo continuo di risk assessment$q$,
        $q$Documentare qualità e bias dei dataset di addestramento$q$,
        $q$Documentazione tecnica completa prima dell'immissione sul mercato$q$,
        $q$Utilizzare il sistema secondo le istruzioni d'uso del fornitore$q$],
  array[1,2,3]);

select trainer_seed_question('ai-act', 15, 'single',
  $q$Quanto tempo e quale costo indicativo richiede la conformità per una PMI?$q$,
  $q$Mediamente 6-12 mesi di preparazione e tra 5.000 e 40.000 € per assessment iniziale e documentazione, variabili con la complessità.$q$,
  array[$q$6-12 mesi e 5.000-40.000 €$q$,
        $q$Una settimana e meno di 500 €$q$,
        $q$5 anni e oltre 1 milione di €$q$,
        $q$Nessun tempo e nessun costo: è automatica$q$],
  array[1]);

select trainer_seed_question('ai-act', 16, 'single',
  $q$Un contenuto deepfake diffuso da una PMI che obbligo comporta?$q$,
  $q$Va etichettato come generato artificialmente: è un obbligo di trasparenza del rischio limitato, con sanzioni che possono arrivare a 7,5 milioni.$q$,
  array[$q$Deve essere etichettato come generato artificialmente$q$,
        $q$È vietato in assoluto dall'articolo 5$q$,
        $q$Non comporta alcun obbligo$q$,
        $q$Richiede la marcatura CE$q$],
  array[1]);

select trainer_seed_question('ai-act', 17, 'single',
  $q$Perché la conformità all'AI Act viene presentata come vantaggio competitivo e non solo come costo?$q$,
  $q$Perché diventa requisito di accesso a gare pubbliche e criterio di selezione dei fornitori lungo la catena del valore delle multinazionali europee, come già accaduto con GDPR e ISO 27001.$q$,
  array[$q$Apre gare pubbliche e rende partner privilegiati nella supply chain$q$,
        $q$Riduce le imposte sul reddito d'impresa$q$,
        $q$Esonera dagli obblighi GDPR$q$,
        $q$Garantisce finanziamenti automatici$q$],
  array[1]);

select trainer_seed_question('ai-act', 18, 'multi',
  $q$Quali strumenti di finanziamento sono citati come accessibili alle PMI pugliesi?$q$,
  $q$PNRR per digitalizzazione e AI, voucher digitali dei fondi strutturali regionali e credito d'imposta Transizione 5.0. Un'esenzione contributiva per le imprese AI non esiste.$q$,
  array[$q$PNRR — fondi per digitalizzazione e AI$q$,
        $q$Voucher digitali dei Fondi Strutturali Puglia$q$,
        $q$Credito d'imposta Transizione 5.0$q$,
        $q$Esenzione contributiva per le imprese che adottano AI$q$],
  array[1,2,3]);

select trainer_seed_question('ai-act', 19, 'single',
  $q$Che cosa distingue un AI Agent da un chatbot?$q$,
  $q$Tool use, memoria, orchestrazione multi-task e capacità di agire nel mondo reale: percepisce l'ambiente, pianifica e decide per raggiungere un obiettivo.$q$,
  array[$q$Tool use, memoria, orchestrazione multi-task e azione nel mondo reale$q$,
        $q$Un modello linguistico più grande$q$,
        $q$Un'interfaccia grafica più curata$q$,
        $q$L'assenza di qualsiasi supervisione umana$q$],
  array[1]);

select trainer_seed_question('ai-act', 20, 'single',
  $q$Entro quanto va segnalato un incidente grave all'autorità, nel monitoraggio post-deployment?$q$,
  $q$Entro 72 ore, insieme al logging delle interazioni e al monitoraggio del drift.$q$,
  array[$q$Entro 72 ore$q$, $q$Entro 30 giorni$q$, $q$Entro un anno$q$, $q$Nessun obbligo di segnalazione$q$],
  array[1]);

-- ════════ MODULO 6 — AI Agent per la qualificazione dei lead ════════
select trainer_seed_question('agent-marketing-lead', 11, 'single',
  $q$Da quali tre canali arrivano i lead che l'agente unifica?$q$,
  $q$Form del sito, WhatsApp Business ed email: il layer di ingestion li normalizza in un unico oggetto strutturato.$q$,
  array[$q$Form sito, WhatsApp Business, email$q$,
        $q$Telefono, fax, posta ordinaria$q$,
        $q$Solo il form del sito web$q$,
        $q$LinkedIn, Instagram, TikTok$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 12, 'single',
  $q$Perché la normalizzazione dell'input è il fondamento dell'architettura?$q$,
  $q$Perché un input strutturato e prevedibile permette di usare un unico prompt indipendentemente dal canale di provenienza.$q$,
  array[$q$Permette un unico prompt indipendente dal canale$q$,
        $q$Riduce il costo di storage dei messaggi$q$,
        $q$Elimina la necessità del CRM$q$,
        $q$Consente di evitare del tutto il modello linguistico$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 13, 'single',
  $q$Quale modello è consigliato per lo step di routing, e perché?$q$,
  $q$Claude Haiku: la classificazione è un compito semplice e ad alto volume, dove contano velocità e costo.$q$,
  array[$q$Haiku, perché il routing chiede velocità ed economicità$q$,
        $q$Il modello più costoso, per massimizzare l'accuratezza$q$,
        $q$Un modello addestrato su misura$q$,
        $q$Nessun modello: basta una regola su parole chiave$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 14, 'multi',
  $q$Cosa contiene il task CRM creato dall'agente?$q$,
  $q$Titolo con priorità e azienda, owner assegnato per regole, scadenza derivata dalla priorità e note con lo scoring BANT dettagliato più le lacune di arricchimento. Non contiene il preventivo firmato: quello è lavoro del commerciale.$q$,
  array[$q$Priorità e owner assegnato automaticamente$q$,
        $q$Due date derivata dalla priorità$q$,
        $q$Note con score BANT dettagliato ed enrichment gaps$q$,
        $q$Il preventivo economico già firmato dal cliente$q$],
  array[1,2,3]);

select trainer_seed_question('agent-marketing-lead', 15, 'single',
  $q$Come cambia la bozza di risposta a seconda del canale di origine?$q$,
  $q$Su WhatsApp è breve e informale, entro i 300 caratteri; via email è professionale e strutturata; dal form parte una conferma con proposta di call.$q$,
  array[$q$WhatsApp breve e informale, email strutturata, form con proposta di call$q$,
        $q$È identica su tutti i canali per coerenza di marca$q$,
        $q$Cambia solo la firma in calce$q$,
        $q$Viene sempre scritta a mano dal commerciale$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 16, 'single',
  $q$Che cosa accade a un lead con score compreso tra 20 e 39?$q$,
  $q$Priorità bassa: entra in nurturing automatico. Sotto 20 viene archiviato, sopra 40 passa a follow-up entro 24 ore.$q$,
  array[$q$Priorità bassa: nurturing automatico$q$,
        $q$Priorità alta: assegnazione immediata a un senior$q$,
        $q$Viene scartato e archiviato$q$,
        $q$Viene inoltrato al team di supporto$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 17, 'single',
  $q$Come si struttura il go-live controllato dell'agente?$q$,
  $q$Si attiva su un solo canale — il form del sito — con revisione umana obbligatoria per 48 ore, poi si estende a WhatsApp ed email.$q$,
  array[$q$Un canale alla volta, partendo dal form, con revisione umana per 48 ore$q$,
        $q$Tutti e tre i canali insieme, per validare più in fretta$q$,
        $q$Solo in ambiente di test, senza mai andare in produzione$q$,
        $q$Direttamente su WhatsApp, il canale con più volume$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 18, 'single',
  $q$Qual è il costo indicativo dell'infrastruttura, esclusi i costi API?$q$,
  $q$Circa 10-30 € al mese: un VPS da 5 € con Redis sullo stesso server regge il volume tipico di una PMI, 20-50 lead al giorno.$q$,
  array[$q$10-30 €/mese: un VPS con Redis sullo stesso server$q$,
        $q$Circa 1.000 €/mese di infrastruttura cloud$q$,
        $q$Nulla: gira interamente sul portatile del commerciale$q$,
        $q$Circa 300 €/mese solo di coda messaggi$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 19, 'single',
  $q$Cosa succede ai messaggi che non riescono a essere elaborati dopo tre tentativi?$q$,
  $q$Finiscono in una dead-letter queue, con notifica via email o Slack ogni 15 minuti finché la coda non è vuota.$q$,
  array[$q$In una dead-letter queue, con alert periodico al team$q$,
        $q$Vengono cancellati silenziosamente$q$,
        $q$Vengono rielaborati all'infinito$q$,
        $q$Vengono inviati comunque al cliente così come sono$q$],
  array[1]);

select trainer_seed_question('agent-marketing-lead', 20, 'boolean',
  $q$L'obiettivo dell'agente è sostituire il commerciale, eliminando il costo del personale di vendita.$q$,
  $q$Falso. Il ROI non sta nella sostituzione ma nell'amplificazione: il commerciale viene liberato dalla composizione e dalla qualificazione manuale per concentrarsi su call, negoziazione e chiusura.$q$,
  array[$q$Vero$q$, $q$Falso$q$],
  array[2]);

-- ════════ MODULO 7 — ROI e selezione degli use case ════════
select trainer_seed_question('roi-use-case', 11, 'single',
  $q$Quale quota di progetti AI nelle PMI viene abbandonata entro 12 mesi, e per quale ragione?$q$,
  $q$Il 45%, per mancanza di risultati misurabili, con un budget medio sprecato tra 35.000 e 80.000 € per progetto fallito.$q$,
  array[$q$Il 45%, per mancanza di risultati misurabili$q$,
        $q$Il 5%, per problemi tecnici$q$,
        $q$Il 90%, per costi eccessivi$q$,
        $q$Nessuno: i progetti AI si concludono sempre$q$],
  array[1]);

select trainer_seed_question('roi-use-case', 12, 'single',
  $q$Su quale arco temporale va raccolta la baseline prima di stimare i benefici?$q$,
  $q$Almeno 4 settimane, meglio 4-8, calcolando medie e varianza dei KPI del processo target.$q$,
  array[$q$Almeno 4 settimane$q$, $q$Un solo giorno$q$, $q$Due anni$q$, $q$Nessuna: si usano i benchmark di settore$q$],
  array[1]);

select trainer_seed_question('roi-use-case', 13, 'multi',
  $q$Quali costi nascosti possono raddoppiare il budget di un progetto AI?$q$,
  $q$Qualità dei dati (10-30% del budget), debito tecnico di integrazione (15-25% di overhead ricorrente) e model drift (15-20% annuo del costo iniziale). Il costo della licenza non è nascosto: è l'unico che tutti considerano.$q$,
  array[$q$Pulizia e normalizzazione dei dati$q$,
        $q$Debito tecnico: integrazione con sistemi legacy e API obsolete$q$,
        $q$Model drift e re-training periodico$q$,
        $q$Il canone di licenza del software$q$],
  array[1,2,3]);

select trainer_seed_question('roi-use-case', 14, 'single',
  $q$Nel caso della manutenzione predittiva, perché il ROI del primo anno è negativo?$q$,
  $q$Perché l'investimento iniziale è alto — sensori, integrazione e calibrazione — e i benefici entrano a regime solo dall'ottavo mese; dal secondo anno il ROI arriva al 293%.$q$,
  array[$q$Investimento iniziale alto e benefici a regime solo dall'ottavo mese$q$,
        $q$Perché la tecnologia non funziona$q$,
        $q$Perché i costi ricorrenti superano sempre i benefici$q$,
        $q$Perché i fermi macchina aumentano nel primo anno$q$],
  array[1]);

select trainer_seed_question('roi-use-case', 15, 'single',
  $q$Quale proxy misurabile si usa per il beneficio intangibile «migliore esperienza cliente»?$q$,
  $q$Il Net Promoter Score: ogni punto vale circa 0,5-1% di retention, che si traduce in valore moltiplicando per il lifetime value.$q$,
  array[$q$Il Net Promoter Score$q$,
        $q$Il numero di dipendenti formati$q$,
        $q$Le ore di sviluppo impiegate$q$,
        $q$Nessuno: resta un beneficio non quantificabile$q$],
  array[1]);

select trainer_seed_question('roi-use-case', 16, 'single',
  $q$Nella sensitivity analysis, quali variabili si fanno oscillare e di quanto?$q$,
  $q$Tre variabili chiave — tasso di adozione, costo di manutenzione e tempo di implementazione — con oscillazione di ±20%, per ottenere gli scenari best, base e worst.$q$,
  array[$q$Adozione, manutenzione e tempo di implementazione, a ±20%$q$,
        $q$Solo il prezzo della licenza, a ±50%$q$,
        $q$Tutte le variabili del modello, a ±5%$q$,
        $q$Nessuna: si usa un solo scenario$q$],
  array[1]);

select trainer_seed_question('roi-use-case', 17, 'single',
  $q$Qual è la curva di adozione realistica in una PMI?$q$,
  $q$Circa 40% al terzo mese, 70% al sesto, 90% al dodicesimo: sovrastimarla è uno degli errori più frequenti.$q$,
  array[$q$40% al mese 3, 70% al mese 6, 90% al mese 12$q$,
        $q$100% dal primo giorno$q$,
        $q$10% dopo due anni$q$,
        $q$L'adozione non incide sui benefici$q$],
  array[1]);

select trainer_seed_question('roi-use-case', 18, 'multi',
  $q$Quali sono le tre domande da porsi prima di ogni investimento AI?$q$,
  $q$Siamo pronti (dati, persone, processi), quale use case per primo, il business case regge. Quale fornitore scegliere viene dopo, ed è oggetto di un altro modulo.$q$,
  array[$q$Siamo pronti? Dati, persone e processi$q$,
        $q$Quale use case affrontare per primo$q$,
        $q$Il business case regge negli scenari base e worst?$q$,
        $q$Quale fornitore ha il marchio più noto?$q$],
  array[1,2,3]);

select trainer_seed_question('roi-use-case', 19, 'single',
  $q$Quali sono i cinque punti della checklist di data readiness?$q$,
  $q$Disponibilità, completezza (soglia oltre l'80%), accuratezza, consistenza tra sistemi e volume (oltre 1.000 record per categoria).$q$,
  array[$q$Disponibilità, completezza, accuratezza, consistenza, volume$q$,
        $q$Costo, tempo, qualità, rischio, portata$q$,
        $q$Budget, personale, hardware, software, licenze$q$,
        $q$Velocità, varietà, veridicità, valore, volume$q$],
  array[1]);

select trainer_seed_question('roi-use-case', 20, 'single',
  $q$Chi va coinvolto dal primo giorno per dare credibilità al business case?$q$,
  $q$Il CFO: senza il presidio di chi governa i numeri, il business case resta un esercizio del reparto tecnico.$q$,
  array[$q$Il CFO$q$, $q$Il fornitore del software$q$, $q$Il consulente esterno$q$, $q$Nessuno, finché il progetto non è concluso$q$],
  array[1]);

-- ════════ MODULO 8 — Change management e adozione dell'AI ════════
select trainer_seed_question('change-management', 11, 'single',
  $q$Quale quota di organizzazioni ha raggiunto lo scaling enterprise dell'AI?$q$,
  $q$Il 44%, in crescita dal 38% dell'anno precedente, mentre l'88% la usa in almeno una funzione.$q$,
  array[$q$Il 44%$q$, $q$L'88%$q$, $q$Il 6%$q$, $q$Il 37%$q$],
  array[1]);

select trainer_seed_question('change-management', 12, 'single',
  $q$In quali funzioni si concentra la riduzione dei costi attribuibile all'AI?$q$,
  $q$Supply chain, service operations e manufacturing; la crescita dei ricavi si concentra invece in marketing & sales e product development.$q$,
  array[$q$Supply chain, service operations, manufacturing$q$,
        $q$Marketing, vendite e sviluppo prodotto$q$,
        $q$Risorse umane e amministrazione$q$,
        $q$In modo uniforme su tutte le funzioni$q$],
  array[1]);

select trainer_seed_question('change-management', 13, 'single',
  $q$Perché la resistenza va letta come segnale e non come ostacolo irrazionale?$q$,
  $q$Perché è la risposta logica di chi non vede un beneficio personale: il 47% di manager e contributor riporta effetti negativi contro il 31% degli executive, cioè chi usa l'AI ne subisce le conseguenze più di chi la promuove.$q$,
  array[$q$È la risposta logica di chi non vede beneficio personale nel cambiamento$q$,
        $q$Perché i dipendenti sono contrari a ogni tecnologia$q$,
        $q$Perché manca la formazione tecnica di base$q$,
        $q$Perché i sindacati si oppongono all'automazione$q$],
  array[1]);

select trainer_seed_question('change-management', 14, 'single',
  $q$Che cosa prevede la fase 2 della strategia di engagement, tra la quinta e l'ottava settimana?$q$,
  $q$Il coinvolgimento: co-design dei casi d'uso con gli utenti finali e mappatura degli stakeholder tra alleati, neutrali e resistenti.$q$,
  array[$q$Co-design dei casi d'uso con gli utenti finali e stakeholder mapping$q$,
        $q$Il riconoscimento pubblico dei champion$q$,
        $q$Le sessioni di ascolto iniziali$q$,
        $q$L'espansione progressiva sui risultati dimostrati$q$],
  array[1]);

select trainer_seed_question('change-management', 15, 'multi',
  $q$Come si manifesta il gap di competenze al livello base?$q$,
  $q$Incapacità di formulare prompt efficaci, mancata comprensione dei limiti dell'AI e over-reliance sui risultati senza verifica critica. La configurazione di agenti autonomi è invece un gap di livello avanzato.$q$,
  array[$q$Incapacità di formulare prompt efficaci$q$,
        $q$Mancata comprensione dei limiti dell'AI$q$,
        $q$Over-reliance sui risultati senza verifica critica$q$,
        $q$Incapacità di configurare agenti autonomi$q$],
  array[1,2,3]);

select trainer_seed_question('change-management', 16, 'single',
  $q$Perché i high performer risultano più vincolati dai costi operativi dell'AI?$q$,
  $q$Perché ne fanno un uso molto più intensivo: sono tre volte più esposti al vincolo di costo proprio in quanto la usano davvero su scala.$q$,
  array[$q$Perché ne fanno un uso molto più intensivo$q$,
        $q$Perché scelgono i fornitori più cari$q$,
        $q$Perché hanno budget ICT più piccoli$q$,
        $q$Perché non misurano il ritorno$q$],
  array[1]);

select trainer_seed_question('change-management', 17, 'single',
  $q$Quale KPI primario si associa alle service operations nel modello di misurazione?$q$,
  $q$Il costo per ticket, con il resolution time come indicatore secondario.$q$,
  array[$q$Costo per ticket$q$, $q$Revenue per customer$q$, $q$Time-to-market$q$, $q$OEE$q$],
  array[1]);

select trainer_seed_question('change-management', 18, 'multi',
  $q$Quali categorie di rischio AI vanno presidiate secondo il modulo?$q$,
  $q$Vulnerabilità tecniche, azioni non autorizzate di agenti oltre il mandato, bias ed equità, e trasparenza e spiegabilità. L'obsolescenza dell'hardware non rientra tra i rischi AI trattati.$q$,
  array[$q$Vulnerabilità tecniche e prompt injection$q$,
        $q$Azioni non autorizzate e agenti oltre il mandato$q$,
        $q$Bias e output discriminatori non rilevati$q$,
        $q$Obsolescenza dell'hardware aziendale$q$],
  array[1,2,3]);

select trainer_seed_question('change-management', 19, 'single',
  $q$Quali sono le cinque fasi del framework di change management per l'AI?$q$,
  $q$Assessment, visione e strategia, preparazione organizzativa, implementazione iterativa, consolidamento e scaling — progressive ma non lineari, su circa dodici mesi.$q$,
  array[$q$Assessment, visione, preparazione, implementazione, consolidamento$q$,
        $q$Analisi, acquisto, installazione, collaudo, chiusura$q$,
        $q$Pilota, scaling, ottimizzazione$q$,
        $q$Formazione, adozione, misurazione$q$],
  array[1]);

select trainer_seed_question('change-management', 20, 'single',
  $q$Che cosa deve produrre il terzo trimestre della roadmap a 12 mesi?$q$,
  $q$Il ROI dimostrato in almeno due funzioni, con scaling dei pilot validati e upskilling di livello 3 sui team tecnici.$q$,
  array[$q$ROI dimostrato in almeno due funzioni$q$,
        $q$L'AI Strategy Document approvato$q$,
        $q$I primi pilot live con metriche$q$,
        $q$L'impatto sull'EBIT e il piano per l'anno successivo$q$],
  array[1]);
