import { describe, expect, it } from 'vitest'
import {
  buildCurriculum,
  REQUIRED_MODULES,
  type AttemptRow,
  type QuizMeta,
  type TrainerModule,
} from '../src/lib/trainer'

/**
 * Regole di avanzamento: quale modulo si apre, quando i tentativi sono
 * esauriti, quando l'esame diventa accessibile.
 */

const mod = (position: number): TrainerModule => ({
  id: `m${position}`,
  position,
  slug: `modulo-${position}`,
  title: `Modulo ${position}`,
  summary: null,
})

const quiz = (moduleId: string): QuizMeta & { module_id: string | null } => ({
  id: `q-${moduleId}`,
  kind: 'module',
  module_id: moduleId,
  title: `Quiz ${moduleId}`,
  intro: null,
  pass_score: 80,
  max_attempts: 3,
  time_limit_minutes: 20,
  is_published: true,
})

const submitted = (quizId: string, score: number, passed: boolean): AttemptRow => ({
  quiz_id: quizId,
  status: 'submitted',
  score,
  passed,
})

/** N moduli pubblicati, ciascuno col proprio quiz. */
function scenario(count: number) {
  const modules = Array.from({ length: count }, (_, i) => mod(i + 1))
  return { modules, quizzes: modules.map(m => quiz(m.id)) }
}

describe('sblocco sequenziale', () => {
  it('apre il primo modulo e tiene chiusi i successivi', () => {
    const { modules, quizzes } = scenario(3)
    const c = buildCurriculum(modules, quizzes, [], [])

    expect(c.entries[0].unlocked).toBe(true)
    expect(c.entries[1].unlocked).toBe(false)
    expect(c.entries[2].unlocked).toBe(false)
  })

  it('apre il secondo solo dopo aver superato il primo', () => {
    const { modules, quizzes } = scenario(3)
    const c = buildCurriculum(modules, quizzes, [submitted('q-m1', 90, true)], [])

    expect(c.entries[1].unlocked).toBe(true)
    expect(c.entries[2].unlocked).toBe(false)
    expect(c.completedModules).toBe(1)
  })

  it('non apre il terzo se si supera il primo ma non il secondo', () => {
    const { modules, quizzes } = scenario(3)
    const c = buildCurriculum(
      modules,
      quizzes,
      [submitted('q-m1', 90, true), submitted('q-m2', 40, false)],
      [],
    )

    expect(c.entries[1].unlocked).toBe(true)
    expect(c.entries[2].unlocked).toBe(false)
  })

  it('un modulo superato resta superato anche dopo un tentativo peggiore', () => {
    const { modules, quizzes } = scenario(2)
    const c = buildCurriculum(
      modules,
      quizzes,
      [submitted('q-m1', 90, true), submitted('q-m1', 20, false)],
      [],
    )

    expect(c.entries[0].progress.passed).toBe(true)
    expect(c.entries[0].progress.best_score).toBe(90)
  })
})

describe('tentativi', () => {
  it('blocca il modulo quando i tentativi sono esauriti senza successo', () => {
    const { modules, quizzes } = scenario(1)
    const c = buildCurriculum(
      modules,
      quizzes,
      [
        submitted('q-m1', 30, false),
        submitted('q-m1', 50, false),
        submitted('q-m1', 70, false),
      ],
      [],
    )

    expect(c.entries[0].blocked).toBe(true)
    expect(c.entries[0].progress.attempts_used).toBe(3)
    expect(c.entries[0].progress.attempts_allowed).toBe(3)
  })

  it('uno sblocco del revisore rimette in gioco il candidato', () => {
    const { modules, quizzes } = scenario(1)
    const attempts = [
      submitted('q-m1', 30, false),
      submitted('q-m1', 50, false),
      submitted('q-m1', 70, false),
    ]
    const c = buildCurriculum(modules, quizzes, attempts, [{ quiz_id: 'q-m1', extra_attempts: 1 }])

    expect(c.entries[0].blocked).toBe(false)
    expect(c.entries[0].progress.attempts_allowed).toBe(4)
  })

  it('non conta come consumato un tentativo ancora aperto', () => {
    const { modules, quizzes } = scenario(1)
    const c = buildCurriculum(
      modules,
      quizzes,
      [{ quiz_id: 'q-m1', status: 'in_progress', score: null, passed: null }],
      [],
    )

    expect(c.entries[0].progress.attempts_used).toBe(0)
    expect(c.entries[0].blocked).toBe(false)
  })

  it('un modulo superato non risulta mai bloccato', () => {
    const { modules, quizzes } = scenario(1)
    const c = buildCurriculum(
      modules,
      quizzes,
      [submitted('q-m1', 30, false), submitted('q-m1', 50, false), submitted('q-m1', 95, true)],
      [],
    )

    expect(c.entries[0].blocked).toBe(false)
  })
})

describe('accesso all esame', () => {
  it('resta chiuso se non tutti i moduli sono pubblicati', () => {
    const { modules, quizzes } = scenario(REQUIRED_MODULES - 1)
    const attempts = quizzes.map(q => submitted(q.id, 100, true))
    const c = buildCurriculum(modules, quizzes, attempts, [])

    expect(c.examUnlocked).toBe(false)
    expect(c.examReason).toContain(String(REQUIRED_MODULES))
  })

  it('resta chiuso se manca anche un solo modulo da superare', () => {
    const { modules, quizzes } = scenario(REQUIRED_MODULES)
    const attempts = quizzes.slice(0, -1).map(q => submitted(q.id, 100, true))
    const c = buildCurriculum(modules, quizzes, attempts, [])

    expect(c.examUnlocked).toBe(false)
    expect(c.completedModules).toBe(REQUIRED_MODULES - 1)
  })

  it('si apre con tutti i moduli pubblicati e superati', () => {
    const { modules, quizzes } = scenario(REQUIRED_MODULES)
    const attempts = quizzes.map(q => submitted(q.id, 85, true))
    const c = buildCurriculum(modules, quizzes, attempts, [])

    expect(c.examUnlocked).toBe(true)
    expect(c.examReason).toBeNull()
  })

  it('non si apre quando non c e alcun modulo pubblicato', () => {
    const c = buildCurriculum([], [], [], [])

    expect(c.examUnlocked).toBe(false)
    expect(c.completedModules).toBe(0)
  })
})

describe('modulo senza quiz', () => {
  it('non e superabile e blocca la progressione', () => {
    const { modules } = scenario(2)
    const c = buildCurriculum(modules, [quiz('m2')], [], [])

    expect(c.entries[0].quiz).toBeNull()
    expect(c.entries[0].progress.passed).toBe(false)
    expect(c.entries[1].unlocked).toBe(false)
  })
})
