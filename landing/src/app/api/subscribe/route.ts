import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ProductChoice = 'weekly' | 'monthly' | 'both'

interface SubscribePayload {
  email: string
  products: ProductChoice
  preferred_language: 'it' | 'en'
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(url, key)
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

  const lang = preferred_language === 'en' ? 'en' : 'it'

  let productsArray: string[]
  if (selectedProducts === 'both') {
    productsArray = ['weekly', 'monthly']
  } else {
    productsArray = [selectedProducts]
  }

  let supabase: ReturnType<typeof getSupabase>
  try {
    supabase = getSupabase()
  } catch {
    console.error('Supabase configuration error')
    return NextResponse.json(
      {
        success: false,
        message: 'Errore di configurazione del server. Riprova più tardi.',
      },
      { status: 500 }
    )
  }

  const { error } = await supabase.from('subscribers').insert({
    email: email.trim().toLowerCase(),
    preferred_language: lang,
    products: productsArray,
    status: 'pending',
    source: 'landing',
  })

  if (error) {
    // Unique violation — already subscribed
    if (error.code === '23505') {
      return NextResponse.json(
        {
          success: false,
          message:
            lang === 'it'
              ? 'Questa email è già iscritta. Controlla la tua inbox.'
              : 'This email is already subscribed. Check your inbox.',
        },
        { status: 409 }
      )
    }

    console.error('Supabase insert error:', error)
    return NextResponse.json(
      {
        success: false,
        message:
          lang === 'it'
            ? 'Errore durante l\'iscrizione. Riprova tra qualche secondo.'
            : 'Subscription error. Please try again in a few seconds.',
      },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      success: true,
      message:
        lang === 'it'
          ? "Controlla la tua email per confermare l'iscrizione"
          : 'Check your email to confirm your subscription',
    },
    { status: 201 }
  )
}
