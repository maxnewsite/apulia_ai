import { describe, expect, it } from 'vitest'
import { can, pathAllowed, staffHome } from '../src/lib/staff-roles'

/**
 * Il confine fra coach e admin. È l'unica regola che tiene un valutatore
 * fuori dalle candidature e dagli iscritti alla newsletter: se cede qui,
 * cede nel proxy e in ogni API route, che la usano tutti.
 */

describe('can — coach', () => {
  it('valuta i trainer ammessi', () => {
    expect(can('coach', 'review_progress')).toBe(true)
    expect(can('coach', 'review_exams')).toBe(true)
    expect(can('coach', 'grant_attempts')).toBe(true)
    expect(can('coach', 'preview_quizzes')).toBe(true)
  })

  it('non decide chi entra e non cancella nulla', () => {
    expect(can('coach', 'review_applications')).toBe(false)
    expect(can('coach', 'delete_trainer_data')).toBe(false)
    expect(can('coach', 'subscribers')).toBe(false)
    expect(can('coach', 'manage_staff')).toBe(false)
  })
})

describe('can — admin', () => {
  it('può tutto', () => {
    const every = [
      'subscribers',
      'review_applications',
      'delete_trainer_data',
      'review_progress',
      'review_exams',
      'grant_attempts',
      'preview_quizzes',
      'manage_staff',
    ] as const
    for (const capability of every) expect(can('admin', capability)).toBe(true)
  })
})

describe('pathAllowed', () => {
  it('tiene il coach fuori dagli iscritti e dallo staff', () => {
    expect(pathAllowed('coach', '/admin')).toBe(false)
    expect(pathAllowed('coach', '/api/admin/subscribers')).toBe(false)
    expect(pathAllowed('coach', '/admin/staff')).toBe(false)
    expect(pathAllowed('coach', '/api/admin/staff')).toBe(false)
  })

  it('gli lascia la Trainer Academy e l’anteprima quiz', () => {
    expect(pathAllowed('coach', '/admin/trainer')).toBe(true)
    expect(pathAllowed('coach', '/admin/trainer/quiz')).toBe(true)
    expect(pathAllowed('coach', '/api/admin/trainers')).toBe(true)
    expect(pathAllowed('coach', '/api/admin/quiz-preview/abc')).toBe(true)
    expect(pathAllowed('coach', '/api/admin/me')).toBe(true)
  })

  it('esclude /admin esatto senza escludere le sue sottopagine', () => {
    // Un confronto per prefisso su '/admin' chiuderebbe anche /admin/trainer,
    // cioè tutto quello per cui il coach esiste.
    expect(pathAllowed('coach', '/admin')).toBe(false)
    expect(pathAllowed('coach', '/admin/trainer')).toBe(true)
  })

  it('non limita l’admin', () => {
    for (const path of ['/admin', '/admin/staff', '/api/admin/subscribers'])
      expect(pathAllowed('admin', path)).toBe(true)
  })
})

describe('staffHome', () => {
  it('manda ciascun ruolo dove ha effettivamente accesso', () => {
    expect(staffHome('admin')).toBe('/admin')
    expect(staffHome('coach')).toBe('/admin/trainer')
  })
})
