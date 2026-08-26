'use client'

import { useEffect, useState } from 'react'

/**
 * Conto alla rovescia di un tentativo a tempo.
 *
 * È solo un'indicazione: la scadenza vera la decide il server confrontando
 * started_at con l'ora di consegna. Un orologio del client sfasato, o
 * manomesso, non allunga né accorcia il tempo reale.
 */
export default function QuizCountdown({
  startedAt,
  minutes,
  onExpired,
}: {
  startedAt: string
  minutes: number
  onExpired?: () => void
}) {
  const deadline = new Date(startedAt).getTime() + minutes * 60_000
  const [left, setLeft] = useState(() => deadline - Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = deadline - Date.now()
      setLeft(remaining)
      if (remaining <= 0) {
        clearInterval(timer)
        onExpired?.()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [deadline, onExpired])

  const expired = left <= 0
  const seconds = Math.max(0, Math.floor(left / 1000))
  const label = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const urgent = !expired && seconds < 120

  return (
    <div
      role="timer"
      aria-live={urgent ? 'polite' : 'off'}
      className={`sticky top-16 z-30 -mx-5 px-5 py-2.5 mb-6 border-b text-sm font-semibold flex items-center gap-2 ${
        expired
          ? 'bg-red-50 border-red-200 text-red-700'
          : urgent
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]'
      }`}
    >
      <span className="font-mono text-base">{expired ? '00:00' : label}</span>
      <span className="font-normal">
        {expired
          ? 'Tempo scaduto: consegna subito, il tentativo potrebbe essere annullato.'
          : 'tempo rimanente'}
      </span>
    </div>
  )
}
