import { describe, expect, it } from 'vitest'
import { gradeAttempt, type GradableQuestion } from '../src/lib/trainer'

/**
 * gradeAttempt decide chi supera un modulo e chi no. È una funzione pura,
 * quindi è testabile per intero senza database: è il codice che merita più
 * di ogni altro una rete di sicurezza.
 */

const single = (id: string, correct: string): GradableQuestion => ({
  id,
  kind: 'single',
  points: 1,
  correctOptionIds: [correct],
})

const multi = (id: string, correct: string[]): GradableQuestion => ({
  id,
  kind: 'multi',
  points: 1,
  correctOptionIds: correct,
})

const open = (id: string): GradableQuestion => ({
  id,
  kind: 'open',
  points: 5,
  correctOptionIds: [],
})

describe('gradeAttempt — punteggio', () => {
  it('dà 100 quando tutte le risposte chiuse sono corrette', () => {
    const result = gradeAttempt(
      [single('q1', 'a'), single('q2', 'b')],
      [
        { questionId: 'q1', selectedOptionIds: ['a'] },
        { questionId: 'q2', selectedOptionIds: ['b'] },
      ],
    )
    expect(result.score).toBe(100)
    expect(result.answers.every(a => a.is_correct)).toBe(true)
  })

  it('dà 0 quando non si risponde a nulla', () => {
    const result = gradeAttempt([single('q1', 'a')], [])
    expect(result.score).toBe(0)
    expect(result.answers[0].is_correct).toBe(false)
  })

  it('pesa le domande in proporzione ai punti', () => {
    const result = gradeAttempt(
      [
        { id: 'q1', kind: 'single', points: 3, correctOptionIds: ['a'] },
        { id: 'q2', kind: 'single', points: 1, correctOptionIds: ['b'] },
      ],
      [{ questionId: 'q1', selectedOptionIds: ['a'] }],
    )
    expect(result.score).toBe(75)
  })
})

describe('gradeAttempt — scelta multipla tutto-o-niente', () => {
  it('non premia una risposta parziale', () => {
    const result = gradeAttempt(
      [multi('q1', ['a', 'b', 'c'])],
      [{ questionId: 'q1', selectedOptionIds: ['a', 'b'] }],
    )
    expect(result.score).toBe(0)
    expect(result.answers[0].is_correct).toBe(false)
  })

  it('non premia una risposta che aggiunge opzioni sbagliate', () => {
    const result = gradeAttempt(
      [multi('q1', ['a', 'b'])],
      [{ questionId: 'q1', selectedOptionIds: ['a', 'b', 'z'] }],
    )
    expect(result.score).toBe(0)
  })

  it('accetta le opzioni giuste in qualunque ordine', () => {
    const result = gradeAttempt(
      [multi('q1', ['a', 'b', 'c'])],
      [{ questionId: 'q1', selectedOptionIds: ['c', 'a', 'b'] }],
    )
    expect(result.score).toBe(100)
  })

  it('ignora i duplicati inviati dal client', () => {
    const result = gradeAttempt(
      [multi('q1', ['a', 'b'])],
      [{ questionId: 'q1', selectedOptionIds: ['a', 'a', 'b'] }],
    )
    expect(result.score).toBe(100)
  })
})

describe('gradeAttempt — domande aperte', () => {
  it('le esclude dal punteggio, sia a numeratore sia a denominatore', () => {
    const result = gradeAttempt(
      [single('q1', 'a'), open('q2')],
      [
        { questionId: 'q1', selectedOptionIds: ['a'] },
        { questionId: 'q2', answerText: 'una risposta lunga' },
      ],
    )
    // La sola domanda chiusa è corretta: 100, nonostante l'aperta valga 5 punti.
    expect(result.score).toBe(100)
    expect(result.needsManualReview).toBe(true)
  })

  it('le marca come da valutare, non come sbagliate', () => {
    const result = gradeAttempt([open('q1')], [{ questionId: 'q1', answerText: 'testo' }])
    expect(result.answers[0].is_correct).toBeNull()
    expect(result.answers[0].points_awarded).toBe(0)
    expect(result.answers[0].answer_text).toBe('testo')
  })

  it('normalizza a null una risposta aperta vuota', () => {
    const result = gradeAttempt([open('q1')], [{ questionId: 'q1', answerText: '   ' }])
    expect(result.answers[0].answer_text).toBeNull()
  })

  it('non segnala revisione manuale se non ci sono domande aperte', () => {
    const result = gradeAttempt([single('q1', 'a')], [{ questionId: 'q1', selectedOptionIds: ['a'] }])
    expect(result.needsManualReview).toBe(false)
  })
})

describe('gradeAttempt — robustezza', () => {
  it('ignora risposte a domande che non fanno parte del tentativo', () => {
    const result = gradeAttempt(
      [single('q1', 'a')],
      [
        { questionId: 'q1', selectedOptionIds: ['a'] },
        { questionId: 'estranea', selectedOptionIds: ['x'] },
      ],
    )
    expect(result.answers).toHaveLength(1)
    expect(result.score).toBe(100)
  })

  it('non divide per zero con un quiz di sole domande aperte', () => {
    const result = gradeAttempt([open('q1')], [{ questionId: 'q1', answerText: 'testo' }])
    expect(result.score).toBe(0)
    expect(Number.isNaN(result.score)).toBe(false)
  })

  it('arrotonda a due decimali', () => {
    const result = gradeAttempt(
      [single('q1', 'a'), single('q2', 'a'), single('q3', 'a')],
      [{ questionId: 'q1', selectedOptionIds: ['a'] }],
    )
    expect(result.score).toBe(33.33)
  })

  it('non considera corretta una domanda chiusa senza selezione', () => {
    const result = gradeAttempt([single('q1', 'a')], [{ questionId: 'q1', selectedOptionIds: [] }])
    expect(result.answers[0].is_correct).toBe(false)
  })
})
