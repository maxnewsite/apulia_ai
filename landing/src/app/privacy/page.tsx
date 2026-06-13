import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    "Informativa sul trattamento dei dati personali ai sensi del GDPR per gli iscritti alla newsletter apulia.ai.",
  robots: {
    index: true,
    follow: false,
  },
  alternates: {
    canonical: 'https://apulia.ai/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0F172A]">
      <header className="border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link
            href="/"
            className="text-xl font-black text-[#0F172A] hover:text-[#2563EB] transition-colors"
          >
            apulia.ai
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-black text-[#0F172A] mb-3">
          Privacy Policy
        </h1>
        <p className="text-[#475569] mb-12 text-sm">
          Ultimo aggiornamento: maggio 2026
        </p>

        <div className="space-y-10 text-[#475569] leading-relaxed">
          <section aria-labelledby="privacy-titolare">
            <h2
              id="privacy-titolare"
              className="text-xl font-bold text-[#0F172A] mb-4"
            >
              1. Titolare del trattamento
            </h2>
            <p>
              Il titolare del trattamento dei dati personali è{' '}
              <strong className="text-[#0F172A]">apulia.ai</strong>, contattabile
              all&apos;indirizzo email{' '}
              <a
                href="mailto:privacy@apulia.ai"
                className="text-[#2563EB] hover:text-[#F59E0B] transition-colors underline"
              >
                privacy@apulia.ai
              </a>
              .
            </p>
          </section>

          <section aria-labelledby="privacy-dati">
            <h2
              id="privacy-dati"
              className="text-xl font-bold text-[#0F172A] mb-4"
            >
              2. Dati raccolti
            </h2>
            <p className="mb-3">
              In occasione dell&apos;iscrizione alla newsletter raccogliamo i
              seguenti dati personali:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[#0F172A]">Indirizzo email</strong>:
                necessario per l&apos;invio della newsletter.
              </li>
              <li>
                <strong className="text-[#0F172A]">
                  Preferenza linguistica
                </strong>
                : italiano o inglese, per personalizzare le comunicazioni.
              </li>
              <li>
                <strong className="text-[#0F172A]">
                  Tipo di iscrizione
                </strong>
                : newsletter gratuita settimanale (AI Europa Weekly), briefing
                premium mensile, o entrambi.
              </li>
              <li>
                <strong className="text-[#0F172A]">
                  Data e ora di iscrizione
                </strong>
                : per documentare il consenso.
              </li>
            </ul>
            <p className="mt-3">
              Non raccogliamo dati di navigazione, cookie di profilazione o
              informazioni di pagamento tramite questo sito.
            </p>
          </section>

          <section aria-labelledby="privacy-finalita">
            <h2
              id="privacy-finalita"
              className="text-xl font-bold text-[#0F172A] mb-4"
            >
              3. Finalità del trattamento
            </h2>
            <p className="mb-3">
              I dati personali sono trattati esclusivamente per le seguenti
              finalità:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Invio della newsletter{' '}
                <strong className="text-[#0F172A]">AI Europa Weekly</strong> ogni
                martedì mattina.
              </li>
              <li>
                Invio del{' '}
                <strong className="text-[#0F172A]">
                  Briefing Strategico Mensile
                </strong>{' '}
                ogni primo lunedì del mese, per gli iscritti premium.
              </li>
              <li>
                Gestione delle preferenze di iscrizione e disiscrizione.
              </li>
              <li>
                Adempimento degli obblighi di legge in materia di protezione dei
                dati personali.
              </li>
            </ul>
          </section>

          <section aria-labelledby="privacy-base-giuridica">
            <h2
              id="privacy-base-giuridica"
              className="text-xl font-bold text-[#0F172A] mb-4"
            >
              4. Base giuridica
            </h2>
            <p>
              La base giuridica del trattamento è il{' '}
              <strong className="text-[#0F172A]">
                consenso esplicito dell&apos;interessato
              </strong>{' '}
              ai sensi dell&apos;art. 6, par. 1, lett. a) del Regolamento (UE)
              2016/679 (GDPR), espresso al momento dell&apos;iscrizione tramite
              la spunta della casella &ldquo;Accetto la Privacy Policy&rdquo;. Il
              consenso è revocabile in qualsiasi momento senza pregiudizio per la
              liceità del trattamento svolto anteriormente alla revoca.
            </p>
          </section>

          <section aria-labelledby="privacy-conservazione">
            <h2
              id="privacy-conservazione"
              className="text-xl font-bold text-[#0F172A] mb-4"
            >
              5. Conservazione dei dati
            </h2>
            <p>
              I dati personali sono conservati per il tempo strettamente
              necessario al perseguimento delle finalità sopra indicate. In
              pratica, i dati vengono conservati{' '}
              <strong className="text-[#0F172A]">
                fino alla disiscrizione dalla newsletter
              </strong>
              . Successivamente alla disiscrizione, i dati vengono eliminati
              entro 30 giorni, salvo obblighi di conservazione previsti dalla
              legge.
            </p>
          </section>

          <section aria-labelledby="privacy-condivisione">
            <h2
              id="privacy-condivisione"
              className="text-xl font-bold text-[#0F172A] mb-4"
            >
              6. Condivisione con terze parti
            </h2>
            <p>
              I dati personali{' '}
              <strong className="text-[#0F172A]">
                non vengono venduti, ceduti o condivisi con terze parti
              </strong>{' '}
              per finalità commerciali o promozionali. I dati sono archiviati
              su{' '}
              <strong className="text-[#0F172A]">Supabase</strong>, un servizio
              di database con server localizzati nell&apos;Unione Europea,
              conforme al GDPR. Supabase agisce in qualità di responsabile del
              trattamento ai sensi dell&apos;art. 28 GDPR.
            </p>
          </section>

          <section aria-labelledby="privacy-hosting">
            <h2
              id="privacy-hosting"
              className="text-xl font-bold text-[#0F172A] mb-4"
            >
              7. Infrastruttura e trasferimenti internazionali
            </h2>
            <p>
              Il sito e i dati degli iscritti sono ospitati su infrastrutture con
              sede nell&apos;Unione Europea. Non vengono effettuati trasferimenti
              di dati verso paesi terzi al di fuori dello Spazio Economico
              Europeo (SEE) senza adeguate garanzie ai sensi degli artt. 44–49
              GDPR.
            </p>
          </section>

          <section aria-labelledby="privacy-diritti">
            <h2
              id="privacy-diritti"
              className="text-xl font-bold text-[#0F172A] mb-4"
            >
              8. Diritti dell&apos;interessato
            </h2>
            <p className="mb-3">
              In qualità di interessato, hai il diritto di:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[#0F172A]">Accesso</strong>: ottenere
                conferma del trattamento e copia dei dati personali che ti
                riguardano (art. 15 GDPR).
              </li>
              <li>
                <strong className="text-[#0F172A]">Rettifica</strong>: richiedere
                la correzione di dati inesatti o incompleti (art. 16 GDPR).
              </li>
              <li>
                <strong className="text-[#0F172A]">Cancellazione</strong>:
                richiedere la cancellazione dei tuoi dati personali (&ldquo;diritto
                all&apos;oblio&rdquo;, art. 17 GDPR).
              </li>
              <li>
                <strong className="text-[#0F172A]">Portabilità</strong>: ricevere
                i dati in un formato strutturato e leggibile da dispositivo
                automatico (art. 20 GDPR).
              </li>
              <li>
                <strong className="text-[#0F172A]">Opposizione</strong>: opporti
                al trattamento per motivi legittimi (art. 21 GDPR).
              </li>
              <li>
                <strong className="text-[#0F172A]">Revoca del consenso</strong>:
                revocare il consenso in qualsiasi momento, anche tramite
                disiscrizione dalla newsletter.
              </li>
              <li>
                <strong className="text-[#0F172A]">Reclamo</strong>: presentare
                reclamo all&apos;Autorità Garante per la Protezione dei Dati
                Personali (Garante Privacy, www.gpdp.it).
              </li>
            </ul>
            <p className="mt-4">
              Per esercitare i tuoi diritti, scrivi a{' '}
              <a
                href="mailto:privacy@apulia.ai"
                className="text-[#2563EB] hover:text-[#F59E0B] transition-colors underline"
              >
                privacy@apulia.ai
              </a>
              . Risponderemo entro 30 giorni dalla ricezione della richiesta.
            </p>
          </section>

          <section aria-labelledby="privacy-cookie">
            <h2
              id="privacy-cookie"
              className="text-xl font-bold text-[#0F172A] mb-4"
            >
              9. Cookie
            </h2>
            <p>
              Questo sito utilizza esclusivamente cookie tecnici necessari al
              corretto funzionamento delle pagine. Non vengono utilizzati cookie
              di profilazione o di tracciamento di terze parti. Non è richiesto
              il consenso per i soli cookie tecnici ai sensi del Provvedimento
              Garante Privacy n. 229/2014 e delle Linee guida del 2021.
            </p>
          </section>

          <section aria-labelledby="privacy-modifiche">
            <h2
              id="privacy-modifiche"
              className="text-xl font-bold text-[#0F172A] mb-4"
            >
              10. Modifiche alla presente informativa
            </h2>
            <p>
              apulia.ai si riserva il diritto di modificare la presente
              informativa in qualsiasi momento per adeguarla a variazioni normative
              o operative. In caso di modifiche sostanziali, gli iscritti saranno
              informati via email con congruo anticipo. La data dell&apos;ultima
              modifica è indicata in cima alla pagina.
            </p>
          </section>

          <section aria-labelledby="privacy-contatti">
            <h2
              id="privacy-contatti"
              className="text-xl font-bold text-[#0F172A] mb-4"
            >
              11. Contatti
            </h2>
            <p>
              Per qualsiasi domanda relativa al trattamento dei tuoi dati
              personali, contattaci a{' '}
              <a
                href="mailto:privacy@apulia.ai"
                className="text-[#2563EB] hover:text-[#F59E0B] transition-colors underline"
              >
                privacy@apulia.ai
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-[#E2E8F0] mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-[#475569] text-sm">
            &copy; 2026 apulia.ai — Tutti i diritti riservati.
          </span>
          <Link
            href="/"
            className="text-sm text-[#2563EB] hover:text-[#F59E0B] transition-colors"
          >
            Torna alla home
          </Link>
        </div>
      </footer>
    </div>
  )
}
