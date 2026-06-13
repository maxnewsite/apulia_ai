// Zepto Mail transactional sender (server-side only).
// Docs: https://www.zoho.com/zeptomail/help/api/email-sending.html

type ZeptoAddress = { address: string; name?: string }

export interface ZeptoSendInput {
  to: string
  subject: string
  html: string
  fromEmail?: string
  fromName?: string
}

export interface ZeptoSendResult {
  ok: boolean
  messageId?: string
  status: number
  error?: string
}

export async function sendEmail(input: ZeptoSendInput): Promise<ZeptoSendResult> {
  const token = process.env.ZEPTO_API_TOKEN?.trim()
  const host = (process.env.ZEPTO_API_HOST || 'api.zeptomail.com').trim()
  const fromEmail =
    input.fromEmail?.trim() ||
    process.env.ZEPTO_FROM_EMAIL_CONFIRM?.trim() ||
    'noreply@apulia.ai'
  const fromName =
    input.fromName?.trim() || process.env.ZEPTO_FROM_NAME?.trim() || 'apulia.ai'

  if (!token) {
    return { ok: false, status: 0, error: 'ZEPTO_API_TOKEN not set' }
  }

  const payload = {
    from: { address: fromEmail, name: fromName } satisfies ZeptoAddress,
    to: [{ email_address: { address: input.to, name: '' } }],
    subject: input.subject,
    htmlbody: input.html,
  }

  try {
    const res = await fetch(`https://${host}/v1.1/email`, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error:
          (body as { message?: string; error?: { message?: string } })?.error
            ?.message ||
          (body as { message?: string }).message ||
          `Zepto error ${res.status}`,
      }
    }

    const messageId =
      (body as { data?: Array<{ message_id?: string }> }).data?.[0]?.message_id ||
      (body as { request_id?: string }).request_id

    return { ok: true, status: res.status, messageId }
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

export function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'
  )
}

export function confirmationEmailHtml(
  lang: 'it' | 'en',
  confirmUrl: string,
): { subject: string; html: string } {
  if (lang === 'en') {
    return {
      subject: 'Confirm your subscription to apulia.ai',
      html: `<div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #0a1628; line-height: 1.65;">
  <h2 style="color: #0F172A; margin: 0 0 16px;">One last step</h2>
  <p>Thanks for subscribing to <strong>AI Europa Weekly</strong> — a free weekly newsletter on AI in Europe, in Italian.</p>
  <p>Please confirm your email address to start receiving issues:</p>
  <p style="margin: 28px 0;">
    <a href="${confirmUrl}" style="background: #2563EB; color: #fff; padding: 12px 22px; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block;">Confirm subscription</a>
  </p>
  <p style="color: #64748b; font-size: 13px;">If the button doesn't work, copy and paste this link:<br><a href="${confirmUrl}" style="color: #1e40af; word-break: break-all;">${confirmUrl}</a></p>
  <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">If you didn't subscribe, you can safely ignore this email.</p>
</div>`,
    }
  }
  return {
    subject: 'Conferma la tua iscrizione ad apulia.ai',
    html: `<div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #0a1628; line-height: 1.65;">
  <h2 style="color: #0F172A; margin: 0 0 16px;">Un ultimo passaggio</h2>
  <p>Grazie per esserti iscritto a <strong>AI Europa Weekly</strong> — la newsletter settimanale gratuita sull'intelligenza artificiale in Europa, in italiano.</p>
  <p>Conferma il tuo indirizzo email per iniziare a ricevere le edizioni:</p>
  <p style="margin: 28px 0;">
    <a href="${confirmUrl}" style="background: #2563EB; color: #fff; padding: 12px 22px; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block;">Conferma iscrizione</a>
  </p>
  <p style="color: #64748b; font-size: 13px;">Se il pulsante non funziona, copia e incolla questo link:<br><a href="${confirmUrl}" style="color: #1e40af; word-break: break-all;">${confirmUrl}</a></p>
  <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">Se non hai richiesto questa iscrizione, puoi ignorare questa email.</p>
</div>`,
  }
}
