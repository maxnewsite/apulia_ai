import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireCapability } from '@/lib/admin-session'
import { hashPassword, listStaff, passwordProblem } from '@/lib/staff'

export const runtime = 'nodejs'

// Il proxy tiene già i coach fuori da /api/admin/staff; `requireCapability`
// lo ripete qui perché un secondo punto d'ingresso non deve poter aggirare
// il primo per distrazione.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function GET() {
  const { denial } = await requireCapability('manage_staff')
  if (denial) return NextResponse.json({ error: denial.error }, { status: denial.status })

  return NextResponse.json({ staff: await listStaff() })
}

/** Crea un account di staff, oppure ne cambia stato/ruolo/password. */
export async function POST(request: NextRequest) {
  const { session, denial } = await requireCapability('manage_staff')
  if (denial) return NextResponse.json({ error: denial.error }, { status: denial.status })

  let body: {
    action?: string
    id?: string
    email?: string
    full_name?: string
    role?: string
    password?: string
    is_active?: boolean
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 })
  }

  const role = body.role === 'admin' ? 'admin' : 'coach'

  switch (body.action) {
    case 'create': {
      const email = (body.email ?? '').trim().toLowerCase()
      const password = body.password ?? ''

      if (!EMAIL_REGEX.test(email))
        return NextResponse.json({ error: 'Indirizzo email non valido.' }, { status: 422 })

      const problem = passwordProblem(password)
      if (problem) return NextResponse.json({ error: problem }, { status: 422 })

      const { error } = await supabaseAdmin.from('trainer_staff').insert({
        email,
        full_name: (body.full_name ?? '').trim() || null,
        role,
        password_hash: await hashPassword(password),
        created_by: session.email,
      })

      if (error) {
        // 23505 = violazione di unicità: l'indirizzo è già uno staff.
        if (error.code === '23505')
          return NextResponse.json(
            { error: 'Esiste già un account con questo indirizzo.' },
            { status: 409 },
          )
        console.error('creazione staff fallita:', error.message)
        return NextResponse.json({ error: 'Creazione non riuscita.' }, { status: 500 })
      }
      return NextResponse.json({ ok: true }, { status: 201 })
    }

    case 'set_active': {
      if (!body.id) return NextResponse.json({ error: 'Account non indicato.' }, { status: 422 })

      // Disattivare il proprio account chiude fuori chi sta operando, e se è
      // l'ultimo admin nessuno può più riattivarlo.
      const { data: target } = await supabaseAdmin
        .from('trainer_staff')
        .select('email')
        .eq('id', body.id)
        .maybeSingle()

      if (target?.email?.toLowerCase() === session.email.toLowerCase())
        return NextResponse.json(
          { error: 'Non puoi disattivare il tuo stesso account.' },
          { status: 409 },
        )

      const { error } = await supabaseAdmin
        .from('trainer_staff')
        .update({ is_active: body.is_active !== false })
        .eq('id', body.id)

      if (error) {
        console.error('aggiornamento staff fallito:', error.message)
        return NextResponse.json({ error: 'Aggiornamento non riuscito.' }, { status: 500 })
      }
      return NextResponse.json({ ok: true })
    }

    case 'set_password': {
      if (!body.id) return NextResponse.json({ error: 'Account non indicato.' }, { status: 422 })
      const problem = passwordProblem(body.password ?? '')
      if (problem) return NextResponse.json({ error: problem }, { status: 422 })

      const { error } = await supabaseAdmin
        .from('trainer_staff')
        .update({ password_hash: await hashPassword(body.password!) })
        .eq('id', body.id)

      if (error) {
        console.error('cambio password staff fallito:', error.message)
        return NextResponse.json({ error: 'Aggiornamento non riuscito.' }, { status: 500 })
      }
      return NextResponse.json({ ok: true })
    }

    default:
      return NextResponse.json({ error: 'Azione non riconosciuta.' }, { status: 400 })
  }
}
