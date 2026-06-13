import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { appUrl, confirmationEmailHtml, sendEmail } from '@/lib/zepto'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ProductChoice = 'weekly' | 'monthly' | 'both'

interface SubscribePayload {
  email: string
  products: ProductChoice
  preferred_language: 'it' | 'en'
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body.' },
      { status: 400 }
    )
  }

  const { email, products, preferred_language } = body as Partial<SubscribePayload>

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json(
      { success: false, message: 'Inserisci un indirizzo email valido.' },
      { status: 422 }
    )
  }

  const validProducts: ProductChoice[] = ['weekly', 'monthly', 'both']
  const selectedProducts = validProducts.includes(products as ProductChoice)
    ? products!
    : 'weekly'

  const lang: 'it' | 'en' = preferred_language === 'en' ? 'en' : 'it'

  const productsArray =
    selectedProducts === 'both' ? ['weekly', 'monthly'] : [selectedProducts]

  const cleanEmail = email.trim().toLowerCase()

  // Insert (or short-circuit if existing). We return the generated confirm_token
  // so we can send the confirmation email below.
  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .insert({
      email: cleanEmail,
      preferred_language: lang,
      products: productsArray,
      status: 'pending',
      source: 'landing',
    })
    .select('id,email,status,confirm_token')
    .single()

  let confirmToken: string | undefined
  let alreadyConfirmed = false

  if (error) {
    if (error.code === '23505') {
      // Unique violation — already subscribed. Look up existing record.
      const { data: existing } = await supabaseAdmin
        .from('subscribers')
        .select('status,confirm_token')
        .eq('email', cleanEmail)
        .single()

      if (existing?.status === 'active') {
        alreadyConfirmed = true
      } else if (existing?.confirm_token) {
        // Pending or unsubscribed: re-send the confirmation email.
        confirmToken = existing.confirm_token
        // Reset to 'pending' in case it was 'unsubscribed' and they're opting back in.
        await supabaseAdmin
          .from('subscribers')
          .update({
            status: 'pending',
            preferred_language: lang,
            products: productsArray,
            unsubscribed_at: null,
          })
          .eq('email', cleanEmail)
      }
    } else {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        {
          success: false,
          message:
            lang === 'it'
              ? "Errore durante l'iscrizione. Riprova tra qualche secondo."
              : 'Subscription error. Please try again in a few seconds.',
        },
        { status: 500 }
      )
    }
  } else {
    confirmToken = data?.confirm_token
  }

  if (alreadyConfirmed) {
    return NextResponse.json(
      {
        success: false,
        message:
          lang === 'it'
            ? 'Questa email è già iscritta e confermata.'
            : 'This email is already subscribed and confirmed.',
      },
      { status: 409 }
    )
  }

  if (!confirmToken) {
    console.error('No confirm_token resolved for subscriber:', cleanEmail)
    return NextResponse.json(
      {
        success: false,
        message:
          lang === 'it'
            ? 'Errore durante la generazione del token di conferma. Riprova.'
            : 'Could not generate confirmation token. Please try again.',
      },
      { status: 500 }
    )
  }

  const confirmUrl = `${appUrl()}/api/confirm?token=${confirmToken}`
  const { subject, html } = confirmationEmailHtml(lang, confirmUrl)

  const send = await sendEmail({
    to: cleanEmail,
    subject,
    html,
    fromEmail: process.env.ZEPTO_FROM_EMAIL_CONFIRM,
  })

  if (!send.ok) {
    console.error('Zepto send failed:', send.status, send.error)
    // Don't expose Zepto details to the user; subscription row exists, they can retry.
    return NextResponse.json(
      {
        success: false,
        message:
          lang === 'it'
            ? "Iscrizione registrata, ma non siamo riusciti a inviare l'email di conferma. Riproveremo a breve."
            : "You're registered, but we couldn't send the confirmation email yet. We'll retry shortly.",
      },
      { status: 502 }
    )
  }

  return NextResponse.json(
    {
      success: true,
      message:
        lang === 'it'
          ? 'Controlla la tua email per confermare l\'iscrizione.'
          : 'Check your email to confirm your subscription.',
    },
    { status: 201 }
  )
}
