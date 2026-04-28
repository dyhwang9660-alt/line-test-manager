import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { LineTest, Run, Draft, Folder, Recipe, RecipeValue } from '@/types'
import { loadTests, saveTests, loadDrafts, saveDrafts, loadFolders, saveFolders, loadRecipes, saveRecipes } from '@/lib/storage'
import { DEFAULT_TEMPLATE, makeEmptyConditions } from '@/lib/defaults'

interface AppState {
  tests: LineTest[]
  drafts: Record<string, Draft>
  folders: Folder[]
  recipes: Recipe[]

  createTest: (name: string, productName: string, folderId?: string) => string
  updateTest: (testId: string, patch: Partial<Pick<LineTest, 'name' | 'productName' | 'status' | 'folderId'>>) => void
  deleteTest: (testId: string) => void
  addRun: (testId: string) => number
  saveRun: (testId: string, runId: number, patch: Partial<Run>) => void
  saveDraft: (key: string, draft: Draft) => void
  clearDraft: (key: string) => void

  createFolder: (name: string) => string
  renameFolder: (folderId: string, name: string) => void
  deleteFolder: (folderId: string) => void
  moveTestToFolder: (testId: string, folderId: string | null) => void

  createRecipe: (name: string, productName: string) => string
  updateRecipe: (recipeId: string, patch: Partial<Pick<Recipe, 'name' | 'productName' | 'conditions' | 'properties'>>) => void
  deleteRecipe: (recipeId: string) => void
  setRecipeValue: (recipeId: string, kind: 'conditions' | 'properties', itemId: string, val: Partial<RecipeValue>) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  tests: loadTests(),
  drafts: loadDrafts(),
  folders: loadFolders(),
  recipes: loadRecipes(),

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

  deleteTest: (testId) => {
    const tests = get().tests.filter(t => t.id !== testId)
    const drafts = { ...get().drafts }
    Object.keys(drafts).forEach(k => { if (k.startsWith(testId)) delete drafts[k] })
    saveTests(tests)
    saveDrafts(drafts)
    set({ tests, drafts })
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

  createRecipe: (name, productName) => {
    const id = nanoid()
    const recipe: Recipe = {
      id,
      name,
      productName,
      conditions: {},
      properties: {},
      createdAt: new Date().toISOString(),
    }
    const recipes = [recipe, ...get().recipes]
    saveRecipes(recipes)
    set({ recipes })
    return id
  },

  updateRecipe: (recipeId, patch) => {
    const recipes = get().recipes.map(r => r.id === recipeId ? { ...r, ...patch } : r)
    saveRecipes(recipes)
    set({ recipes })
  },

  deleteRecipe: (recipeId) => {
    const recipes = get().recipes.filter(r => r.id !== recipeId)
    saveRecipes(recipes)
    set({ recipes })
  },

  setRecipeValue: (recipeId, kind, itemId, val) => {
    const recipes = get().recipes.map(r => {
      if (r.id !== recipeId) return r
      const current = r[kind][itemId] ?? { target: '', tolerance: '±0' }
      return { ...r, [kind]: { ...r[kind], [itemId]: { ...current, ...val } } }
    })
    saveRecipes(recipes)
    set({ recipes })
  },
}))
