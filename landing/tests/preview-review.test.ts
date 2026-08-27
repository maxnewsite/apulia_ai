import { describe, expect, it } from 'vitest'
import { buildReview } from '../src/lib/trainer-preview'

/**
 * buildReview è ciò che il revisore legge dopo aver provato un quiz: se
 * associa la risposta esatta alla domanda sbagliata, l'anteprima diventa
 * peggio che inutile — convaliderebbe contenuti errati.
 */

type Row = Parameters<typeof buildReview>[0][number]

const row = (
  id: string,
  prompt: string,
  options: { id: string; label: string; is_correct: boolean }[],
  explanation: string | null = null,
): Row => ({
  id,
  kind: 'single',
  prompt,
  points: 1,
  explanation,
  trainer_question_options: options.map((o, i) => ({ ...o, position: i + 1 })),
})

const rows = [
  row('q1', 'Prima domanda', [
    { id: 'a', label: 'Giusta', is_correct: true },
    { id: 'b', label: 'Sbagliata', is_correct: false },
  ], 'Perché sì.'),
  row('q2', 'Seconda domanda', [
    { id: 'c', label: 'Anche giusta', is_correct: true },
    { id: 'd', label: 'No', is_correct: false },
  ]),
]

describe('buildReview', () => {
  it('riporta la risposta esatta e la spiegazione di ogni domanda', () => {
    const review = buildReview(rows, [
      { question_id: 'q1', selected_option_ids: ['a'], is_correct: true },
      { question_id: 'q2', selected_option_ids: ['d'], is_correct: false },
    ])

    expect(review).toHaveLength(2)
    expect(review[0]).toMatchObject({
      id: 'q1',
      correct_option_ids: ['a'],
      correct_labels: ['Giusta'],
      selected_option_ids: ['a'],
      is_correct: true,
      explanation: 'Perché sì.',
    })
    expect(review[1]).toMatchObject({
      id: 'q2',
      correct_labels: ['Anche giusta'],
      selected_option_ids: ['d'],
      is_correct: false,
      explanation: null,
    })
  })

  it('mantiene l’ordine delle domande, non quello della correzione', () => {
    const review = buildReview(rows, [
      { question_id: 'q2', selected_option_ids: ['c'], is_correct: true },
      { question_id: 'q1', selected_option_ids: ['b'], is_correct: false },
    ])

    expect(review.map(r => r.id)).toEqual(['q1', 'q2'])
    expect(review[0].is_correct).toBe(false)
    expect(review[1].is_correct).toBe(true)
  })

  it('segna come "da valutare" una domanda senza risposta corretta automatica', () => {
    const review = buildReview(rows, [
      { question_id: 'q1', selected_option_ids: [], is_correct: null },
    ])

    expect(review[0].is_correct).toBeNull()
    // q2 non è stata consegnata: resta senza selezione, non inventa un esito.
    expect(review[1]).toMatchObject({ selected_option_ids: [], is_correct: null })
  })
})
