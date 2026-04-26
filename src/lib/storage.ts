import type { LineTest, Draft } from '@/types'

const TESTS_KEY = 'line_test_manager_tests'
const DRAFTS_KEY = 'line_test_manager_drafts'

export function loadTests(): LineTest[] {
  try {
    const raw = localStorage.getItem(TESTS_KEY)
    return raw ? (JSON.parse(raw) as LineTest[]) : []
  } catch {
    return []
  }
}

export function saveTests(tests: LineTest[]): void {
  try {
    localStorage.setItem(TESTS_KEY, JSON.stringify(tests))
  } catch (e) {
    console.error('[storage] saveTests failed:', e)
  }
}

export function loadDrafts(): Record<string, Draft> {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, Draft>) : {}
  } catch {
    return {}
  }
}

export function saveDrafts(drafts: Record<string, Draft>): void {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
  } catch (e) {
    console.error('[storage] saveDrafts failed:', e)
  }
}
