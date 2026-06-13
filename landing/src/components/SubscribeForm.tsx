'use client'

import { useState, useId } from 'react'
import { useLanguage } from '@/context/LanguageContext'

type ProductChoice = 'weekly' | 'monthly' | 'both'

interface FormState {
  email: string
  product: ProductChoice
  gdpr: boolean
}

interface FormErrors {
  email?: string
  gdpr?: string
  generic?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SubscribeForm() {
  const { t, language } = useLanguage()
  const f = t.form
  const emailId = useId()
  const productId = useId()
  const gdprId = useId()

  const [form, setForm] = useState<FormState>({ email: '', product: 'weekly', gdpr: false })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  function validate(): boolean {
    const next: FormErrors = {}
    if (!form.email || !EMAIL_REGEX.test(form.email.trim())) {
      next.email = f.errorEmail
    }
    if (!form.gdpr) {
      next.gdpr = f.errorGdpr
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return
    setStatus('submitting')
    setErrors({})

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          products: form.product,
          preferred_language: language,
        }),
      })

      const data = (await res.json()) as { success: boolean; message: string }

      if (res.ok && data.success) {
        setStatus('success')
        setForm({ email: '', product: 'weekly', gdpr: false })
      } else {
        setStatus('error')
        setErrors({ generic: data.message || f.errorGeneric })
      }
    } catch {
      setStatus('error')
      setErrors({ generic: f.errorGeneric })
    }
  }

  if (status === 'success') {
    return (
      <section
        id="subscribe"
        className="py-24 relative"
        aria-labelledby="subscribe-heading"
      >
        <div className="max-w-xl mx-auto px-4 text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2563EB]/15 border border-[#2563EB]/30 mb-6"
            aria-hidden="true"
          >
            <svg className="w-8 h-8 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] mb-3">{f.successTitle}</h2>
          <p className="text-[#475569] leading-relaxed">{f.successMessage}</p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="subscribe"
      className="py-24 relative overflow-hidden"
      aria-labelledby="subscribe-heading"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#2563EB] opacity-[0.06] blur-[100px]" />
      </div>

      <div className="relative max-w-xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h2
            id="subscribe-heading"
            className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-4 tracking-tight"
          >
            {f.sectionTitle}
          </h2>
          <p className="text-[#475569] text-lg">{f.sectionSubtitle}</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} noValidate aria-label="Newsletter subscription form">
            {/* Email field */}
            <div className="mb-5">
              <label
                htmlFor={emailId}
                className="block text-sm font-semibold text-[#0F172A] mb-2"
              >
                {f.emailLabel}
                <span className="text-[#2563EB] ml-0.5" aria-hidden="true">*</span>
              </label>
              <input
                id={emailId}
                type="email"
                name="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? `${emailId}-error` : undefined}
                placeholder={f.emailPlaceholder}
                value={form.email}
                onChange={(e) => {
                  setForm((p) => ({ ...p, email: e.target.value }))
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }))
                }}
                className={`w-full px-4 py-3 rounded-xl bg-[#FFFFFF] border text-[#0F172A] placeholder-[#475569]/50 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-1 focus-visible:ring-offset-[#F8FAFC] ${
                  errors.email
                    ? 'border-red-500/70 focus:border-red-500'
                    : 'border-[#E2E8F0] focus:border-[#2563EB]/60 hover:border-[#2563EB]/40'
                }`}
              />
              {errors.email && (
                <p
                  id={`${emailId}-error`}
                  role="alert"
                  className="mt-1.5 text-xs text-red-400 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Product selector */}
            <div className="mb-6">
              <label
                htmlFor={productId}
                className="block text-sm font-semibold text-[#0F172A] mb-2"
              >
                {f.productLabel}
              </label>
              <div className="grid grid-cols-1 gap-2.5" role="radiogroup" aria-label={f.productLabel}>
                {(
                  [
                    { value: 'weekly', label: f.products.weekly },
                    { value: 'monthly', label: f.products.monthly },
                    { value: 'both', label: f.products.both },
                  ] as { value: ProductChoice; label: string }[]
                ).map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 group ${
                      form.product === value
                        ? 'border-[#2563EB]/60 bg-[#2563EB]/10'
                        : 'border-[#E2E8F0] hover:border-[#2563EB]/30 hover:bg-[#2563EB]/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="product"
                      value={value}
                      checked={form.product === value}
                      onChange={() => setForm((p) => ({ ...p, product: value }))}
                      className="w-4 h-4 accent-[#2563EB] flex-shrink-0"
                      aria-label={label}
                    />
                    <span
                      className={`text-sm font-medium transition-colors ${
                        form.product === value ? 'text-[#0F172A]' : 'text-[#475569] group-hover:text-[#0F172A]'
                      }`}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* GDPR checkbox */}
            <div className="mb-6">
              <label
                htmlFor={gdprId}
                className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-colors ${
                  errors.gdpr
                    ? 'border-red-500/40 bg-red-500/5'
                    : 'border-[#E2E8F0] hover:border-[#2563EB]/30'
                }`}
              >
                <input
                  id={gdprId}
                  type="checkbox"
                  name="gdpr"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.gdpr}
                  aria-describedby={errors.gdpr ? `${gdprId}-error` : undefined}
                  checked={form.gdpr}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, gdpr: e.target.checked }))
                    if (errors.gdpr) setErrors((p) => ({ ...p, gdpr: undefined }))
                  }}
                  className="w-4 h-4 mt-0.5 accent-[#2563EB] flex-shrink-0"
                />
                <span className="text-xs text-[#475569] leading-relaxed">
                  {f.gdpr}
                  <a
                    href="/privacy"
                    className="text-[#2563EB] hover:text-[#60A5FA] underline underline-offset-2 transition-colors"
                  >
                    {f.gdprLink}
                  </a>
                  {f.gdprSuffix}
                </span>
              </label>
              {errors.gdpr && (
                <p
                  id={`${gdprId}-error`}
                  role="alert"
                  className="mt-1.5 text-xs text-red-400 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.gdpr}
                </p>
              )}
            </div>

            {/* Generic error */}
            {errors.generic && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-400 flex items-center gap-2"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.generic}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              aria-busy={status === 'submitting'}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#2563EB] text-white font-bold text-sm hover:bg-[#1D4ED8] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#2563EB]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]"
            >
              {status === 'submitting' ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20 10 10 0 008.66-5"
                    />
                  </svg>
                  {f.submitting}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {f.submit}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
