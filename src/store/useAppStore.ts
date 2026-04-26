import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { LineTest, Run, Draft } from '@/types'
import { loadTests, saveTests, loadDrafts, saveDrafts } from '@/lib/storage'
import { DEFAULT_TEMPLATE, makeEmptyConditions } from '@/lib/defaults'

interface AppState {
  tests: LineTest[]
  drafts: Record<string, Draft>

  createTest: (name: string, productName: string) => string
  updateTest: (testId: string, patch: Partial<Pick<LineTest, 'name' | 'productName' | 'status'>>) => void
  addRun: (testId: string) => number
  saveRun: (testId: string, runId: number, patch: Partial<Run>) => void
  saveDraft: (key: string, draft: Draft) => void
  clearDraft: (key: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  tests: loadTests(),
  drafts: loadDrafts(),

  createTest: (name, productName) => {
    const id = nanoid()
    const test: LineTest = {
      id,
      name,
      productName,
      status: 'active',
      runs: [],
      template: DEFAULT_TEMPLATE,
      createdAt: new Date().toISOString(),
    }
    const tests = [test, ...get().tests]
    saveTests(tests)
    set({ tests })
    return id
  },

  updateTest: (testId, patch) => {
    const tests = get().tests.map(t => t.id === testId ? { ...t, ...patch } : t)
    saveTests(tests)
    set({ tests })
  },

  addRun: (testId) => {
    const tests = get().tests
    const test = tests.find(t => t.id === testId)
    if (!test) return 0
    const prevRun = test.runs[test.runs.length - 1]
    const newRunId = test.runs.length > 0 ? Math.max(...test.runs.map(r => r.id)) + 1 : 1
    const newRun: Run = {
      id: newRunId,
      label: `Run ${newRunId}`,
      status: 'active',
      note: '',
      hasConditionChange: false,
      startTime: new Date().toISOString(),
      legs: prevRun?.legs ?? ['A'],
      conditions: prevRun
        ? JSON.parse(JSON.stringify(prevRun.conditions))
        : makeEmptyConditions(test.template.conditionItems, ['A']),
      properties: prevRun
        ? JSON.parse(JSON.stringify(prevRun.properties))
        : makeEmptyConditions(test.template.propertyItems, ['A']),
      photos: [],
      memo: '',
      tags: [],
    }
    // 이전 active run → done으로 전환
    const updatedRuns = test.runs.map(r =>
      r.status === 'active' ? { ...r, status: 'done' as const } : r
    )
    const updated = { ...test, runs: [...updatedRuns, newRun] }
    const newTests = tests.map(t => t.id === testId ? updated : t)
    saveTests(newTests)
    set({ tests: newTests })
    return newRunId
  },

  saveRun: (testId, runId, patch) => {
    const tests = get().tests.map(t => {
      if (t.id !== testId) return t
      const runs = t.runs.map(r => r.id === runId ? { ...r, ...patch } : r)
      return { ...t, runs }
    })
    saveTests(tests)
    set({ tests })
  },

  saveDraft: (key, draft) => {
    const drafts = { ...get().drafts, [key]: draft }
    saveDrafts(drafts)
    set({ drafts })
  },

  clearDraft: (key) => {
    const drafts = { ...get().drafts }
    delete drafts[key]
    saveDrafts(drafts)
    set({ drafts })
  },
}))
