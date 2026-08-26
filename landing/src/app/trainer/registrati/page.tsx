'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

const FIELD =
  'w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
const LABEL = 'block text-sm font-semibold mb-2'

/** Etichette leggibili per i messaggi di validazione. */
const FIELD_LABELS: Record<string, string> = {
  full_name: 'Nome e cognome',
  email: 'Email',
  password: 'Password',
  linkedin_url: 'Profilo LinkedIn',
  motivation: 'Perché vuoi diventare trainer',
  cv: 'Curriculum vitae',
  consent_privacy: 'Consenso privacy',
}

export default function TrainerSignupPage() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const form = event.currentTarget

    // Il form è `noValidate`: la validazione nativa mostrerebbe solo un
    // fumetto che sparisce da solo e passa inosservato se il campo è fuori
    // schermo — da fuori sembrerebbe che il pulsante non faccia nulla.
    // Qui il motivo viene scritto in chiaro e il campo riportato in vista.
    if (!form.checkValidity()) {
      const invalid = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(':invalid')
      if (invalid) {
        setError(`${FIELD_LABELS[invalid.name] ?? 'Un campo'}: ${invalid.validationMessage}`)
        invalid.scrollIntoView({ block: 'center', behavior: 'smooth' })
        invalid.focus({ preventScroll: true })
      }
      return
    }

    setBusy(true)
    const data = new FormData(form)
    data.set('consent_privacy', String(data.get('consent_privacy') === 'on'))

    // Un LinkedIn scritto senza schema è la norma, non un errore: lo
    // completiamo invece di rifiutare la candidatura.
    const linkedin = String(data.get('linkedin_url') ?? '').trim()
    if (linkedin && !/^https?:\/\//i.test(linkedin)) {
      data.set('linkedin_url', `https://${linkedin}`)
    }

    try {
      const res = await fetch('/api/trainer/registrazione', { method: 'POST', body: data })
      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(json.error ?? 'Registrazione non riuscita.')
        return
      }

      // L'account esiste: apriamo subito la sessione così il candidato
      // vede lo stato della propria candidatura senza un secondo login.
      const { error: signInError } = await supabaseBrowser().auth.signInWithPassword({
        email: String(data.get('email') ?? '').trim().toLowerCase(),
        password: String(data.get('password') ?? ''),
      })

      router.push(signInError ? '/trainer/login' : '/trainer/dashboard')
      router.refresh()
    } catch {
      setError('Errore di rete. Riprova.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-14">
      <h1 className="text-3xl font-black tracking-tight mb-3">Candidatura trainer</h1>
      <p className="text-[#475569] mb-10">
        Compila i tuoi dati e carica il CV. La richiesta viene verificata da un revisore prima
        di aprire l&apos;accesso ai moduli formativi.
      </p>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="full_name">Nome e cognome *</label>
            <input id="full_name" name="full_name" required className={FIELD} autoComplete="name" />
          </div>

          <div>
            <label className={LABEL} htmlFor="email">Email *</label>
            <input id="email" name="email" type="email" required className={FIELD} autoComplete="email" />
          </div>

          <div>
            <label className={LABEL} htmlFor="password">Password *</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={10}
              className={FIELD}
              autoComplete="new-password"
            />
            <p className="text-xs text-[#475569] mt-1.5">Almeno 10 caratteri.</p>
          </div>

          <div>
            <label className={LABEL} htmlFor="phone">Telefono</label>
            <input id="phone" name="phone" className={FIELD} autoComplete="tel" />
          </div>

          <div>
            <label className={LABEL} htmlFor="city">Città</label>
            <input id="city" name="city" className={FIELD} autoComplete="address-level2" />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="linkedin_url">Profilo LinkedIn</label>
            {/* type="text" e non "url": scrivere il profilo senza https:// è
                la norma, e lo schema lo aggiungiamo noi prima dell'invio. */}
            <input
              id="linkedin_url"
              name="linkedin_url"
              type="text"
              inputMode="url"
              className={FIELD}
              placeholder="linkedin.com/in/…"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="bio">Esperienza professionale</label>
            <textarea id="bio" name="bio" rows={4} className={FIELD} placeholder="Ruoli, settori, esperienza di formazione o consulenza." />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="motivation">Perché vuoi diventare trainer apulia.ai? *</label>
            <textarea id="motivation" name="motivation" rows={4} required minLength={40} className={FIELD} />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="cv">Curriculum vitae *</label>
            <input
              id="cv"
              name="cv"
              type="file"
              required
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F8FAFC] file:text-[#0F172A] file:border file:border-[#E2E8F0] hover:file:border-[#2563EB]"
            />
            <p className="text-xs text-[#475569] mt-1.5">PDF, DOC o DOCX, massimo 10 MB.</p>
          </div>
        </div>

        <label className="flex gap-3 items-start text-sm text-[#475569]">
          <input type="checkbox" name="consent_privacy" required className="mt-1 accent-[#2563EB]" />
          <span>
            Ho letto l&apos;
            <Link href="/privacy" className="text-[#2563EB] hover:underline">informativa privacy</Link>{' '}
            e acconsento al trattamento dei miei dati e del CV per la valutazione della candidatura. *
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={busy}
            className="bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
          >
            {busy ? 'Invio in corso…' : 'Invia candidatura'}
          </button>
          <Link href="/trainer/login" className="text-sm text-[#475569] hover:text-[#2563EB]">
            Ho già un account
          </Link>
        </div>
      </form>
    </div>
  )
}
