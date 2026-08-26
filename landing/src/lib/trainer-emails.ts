// Email transazionali dell'area trainer. Stessa impronta grafica delle email
// newsletter (src/lib/zepto.ts), testo solo in italiano.

import { appUrl } from '@/lib/zepto'

function shell(title: string, body: string, cta?: { label: string; url: string }): string {
  return `<div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #0a1628; line-height: 1.65;">
  <h2 style="color: #0F172A; margin: 0 0 16px;">${title}</h2>
  ${body}
  ${
    cta
      ? `<p style="margin: 28px 0;">
    <a href="${cta.url}" style="background: #2563EB; color: #fff; padding: 12px 22px; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block;">${cta.label}</a>
  </p>
  <p style="color: #64748b; font-size: 13px;">Se il pulsante non funziona, copia e incolla questo link:<br><a href="${cta.url}" style="color: #1e40af; word-break: break-all;">${cta.url}</a></p>`
      : ''
  }
  <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">apulia.ai — Trainer Academy</p>
</div>`
}

/**
 * Ricevuta della candidatura e, insieme, verifica dell'indirizzo: la
 * candidatura non viene approvata finché il link non è stato aperto.
 */
export function applicationReceivedEmail(fullName: string, confirmUrl: string) {
  return {
    subject: 'Conferma il tuo indirizzo — candidatura trainer apulia.ai',
    html: shell(
      `Ciao ${fullName}, abbiamo ricevuto la tua candidatura`,
      `<p>La tua richiesta di accesso alla piattaforma di e-learning per trainer <strong>apulia.ai</strong> è stata registrata insieme al CV che hai caricato.</p>
       <p>Manca un passaggio: confermare che questo indirizzo è davvero tuo. Finché non lo fai, la candidatura non può essere approvata.</p>`,
      { label: 'Conferma il mio indirizzo', url: confirmUrl },
    ),
  }
}

/** Reinvio del link di conferma, su richiesta del candidato. */
export function emailConfirmationEmail(fullName: string, confirmUrl: string) {
  return {
    subject: 'Conferma il tuo indirizzo — apulia.ai',
    html: shell(
      `Ciao ${fullName}`,
      `<p>Ecco un nuovo link per confermare il tuo indirizzo email e sbloccare la valutazione della tua candidatura.</p>`,
      { label: 'Conferma il mio indirizzo', url: confirmUrl },
    ),
  }
}

/**
 * Avviso al revisore: senza questa email una candidatura resta invisibile
 * finché qualcuno non apre la console di propria iniziativa.
 */
export function adminNewApplicationEmail(candidate: {
  full_name: string
  email: string
  city: string | null
  phone: string | null
  motivation: string
}) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:4px 12px 4px 0; color:#64748b; vertical-align:top;">${k}</td><td style="padding:4px 0;">${v}</td></tr>`

  return {
    subject: `Nuova candidatura trainer: ${candidate.full_name}`,
    html: shell(
      'Nuova candidatura da valutare',
      `<table style="font-size:15px; border-collapse:collapse; margin-bottom:20px;">
        ${row('Nome', candidate.full_name)}
        ${row('Email', candidate.email)}
        ${row('Città', candidate.city || '—')}
        ${row('Telefono', candidate.phone || '—')}
      </table>
      <p style="color:#64748b; margin-bottom:6px;"><strong>Motivazione</strong></p>
      <p style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">${candidate.motivation}</p>
      <p>Il CV è allegato alla candidatura: si apre dalla console con un link firmato.</p>`,
      { label: 'Apri la console', url: `${appUrl()}/admin/trainer` },
    ),
  }
}

/** Candidatura approvata: i moduli diventano accessibili. */
export function applicationApprovedEmail(fullName: string) {
  return {
    subject: 'La tua candidatura come trainer apulia.ai è stata approvata',
    html: shell(
      `Benvenuto nella Trainer Academy, ${fullName}`,
      `<p>La tua candidatura è stata approvata: da ora hai accesso ai moduli formativi del metodo apulia.ai.</p>
       <p>Il percorso è sequenziale: ogni modulo si conclude con un quiz che puoi sostenere al massimo <strong>3 volte</strong> e che si supera con almeno l’<strong>80%</strong>. Completati tutti i moduli si apre l'esame finale.</p>`,
      { label: 'Inizia il percorso', url: `${appUrl()}/trainer/dashboard` },
    ),
  }
}

/** Candidatura respinta, con la motivazione scritta dall'admin. */
export function applicationRejectedEmail(fullName: string, reason: string | null) {
  return {
    subject: 'Esito della tua candidatura come trainer apulia.ai',
    html: shell(
      `Ciao ${fullName}`,
      `<p>Abbiamo esaminato la tua candidatura alla Trainer Academy di apulia.ai e per ora non possiamo accoglierla.</p>
       ${reason ? `<p><strong>Nota del revisore:</strong> ${reason}</p>` : ''}
       <p>Se il tuo profilo cambia — nuove esperienze, certificazioni, progetti — puoi ricandidarti scrivendoci.</p>`,
    ),
  }
}

/** Consegna dell'esame finale ricevuta, in attesa di valutazione. */
export function examSubmittedEmail(fullName: string) {
  return {
    subject: 'Esame finale apulia.ai ricevuto',
    html: shell(
      `Consegna registrata, ${fullName}`,
      `<p>Abbiamo ricevuto il tuo esame finale: la parte a risposta chiusa è stata corretta automaticamente, mentre il video e i materiali allegati passano alla valutazione di un revisore.</p>
       <p>Ti scriveremo con l'esito appena la revisione sarà completata.</p>`,
      { label: 'Vedi lo stato', url: `${appUrl()}/trainer/esame` },
    ),
  }
}

/** Esito finale della qualifica. */
export function examResultEmail(fullName: string, qualified: boolean, notes: string | null) {
  if (qualified) {
    return {
      subject: 'Sei qualificato come trainer apulia.ai',
      html: shell(
        `Complimenti ${fullName}`,
        `<p>Hai superato l'esame finale: sei ufficialmente <strong>trainer qualificato del metodo apulia.ai</strong>.</p>
         ${notes ? `<p><strong>Nota del revisore:</strong> ${notes}</p>` : ''}
         <p>Ti contatteremo per i prossimi passi operativi.</p>`,
        { label: 'Vai alla tua area', url: `${appUrl()}/trainer/dashboard` },
      ),
    }
  }
  return {
    subject: 'Esito esame finale apulia.ai',
    html: shell(
      `Ciao ${fullName}`,
      `<p>L'esame finale non è stato superato.</p>
       ${notes ? `<p><strong>Nota del revisore:</strong> ${notes}</p>` : ''}
       <p>Scrivici se vuoi capire come rimetterti in gioco: possiamo riaprire l'esame caso per caso.</p>`,
    ),
  }
}
