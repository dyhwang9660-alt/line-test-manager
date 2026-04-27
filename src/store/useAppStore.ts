import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { LineTest, Run, Draft, Folder } from '@/types'
import { loadTests, saveTests, loadDrafts, saveDrafts, loadFolders, saveFolders } from '@/lib/storage'
import { DEFAULT_TEMPLATE, makeEmptyConditions } from '@/lib/defaults'

interface AppState {
  tests: LineTest[]
  drafts: Record<string, Draft>
  folders: Folder[]

  createTest: (name: string, productName: string, folderId?: string) => string
  updateTest: (testId: string, patch: Partial<Pick<LineTest, 'name' | 'productName' | 'status' | 'folderId'>>) => void
  addRun: (testId: string) => number
  saveRun: (testId: string, runId: number, patch: Partial<Run>) => void
  saveDraft: (key: string, draft: Draft) => void
  clearDraft: (key: string) => void

  createFolder: (name: string) => string
  renameFolder: (folderId: string, name: string) => void
  deleteFolder: (folderId: string) => void
  moveTestToFolder: (testId: string, folderId: string | null) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  tests: loadTests(),
  drafts: loadDrafts(),
  folders: loadFolders(),

  createTest: (name, productName, folderId) => {
    const id = nanoid()
    const test: LineTest = {
      id,
      name,
      productName,
      status: 'active',
      runs: [],
      template: DEFAULT_TEMPLATE,
      createdAt: new Date().toISOString(),
      folderId,
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

  createFolder: (name) => {
    const id = nanoid()
    const folder: Folder = { id, name, createdAt: new Date().toISOString() }
    const folders = [...get().folders, folder]
    saveFolders(folders)
    set({ folders })
    return id
  },

  renameFolder: (folderId, name) => {
    const folders = get().folders.map(f => f.id === folderId ? { ...f, name } : f)
    saveFolders(folders)
    set({ folders })
  },

  deleteFolder: (folderId) => {
    const tests = get().tests.map(t =>
      t.folderId === folderId ? { ...t, folderId: undefined } : t
    )
    const folders = get().folders.filter(f => f.id !== folderId)
    saveTests(tests)
    saveFolders(folders)
    set({ tests, folders })
  },

  moveTestToFolder: (testId, folderId) => {
    const tests = get().tests.map(t =>
      t.id === testId ? { ...t, folderId: folderId ?? undefined } : t
    )
    saveTests(tests)
    set({ tests })
  },
}))
