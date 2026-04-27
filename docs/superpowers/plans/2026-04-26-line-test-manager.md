# Line Test Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 공정 Line Test 차수별 공정조건·물성평가를 스마트폰으로 입력하고 차수 간 비교·트렌드를 보는 단일 사용자 React PWA 구현

**Architecture:** Vite + React 18 + TypeScript SPA. Zustand으로 전역 상태 관리, localStorage에 직렬화 저장. React Router v6로 4개 화면 전환. vite-plugin-pwa로 오프라인 지원.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Router v6, Recharts, vite-plugin-pwa, Vitest

---

## File Map

| 파일 | 역할 |
|---|---|
| `src/types/index.ts` | 전체 TypeScript 인터페이스 |
| `src/lib/storage.ts` | localStorage read/write |
| `src/lib/utils.ts` | cn() 유틸, 공차 이탈 계산 |
| `src/lib/defaults.ts` | 기본 공정조건·물성 템플릿 데이터 |
| `src/store/useAppStore.ts` | Zustand 스토어 (tests, drafts) |
| `src/App.tsx` | React Router 라우트 정의 |
| `src/main.tsx` | 앱 진입점 |
| `src/index.css` | Tailwind directives + 커스텀 토큰 |
| `src/pages/Home.tsx` | 테스트 목록 화면 |
| `src/pages/TestDetail.tsx` | 차수 목록 화면 |
| `src/pages/RunForm.tsx` | 차수 입력 폼 화면 |
| `src/pages/Compare.tsx` | 비교·트렌드 화면 |
| `src/components/RunProgressStrip.tsx` | 차수 도트 진행 스트립 |
| `src/components/FormRow.tsx` | 4열 공정조건 입력 행 |
| `src/components/LegTabs.tsx` | Leg A/B/C 탭 |
| `src/components/ChangedChips.tsx` | 변경 항목 칩 스트립 |
| `src/components/TrendChart.tsx` | Recharts 트렌드 꺾은선 차트 |
| `src/components/NewTestModal.tsx` | 신규 테스트 생성 Dialog |
| `tests/storage.test.ts` | storage 유틸 단위 테스트 |
| `tests/utils.test.ts` | 공차 이탈 계산 단위 테스트 |
| `tests/store.test.ts` | Zustand 스토어 단위 테스트 |

---

## Task 1: 프로젝트 초기 설정

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `src/index.css`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: 프로젝트 디렉토리에서 Vite 프로젝트 생성**

작업 디렉토리: `C:\Users\wkdrn\OneDrive\Desktop\AI\2. Line Test manager`

```bash
npm create vite@latest . -- --template react-ts
```

프롬프트가 뜨면 "현재 디렉토리에 파일을 덮어쓰겠습니까?" → Y

- [ ] **Step 2: 의존성 설치**

```bash
npm install
npm install zustand react-router-dom recharts
npm install -D tailwindcss postcss autoprefixer @tailwindcss/vite
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
npx tailwindcss init -p
```

- [ ] **Step 3: shadcn/ui 초기화**

```bash
npx shadcn@latest init
```

프롬프트:
- Style: Default
- Base color: Neutral
- CSS variables: yes

그 다음 필요한 컴포넌트 설치:

```bash
npx shadcn@latest add button input tabs badge dialog sheet
```

- [ ] **Step 4: `vite.config.ts` 수정 — Vitest 설정 추가**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
```

- [ ] **Step 5: `tests/setup.ts` 생성**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: `src/index.css` — Tailwind directives + 디자인 토큰**

```css
@import "tailwindcss";

:root {
  --color-changed-bg: #fff8e0;
  --color-changed-border: #fbbf24;
  --color-error: #ef4444;
  --color-target-bg: #f3f4f6;
  --color-empty: #9ca3af;
  --color-header: #111111;
}

* {
  -webkit-tap-highlight-color: transparent;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}
```

- [ ] **Step 7: `tsconfig.json`에 경로 alias 추가**

compilerOptions에 추가:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 8: 기본 `src/App.tsx` — 라우터 뼈대**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/tests/:testId" element={<div>Detail</div>} />
        <Route path="/tests/:testId/runs/:runId" element={<div>Form</div>} />
        <Route path="/tests/:testId/compare" element={<div>Compare</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 9: 앱 실행 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속, "Home" 텍스트 보이면 성공.

- [ ] **Step 10: 커밋**

```bash
git init
git add -A
git commit -m "feat: initial project scaffold with Vite + React + Tailwind + shadcn"
```

---

## Task 2: TypeScript 타입 정의

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: `src/types/index.ts` 작성**

```typescript
export type RunStatus = 'done' | 'active' | 'pending'
export type TestStatus = 'active' | 'done'

export interface ConditionValue {
  target: number | string
  tolerance: string        // "±2", "≥0.918" 등
  actuals: Record<string, number | string>  // { A: 185, B: '' }
}

export interface ConditionItem {
  id: string
  label: string
  unit: string
  group: 'temperature' | 'operation' | 'analysis'
}

export interface Photo {
  id: string
  dataUrl: string
  caption: string
}

export interface Run {
  id: number
  label: string              // "Run 1"
  status: RunStatus
  note: string               // "T3 온도 +5°C, RPM -20"
  hasConditionChange: boolean
  startTime: string          // ISO string
  legs: string[]             // ["A", "B", "C"]
  conditions: Record<string, ConditionValue>
  properties: Record<string, ConditionValue>
  photos: Photo[]
  memo: string
  tags: string[]
}

export interface Template {
  id: string
  name: string
  conditionItems: ConditionItem[]
  propertyItems: ConditionItem[]
}

export interface LineTest {
  id: string
  name: string
  productName: string
  status: TestStatus
  runs: Run[]
  template: Template
  createdAt: string
}

export type Draft = Partial<Pick<Run, 'conditions' | 'properties' | 'photos' | 'memo' | 'tags' | 'legs'>>
```

- [ ] **Step 2: 커밋**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 3: 기본 템플릿 데이터 & 유틸

**Files:**
- Create: `src/lib/defaults.ts`, `src/lib/utils.ts`, `tests/utils.test.ts`

- [ ] **Step 1: `tests/utils.test.ts` 작성 (failing)**

```typescript
import { describe, it, expect } from 'vitest'
import { isOutOfTolerance, parseTolerance, buildChangedChips } from '@/lib/utils'

describe('parseTolerance', () => {
  it('parses ±2 as { type: "pm", value: 2 }', () => {
    expect(parseTolerance('±2')).toEqual({ type: 'pm', value: 2 })
  })
  it('parses ±0.5 correctly', () => {
    expect(parseTolerance('±0.5')).toEqual({ type: 'pm', value: 0.5 })
  })
})

describe('isOutOfTolerance', () => {
  it('returns false when actual is within range', () => {
    expect(isOutOfTolerance(186, '185', '±2')).toBe(false)
  })
  it('returns true when actual exceeds upper bound', () => {
    expect(isOutOfTolerance(188, '185', '±2')).toBe(true)
  })
  it('returns true when actual is below lower bound', () => {
    expect(isOutOfTolerance(182, '185', '±2')).toBe(true)
  })
  it('returns false when actual equals target exactly', () => {
    expect(isOutOfTolerance(185, '185', '±2')).toBe(false)
  })
  it('returns false when actual is empty string', () => {
    expect(isOutOfTolerance('', '185', '±2')).toBe(false)
  })
})

describe('buildChangedChips', () => {
  it('returns empty array when no changes', () => {
    const prev = { t1: { target: 185, tolerance: '±2', actuals: { A: 185 } } }
    const curr = { t1: { target: 185, tolerance: '±2', actuals: { A: 185 } } }
    expect(buildChangedChips(prev, curr, [{ id: 't1', label: 'T1 온도', unit: '°C', group: 'temperature' }])).toEqual([])
  })
  it('returns chip label when value changed', () => {
    const prev = { t1: { target: 185, tolerance: '±2', actuals: { A: 185 } } }
    const curr = { t1: { target: 185, tolerance: '±2', actuals: { A: 190 } } }
    const items = [{ id: 't1', label: 'T1 온도', unit: '°C', group: 'temperature' as const }]
    const chips = buildChangedChips(prev, curr, items)
    expect(chips).toHaveLength(1)
    expect(chips[0]).toContain('T1 온도')
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npx vitest run tests/utils.test.ts
```

Expected: FAIL (모듈 없음)

- [ ] **Step 3: `src/lib/utils.ts` 작성**

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ConditionItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ToleranceResult {
  type: 'pm'
  value: number
}

export function parseTolerance(tolerance: string): ToleranceResult | null {
  const match = tolerance.match(/^[±]\s*([\d.]+)$/)
  if (!match) return null
  return { type: 'pm', value: parseFloat(match[1]) }
}

export function isOutOfTolerance(
  actual: number | string,
  target: number | string,
  tolerance: string
): boolean {
  if (actual === '' || actual === null || actual === undefined) return false
  const actualNum = typeof actual === 'string' ? parseFloat(actual) : actual
  const targetNum = typeof target === 'string' ? parseFloat(target) : target
  if (isNaN(actualNum) || isNaN(targetNum)) return false
  const parsed = parseTolerance(tolerance)
  if (!parsed) return false
  return Math.abs(actualNum - targetNum) > parsed.value
}

export function buildChangedChips(
  prev: Record<string, { actuals: Record<string, number | string> }>,
  curr: Record<string, { actuals: Record<string, number | string> }>,
  items: ConditionItem[]
): string[] {
  const chips: string[] = []
  for (const item of items) {
    const prevActuals = prev[item.id]?.actuals ?? {}
    const currActuals = curr[item.id]?.actuals ?? {}
    const allLegs = new Set([...Object.keys(prevActuals), ...Object.keys(currActuals)])
    for (const leg of allLegs) {
      const prevVal = prevActuals[leg] ?? ''
      const currVal = currActuals[leg] ?? ''
      if (String(prevVal) !== String(currVal)) {
        const diff = typeof currVal === 'number' && typeof prevVal === 'number'
          ? (currVal - prevVal > 0 ? `+${currVal - prevVal}` : `${currVal - prevVal}`)
          : String(currVal)
        chips.push(`${item.label} ${diff}${item.unit}`)
        break
      }
    }
  }
  return chips
}
```

- [ ] **Step 4: `clsx`, `tailwind-merge` 설치**

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

```bash
npx vitest run tests/utils.test.ts
```

Expected: PASS (5개 테스트)

- [ ] **Step 6: `src/lib/defaults.ts` 작성**

```typescript
import type { Template, ConditionItem } from '@/types'

export const DEFAULT_CONDITION_ITEMS: ConditionItem[] = [
  { id: 't1', label: 'T1 온도', unit: '°C', group: 'temperature' },
  { id: 't2', label: 'T2 온도', unit: '°C', group: 'temperature' },
  { id: 't3', label: 'T3 온도', unit: '°C', group: 'temperature' },
  { id: 't4', label: 'T4 온도', unit: '°C', group: 'temperature' },
  { id: 'die', label: 'Die 온도', unit: '°C', group: 'temperature' },
  { id: 'rpm', label: 'RPM', unit: 'rpm', group: 'operation' },
  { id: 'pressure', label: '압력', unit: 'bar', group: 'operation' },
  { id: 'feed', label: '투입량', unit: 'kg/hr', group: 'operation' },
  { id: 'vacuum', label: '진공도', unit: 'MPa', group: 'operation' },
  { id: 'cooling', label: '냉각수 온도', unit: '°C', group: 'operation' },
]

export const DEFAULT_PROPERTY_ITEMS: ConditionItem[] = [
  { id: 'mi', label: 'MI', unit: 'g/10min', group: 'analysis' },
  { id: 'density', label: '밀도', unit: 'g/cm³', group: 'analysis' },
  { id: 'appearance', label: '외관', unit: '', group: 'analysis' },
  { id: 'tensile', label: '인장강도(MD)', unit: 'MPa', group: 'analysis' },
  { id: 'haze', label: '헤이즈', unit: '%', group: 'analysis' },
]

export const DEFAULT_TEMPLATE: Template = {
  id: 'default',
  name: '기본 템플릿',
  conditionItems: DEFAULT_CONDITION_ITEMS,
  propertyItems: DEFAULT_PROPERTY_ITEMS,
}

export function makeEmptyConditions(
  items: ConditionItem[],
  legs: string[],
  targets?: Record<string, { target: number | string; tolerance: string }>
): Record<string, { target: number | string; tolerance: string; actuals: Record<string, number | string> }> {
  const result: Record<string, { target: number | string; tolerance: string; actuals: Record<string, number | string> }> = {}
  for (const item of items) {
    result[item.id] = {
      target: targets?.[item.id]?.target ?? '',
      tolerance: targets?.[item.id]?.tolerance ?? '±0',
      actuals: Object.fromEntries(legs.map(leg => [leg, ''])),
    }
  }
  return result
}
```

- [ ] **Step 7: 커밋**

```bash
git add src/lib/utils.ts src/lib/defaults.ts tests/utils.test.ts tests/setup.ts
git commit -m "feat: add utility functions, defaults, and unit tests"
```

---

## Task 4: localStorage 저장 레이어

**Files:**
- Create: `src/lib/storage.ts`, `tests/storage.test.ts`

- [ ] **Step 1: `tests/storage.test.ts` 작성 (failing)**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { loadTests, saveTests } from '@/lib/storage'
import type { LineTest } from '@/types'

const mockTest: LineTest = {
  id: 'test-1',
  name: 'PE-LLD #23-A',
  productName: 'Film Grade 0.918',
  status: 'active',
  runs: [],
  template: { id: 'default', name: '기본', conditionItems: [], propertyItems: [] },
  createdAt: '2026-04-26T00:00:00.000Z',
}

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loadTests returns empty array when nothing stored', () => {
    expect(loadTests()).toEqual([])
  })

  it('saveTests persists and loadTests retrieves', () => {
    saveTests([mockTest])
    expect(loadTests()).toEqual([mockTest])
  })

  it('saveTests overwrites previous data', () => {
    saveTests([mockTest])
    saveTests([])
    expect(loadTests()).toEqual([])
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npx vitest run tests/storage.test.ts
```

Expected: FAIL

- [ ] **Step 3: `src/lib/storage.ts` 작성**

```typescript
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
  localStorage.setItem(TESTS_KEY, JSON.stringify(tests))
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
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npx vitest run tests/storage.test.ts
```

Expected: PASS (3개 테스트)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/storage.ts tests/storage.test.ts
git commit -m "feat: add localStorage storage layer with tests"
```

---

## Task 5: Zustand 스토어

**Files:**
- Create: `src/store/useAppStore.ts`, `tests/store.test.ts`

- [ ] **Step 1: `tests/store.test.ts` 작성 (failing)**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'

// 모듈 캐싱 방지: 각 테스트마다 store를 새로 초기화
beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

describe('useAppStore', () => {
  it('creates a new test', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    act(() => {
      useAppStore.getState().createTest('PE-LLD #23-A', 'Film Grade 0.918')
    })
    const tests = useAppStore.getState().tests
    expect(tests).toHaveLength(1)
    expect(tests[0].name).toBe('PE-LLD #23-A')
    expect(tests[0].status).toBe('active')
  })

  it('adds a run to existing test', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    act(() => {
      useAppStore.getState().createTest('PE-LLD #23-A', 'Film Grade 0.918')
    })
    const testId = useAppStore.getState().tests[0].id
    act(() => {
      useAppStore.getState().addRun(testId)
    })
    const runs = useAppStore.getState().tests[0].runs
    expect(runs).toHaveLength(1)
    expect(runs[0].label).toBe('Run 1')
    expect(runs[0].status).toBe('active')
  })

  it('saveRun updates run data', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    act(() => {
      useAppStore.getState().createTest('PE-LLD #23-A', 'Film Grade')
    })
    const testId = useAppStore.getState().tests[0].id
    act(() => {
      useAppStore.getState().addRun(testId)
    })
    const runId = useAppStore.getState().tests[0].runs[0].id
    act(() => {
      useAppStore.getState().saveRun(testId, runId, { memo: '테스트 메모' })
    })
    expect(useAppStore.getState().tests[0].runs[0].memo).toBe('테스트 메모')
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npx vitest run tests/store.test.ts
```

Expected: FAIL

- [ ] **Step 3: `src/store/useAppStore.ts` 작성**

```typescript
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
    const newRunId = (prevRun?.id ?? 0) + 1
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
```

- [ ] **Step 4: nanoid 설치**

```bash
npm install nanoid
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

```bash
npx vitest run tests/store.test.ts
```

Expected: PASS (3개 테스트)

- [ ] **Step 6: 커밋**

```bash
git add src/store/useAppStore.ts tests/store.test.ts
git commit -m "feat: add Zustand store with create/addRun/saveRun actions"
```

---

## Task 6: App Shell & 라우팅

**Files:**
- Modify: `src/App.tsx`, `src/main.tsx`
- Create: `src/pages/Home.tsx`, `src/pages/TestDetail.tsx`, `src/pages/RunForm.tsx`, `src/pages/Compare.tsx`

- [ ] **Step 1: 페이지 스텁 4개 생성**

`src/pages/Home.tsx`:
```tsx
export default function Home() {
  return <div className="p-4">Home</div>
}
```

`src/pages/TestDetail.tsx`:
```tsx
export default function TestDetail() {
  return <div className="p-4">TestDetail</div>
}
```

`src/pages/RunForm.tsx`:
```tsx
export default function RunForm() {
  return <div className="p-4">RunForm</div>
}
```

`src/pages/Compare.tsx`:
```tsx
export default function Compare() {
  return <div className="p-4">Compare</div>
}
```

- [ ] **Step 2: `src/App.tsx` — 라우트 연결**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import TestDetail from '@/pages/TestDetail'
import RunForm from '@/pages/RunForm'
import Compare from '@/pages/Compare'

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tests/:testId" element={<TestDetail />} />
          <Route path="/tests/:testId/runs/:runId" element={<RunForm />} />
          <Route path="/tests/:testId/compare" element={<Compare />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: 실행 확인**

```bash
npm run dev
```

`http://localhost:5173` 접속, "Home" 텍스트 확인. URL을 `/tests/abc`로 바꾸면 "TestDetail" 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/App.tsx src/pages/
git commit -m "feat: add routing with page stubs"
```

---

## Task 7: Home 화면

**Files:**
- Modify: `src/pages/Home.tsx`
- Create: `src/components/NewTestModal.tsx`

- [ ] **Step 1: `src/components/NewTestModal.tsx` 작성**

```tsx
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'
import { useNavigate } from 'react-router-dom'

interface Props {
  open: boolean
  onClose: () => void
}

export default function NewTestModal({ open, onClose }: Props) {
  const [name, setName] = useState('')
  const [productName, setProductName] = useState('')
  const createTest = useAppStore(s => s.createTest)
  const navigate = useNavigate()

  function handleSubmit() {
    if (!name.trim()) return
    const id = createTest(name.trim(), productName.trim())
    onClose()
    setName('')
    setProductName('')
    navigate(`/tests/${id}`)
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>새 Line Test</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">테스트명 *</label>
            <Input
              placeholder="PE-LLD #23-A"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">제품명</label>
            <Input
              placeholder="Film Grade 0.918"
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
          </div>
          <Button className="w-full bg-gray-900 hover:bg-gray-700" onClick={handleSubmit}>
            생성
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: `src/pages/Home.tsx` 작성**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import NewTestModal from '@/components/NewTestModal'
import type { LineTest } from '@/types'

function TestItem({ test }: { test: LineTest }) {
  const navigate = useNavigate()
  const lastRun = test.runs[test.runs.length - 1]
  const lastDate = lastRun
    ? new Date(lastRun.startTime).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
    : new Date(test.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })

  return (
    <button
      onClick={() => navigate(`/tests/${test.id}`)}
      className={`w-full text-left rounded-xl px-4 py-3 mb-2 flex items-center justify-between border ${
        test.status === 'active'
          ? 'bg-[#fff8e0] border-[#fbbf24]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div>
        <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          {test.name}
          {test.status === 'active' && (
            <span className="text-xs bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full font-medium">
              진행중
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {test.productName} · Run {test.runs.length}차 · 최근 {lastDate}
        </div>
      </div>
      <span className="text-gray-400 text-lg">›</span>
    </button>
  )
}

export default function Home() {
  const tests = useAppStore(s => s.tests)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = tests.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.productName.toLowerCase().includes(search.toLowerCase())
  )
  const active = filtered.filter(t => t.status === 'active')
  const done = filtered.filter(t => t.status === 'done')

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#111111] text-white px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-base">Line Test</span>
        <button className="text-sm text-gray-300">+ 신규</button>
      </div>

      {/* 검색 */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <input
          className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none placeholder:text-gray-400"
          placeholder="테스트 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* 목록 */}
      <div className="flex-1 px-4 py-3">
        {active.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">진행중</div>
            {active.map(t => <TestItem key={t.id} test={t} />)}
          </div>
        )}
        {done.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">완료됨</div>
            {done.map(t => <TestItem key={t.id} test={t} />)}
          </div>
        )}
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-16">
            {search ? '검색 결과가 없습니다' : '테스트를 추가해보세요'}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg text-2xl flex items-center justify-center"
      >
        +
      </button>

      <NewTestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
```

- [ ] **Step 3: 실행 확인**

```bash
npm run dev
```

홈 화면에서 FAB(+) 클릭 → 모달 열림. 테스트명 입력 후 생성 → TestDetail 화면으로 이동 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/pages/Home.tsx src/components/NewTestModal.tsx
git commit -m "feat: implement Home screen with test list and new test modal"
```

---

## Task 8: RunProgressStrip 컴포넌트

**Files:**
- Create: `src/components/RunProgressStrip.tsx`

- [ ] **Step 1: `src/components/RunProgressStrip.tsx` 작성**

```tsx
import type { Run } from '@/types'

interface Props {
  runs: Run[]
}

export default function RunProgressStrip({ runs }: Props) {
  if (runs.length === 0) return null

  return (
    <div className="flex items-center gap-0 py-3 px-4 overflow-x-auto">
      {runs.map((run, i) => (
        <div key={run.id} className="flex items-center">
          {/* 도트 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                run.status === 'done'
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : run.status === 'active'
                  ? 'bg-yellow-400 border-yellow-400 text-gray-900'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {run.id}
            </div>
          </div>
          {/* 연결선 */}
          {i < runs.length - 1 && (
            <div
              className={`h-0.5 w-6 ${
                run.status === 'done' ? 'bg-gray-900' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/RunProgressStrip.tsx
git commit -m "feat: add RunProgressStrip component"
```

---

## Task 9: TestDetail 화면

**Files:**
- Modify: `src/pages/TestDetail.tsx`

- [ ] **Step 1: `src/pages/TestDetail.tsx` 작성**

```tsx
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import RunProgressStrip from '@/components/RunProgressStrip'
import type { Run } from '@/types'

function RunItem({ run, testId }: { run: Run; testId: string }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/tests/${testId}/runs/${run.id}`)}
      className={`w-full text-left rounded-xl px-4 py-3 mb-2 border ${
        run.status === 'active'
          ? 'bg-[#fff8e0] border-[#fbbf24]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-900">{run.label}</span>
          {run.hasConditionChange && (
            <span className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-300 px-1.5 py-0.5 rounded-full">
              조건변경
            </span>
          )}
          {run.status === 'active' && (
            <span className="text-xs bg-red-100 text-red-700 border border-red-300 px-1.5 py-0.5 rounded-full">
              진행중
            </span>
          )}
        </div>
        <span className="text-gray-400">›</span>
      </div>
      {run.note && (
        <div className="text-xs text-gray-500 mt-1">{run.note}</div>
      )}
      <div className="text-xs text-gray-400 mt-0.5">
        {new Date(run.startTime).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>
    </button>
  )
}

export default function TestDetail() {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const tests = useAppStore(s => s.tests)
  const addRun = useAppStore(s => s.addRun)
  const test = tests.find(t => t.id === testId)

  if (!test) return (
    <div className="flex items-center justify-center h-screen text-gray-400">
      테스트를 찾을 수 없습니다
    </div>
  )

  function handleAddRun() {
    if (!testId) return
    const runId = addRun(testId)
    navigate(`/tests/${testId}/runs/${runId}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#111111] text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-gray-300 text-lg">←</button>
        <span className="font-bold text-base flex-1 truncate">{test.name}</span>
        <button className="text-gray-300 text-sm">편집</button>
      </div>

      {/* 진행 스트립 */}
      <div className="bg-white border-b border-gray-100">
        <RunProgressStrip runs={test.runs} />
      </div>

      {/* 버튼 행 */}
      {test.runs.length > 0 && (
        <div className="flex gap-2 px-4 py-2 bg-white border-b border-gray-100">
          <button
            onClick={() => navigate(`/tests/${testId}/compare`)}
            className="flex-1 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700"
          >
            📊 비교 보기
          </button>
          <button
            onClick={() => navigate(`/tests/${testId}/compare?tab=trend`)}
            className="flex-1 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700"
          >
            📈 트렌드
          </button>
        </div>
      )}

      {/* 차수 목록 */}
      <div className="flex-1 px-4 py-3 pb-24">
        {test.runs.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-16">
            첫 번째 차수를 시작해보세요
          </div>
        )}
        {[...test.runs].reverse().map(run => (
          <RunItem key={run.id} run={run} testId={test.id} />
        ))}
      </div>

      {/* 고정 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 py-3 bg-white border-t border-gray-200">
        <button
          onClick={handleAddRun}
          className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium text-sm"
        >
          + 새 차수 입력 시작
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 실행 확인**

홈에서 테스트 클릭 → 차수 목록 화면. "새 차수 입력 시작" 클릭 → RunForm 화면으로 이동 확인.

- [ ] **Step 3: 커밋**

```bash
git add src/pages/TestDetail.tsx
git commit -m "feat: implement TestDetail screen with run list"
```

---

## Task 10: FormRow 컴포넌트

**Files:**
- Create: `src/components/FormRow.tsx`

- [ ] **Step 1: `src/components/FormRow.tsx` 작성**

```tsx
import { isOutOfTolerance } from '@/lib/utils'

interface Props {
  label: string
  unit: string
  target: number | string
  tolerance: string
  actual: number | string
  changed: boolean
  onActualChange: (val: string) => void
  onToleranceChange: (val: string) => void
}

export default function FormRow({
  label, unit, target, tolerance, actual, changed,
  onActualChange, onToleranceChange,
}: Props) {
  const outOfTol = isOutOfTolerance(actual, target, tolerance)
  const isEmpty = actual === '' || actual === undefined || actual === null

  return (
    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${changed ? 'bg-[#fff8e0]' : ''}`}>
      {/* 변경 도트 */}
      <div className="w-2 flex-shrink-0">
        {changed && <div className="w-2 h-2 bg-red-500 rounded-full" />}
      </div>

      {/* 항목명 */}
      <div className="w-20 flex-shrink-0">
        <div className="text-xs text-gray-600 leading-tight">{label}</div>
        {unit && <div className="text-[10px] text-gray-400">{unit}</div>}
      </div>

      {/* Target */}
      <div
        className={`w-12 flex-shrink-0 text-center text-xs py-1.5 rounded-md bg-[#f3f4f6] text-gray-500 border ${
          changed ? 'border-orange-300' : 'border-gray-200'
        }`}
      >
        {target !== '' ? String(target) : '—'}
      </div>

      {/* 공차 */}
      <input
        className="w-11 flex-shrink-0 text-center text-xs py-1.5 rounded-md border border-dashed border-yellow-400 bg-yellow-50 text-yellow-700 outline-none"
        value={tolerance}
        onChange={e => onToleranceChange(e.target.value)}
        inputMode="text"
      />

      {/* 실측값 */}
      <div className="flex-1 relative">
        <input
          className={`w-full text-sm py-1.5 px-2 rounded-md border outline-none text-right ${
            isEmpty
              ? 'border-gray-300 text-gray-400'
              : outOfTol
              ? 'border-red-500 text-red-600 bg-red-50'
              : 'border-gray-800 text-gray-900'
          }`}
          value={isEmpty ? '' : String(actual)}
          placeholder="—"
          inputMode="decimal"
          onChange={e => onActualChange(e.target.value)}
        />
        {outOfTol && (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-red-500 text-xs font-bold pointer-events-none">!</span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/FormRow.tsx
git commit -m "feat: add FormRow component with tolerance validation"
```

---

## Task 11: LegTabs & ChangedChips 컴포넌트

**Files:**
- Create: `src/components/LegTabs.tsx`, `src/components/ChangedChips.tsx`

- [ ] **Step 1: `src/components/LegTabs.tsx` 작성**

```tsx
interface Props {
  legs: string[]
  activeLeg: string
  onSelect: (leg: string) => void
  onAdd: () => void
}

export default function LegTabs({ legs, activeLeg, onSelect, onAdd }: Props) {
  return (
    <div className="flex gap-1.5 px-4 py-2 overflow-x-auto bg-white border-b border-gray-100">
      {legs.map(leg => (
        <button
          key={leg}
          onClick={() => onSelect(leg)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-colors ${
            activeLeg === leg
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Leg {leg}
        </button>
      ))}
      <button
        onClick={onAdd}
        className="px-3 py-1.5 rounded-full text-xs text-gray-400 border border-dashed border-gray-300 flex-shrink-0"
      >
        + 추가
      </button>
    </div>
  )
}
```

- [ ] **Step 2: `src/components/ChangedChips.tsx` 작성**

```tsx
interface Props {
  chips: string[]
}

export default function ChangedChips({ chips }: Props) {
  if (chips.length === 0) return null
  return (
    <div className="flex gap-1.5 px-4 py-2 overflow-x-auto bg-yellow-50 border-b border-yellow-100">
      <span className="text-xs text-gray-500 flex-shrink-0 self-center">이전 Run 대비:</span>
      {chips.map((chip, i) => (
        <span
          key={i}
          className="text-xs bg-yellow-300 text-yellow-900 px-2 py-1 rounded-full flex-shrink-0 font-medium"
        >
          {chip}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/components/LegTabs.tsx src/components/ChangedChips.tsx
git commit -m "feat: add LegTabs and ChangedChips components"
```

---

## Task 12: RunForm 화면

**Files:**
- Modify: `src/pages/RunForm.tsx`

- [ ] **Step 1: `src/pages/RunForm.tsx` 작성**

```tsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import FormRow from '@/components/FormRow'
import LegTabs from '@/components/LegTabs'
import ChangedChips from '@/components/ChangedChips'
import { buildChangedChips } from '@/lib/utils'
import type { Run } from '@/types'

const PHOTO_TAGS = ['외관불량', '버블', '압력이상', '온도이상', '이물질', '기타']
const MAIN_TABS = ['공정조건', '물성평가', '사진·특이점'] as const
type MainTab = typeof MAIN_TABS[number]

export default function RunForm() {
  const { testId, runId } = useParams<{ testId: string; runId: string }>()
  const navigate = useNavigate()
  const tests = useAppStore(s => s.tests)
  const saveRun = useAppStore(s => s.saveRun)
  const saveDraft = useAppStore(s => s.saveDraft)
  const clearDraft = useAppStore(s => s.clearDraft)
  const drafts = useAppStore(s => s.drafts)

  const test = tests.find(t => t.id === testId)
  const run = test?.runs.find(r => r.id === Number(runId))
  const prevRun = run ? test?.runs.find(r => r.id === run.id - 1) : undefined

  const draftKey = `${testId}-${runId}`
  const draft = drafts[draftKey]

  const [activeTab, setActiveTab] = useState<MainTab>('공정조건')
  const [activeLeg, setActiveLeg] = useState('A')
  const [legs, setLegs] = useState<string[]>(run?.legs ?? ['A'])
  const [conditions, setConditions] = useState(draft?.conditions ?? run?.conditions ?? {})
  const [properties, setProperties] = useState(draft?.properties ?? run?.properties ?? {})
  const [memo, setMemo] = useState(draft?.memo ?? run?.memo ?? '')
  const [tags, setTags] = useState<string[]>(draft?.tags ?? run?.tags ?? [])

  // 자동 임시저장
  useEffect(() => {
    saveDraft(draftKey, { conditions, properties, memo, tags, legs })
  }, [conditions, properties, memo, tags, legs])

  const handleAddLeg = useCallback(() => {
    const next = String.fromCharCode(65 + legs.length)
    if (legs.length >= 6) return
    setLegs(prev => [...prev, next])
    setConditions(prev => {
      const updated = { ...prev }
      for (const key of Object.keys(updated)) {
        updated[key] = { ...updated[key], actuals: { ...updated[key].actuals, [next]: '' } }
      }
      return updated
    })
    setProperties(prev => {
      const updated = { ...prev }
      for (const key of Object.keys(updated)) {
        updated[key] = { ...updated[key], actuals: { ...updated[key].actuals, [next]: '' } }
      }
      return updated
    })
    setActiveLeg(next)
  }, [legs])

  function updateActual(
    type: 'conditions' | 'properties',
    itemId: string,
    leg: string,
    val: string
  ) {
    if (type === 'conditions') {
      setConditions(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          actuals: { ...prev[itemId]?.actuals, [leg]: val },
        },
      }))
    } else {
      setProperties(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          actuals: { ...prev[itemId]?.actuals, [leg]: val },
        },
      }))
    }
  }

  function updateTolerance(type: 'conditions' | 'properties', itemId: string, val: string) {
    if (type === 'conditions') {
      setConditions(prev => ({ ...prev, [itemId]: { ...prev[itemId], tolerance: val } }))
    } else {
      setProperties(prev => ({ ...prev, [itemId]: { ...prev[itemId], tolerance: val } }))
    }
  }

  function handleCopyPrev() {
    if (!prevRun) return
    setConditions(JSON.parse(JSON.stringify(prevRun.conditions)))
    setProperties(JSON.parse(JSON.stringify(prevRun.properties)))
  }

  function handleSave() {
    if (!testId || !run) return
    const chips = prevRun
      ? buildChangedChips(prevRun.conditions, conditions, test?.template.conditionItems ?? [])
      : []
    saveRun(testId, run.id, {
      conditions,
      properties,
      memo,
      tags,
      legs,
      status: 'done',
      hasConditionChange: chips.length > 0,
      note: chips.slice(0, 3).join(', '),
    })
    clearDraft(draftKey)
    navigate(`/tests/${testId}`)
  }

  if (!test || !run) {
    return <div className="flex items-center justify-center h-screen text-gray-400">차수를 찾을 수 없습니다</div>
  }

  const changedChips = prevRun
    ? buildChangedChips(prevRun.conditions, conditions, test.template.conditionItems)
    : []

  const conditionGroups = {
    '공정 온도': test.template.conditionItems.filter(i => i.group === 'temperature'),
    '운전 조건': test.template.conditionItems.filter(i => i.group === 'operation'),
  }
  const propertyGroups = {
    '분석값': test.template.propertyItems,
  }

  function isChanged(type: 'conditions' | 'properties', itemId: string) {
    if (!prevRun) return false
    const prev = type === 'conditions' ? prevRun.conditions[itemId] : prevRun.properties[itemId]
    const curr = type === 'conditions' ? conditions[itemId] : properties[itemId]
    if (!prev || !curr) return false
    return String(prev.actuals[activeLeg] ?? '') !== String(curr.actuals[activeLeg] ?? '')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#111111] text-white px-4 py-3 flex items-center gap-2">
        <button onClick={() => navigate(`/tests/${testId}`)} className="text-gray-300 text-lg flex-shrink-0">←</button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 truncate">{test.name}</div>
          <div className="font-bold text-sm">{run.label}</div>
        </div>
        <button
          onClick={() => saveDraft(draftKey, { conditions, properties, memo, tags, legs })}
          className="text-xs text-yellow-400 border border-yellow-400 px-2 py-1 rounded flex-shrink-0"
        >
          임시저장
        </button>
      </div>

      {/* 변경 칩 */}
      <ChangedChips chips={changedChips} />

      {/* 메인 탭 */}
      <div className="flex bg-white border-b border-gray-200">
        {MAIN_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500'
            }`}
          >
            {tab === '공정조건' ? '⚙️ 공정조건' : tab === '물성평가' ? '🧪 물성평가' : '📷 사진·특이점'}
          </button>
        ))}
      </div>

      {/* Leg 탭 (사진 탭 제외) */}
      {activeTab !== '사진·특이점' && (
        <LegTabs legs={legs} activeLeg={activeLeg} onSelect={setActiveLeg} onAdd={handleAddLeg} />
      )}

      {/* 컬럼 헤더 */}
      {activeTab !== '사진·특이점' && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200 text-[10px] text-gray-500 uppercase tracking-wide">
          <div className="w-2" />
          <div className="w-20">항목</div>
          <div className="w-12 text-center">Target</div>
          <div className="w-11 text-center">공차</div>
          <div className="flex-1 text-right">실측값 (Leg {activeLeg})</div>
        </div>
      )}

      {/* 폼 영역 */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === '공정조건' && (
          <div>
            {Object.entries(conditionGroups).map(([groupName, items]) => (
              <div key={groupName}>
                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100 flex items-center justify-between">
                  {groupName}
                  <button className="text-blue-500 text-xs">+ 항목 추가</button>
                </div>
                {items.map(item => (
                  <FormRow
                    key={item.id}
                    label={item.label}
                    unit={item.unit}
                    target={conditions[item.id]?.target ?? ''}
                    tolerance={conditions[item.id]?.tolerance ?? '±0'}
                    actual={conditions[item.id]?.actuals[activeLeg] ?? ''}
                    changed={isChanged('conditions', item.id)}
                    onActualChange={val => updateActual('conditions', item.id, activeLeg, val)}
                    onToleranceChange={val => updateTolerance('conditions', item.id, val)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === '물성평가' && (
          <div>
            {Object.entries(propertyGroups).map(([groupName, items]) => (
              <div key={groupName}>
                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100 flex items-center justify-between">
                  {groupName}
                  <button className="text-blue-500 text-xs">+ 항목 추가</button>
                </div>
                {items.map(item => (
                  <FormRow
                    key={item.id}
                    label={item.label}
                    unit={item.unit}
                    target={properties[item.id]?.target ?? ''}
                    tolerance={properties[item.id]?.tolerance ?? '±0'}
                    actual={properties[item.id]?.actuals[activeLeg] ?? ''}
                    changed={isChanged('properties', item.id)}
                    onActualChange={val => updateActual('properties', item.id, activeLeg, val)}
                    onToleranceChange={val => updateTolerance('properties', item.id, val)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === '사진·특이점' && (
          <div className="p-4 space-y-4">
            {/* 사진 */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">사진</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <label className="w-20 h-20 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer text-xs gap-1">
                  <span className="text-2xl">📷</span>
                  <span>추가</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = ev => {
                        const dataUrl = ev.target?.result as string
                        if (!dataUrl) return
                        saveRun(testId!, run.id, {
                          photos: [...run.photos, { id: crypto.randomUUID(), dataUrl, caption: '' }],
                        })
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                </label>
              </div>
            </div>

            {/* 태그 */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">특이점 태그</div>
              <div className="flex flex-wrap gap-2">
                {PHOTO_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setTags(prev =>
                      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                    )}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      tags.includes(tag)
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 메모 */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">특이점 메모</div>
              <textarea
                className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none outline-none focus:border-gray-500"
                rows={4}
                placeholder="특이사항을 입력하세요..."
                value={memo}
                onChange={e => setMemo(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto flex gap-2 px-4 py-3 bg-white border-t border-gray-200">
        <button
          onClick={handleCopyPrev}
          disabled={!prevRun}
          className="flex-1 py-2.5 text-sm border border-gray-300 rounded-xl text-gray-700 disabled:opacity-40"
        >
          ← 이전 Run 복사
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 text-sm bg-gray-900 text-white rounded-xl font-medium"
        >
          저장 →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 실행 확인**

차수 입력 폼에서:
- 탭 전환 (공정조건/물성평가/사진) 확인
- Leg A/B 추가 확인
- 실측값 입력 시 공차 이탈 빨간 테두리 확인
- 저장 → TestDetail로 이동 확인

- [ ] **Step 3: 커밋**

```bash
git add src/pages/RunForm.tsx
git commit -m "feat: implement RunForm with tabs, leg selection, and auto-save draft"
```

---

## Task 13: Compare 화면 — 차수 비교 탭

**Files:**
- Modify: `src/pages/Compare.tsx`

- [ ] **Step 1: `src/pages/Compare.tsx` 작성**

```tsx
import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import TrendChart from '@/components/TrendChart'

type CompareAxis = 'run' | 'leg'
type FilterMode = 'all' | 'changed'

export default function Compare() {
  const { testId } = useParams<{ testId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tests = useAppStore(s => s.tests)
  const test = tests.find(t => t.id === testId)

  const [activeTab, setActiveTab] = useState<'compare' | 'trend'>(
    searchParams.get('tab') === 'trend' ? 'trend' : 'compare'
  )
  const [axis, setAxis] = useState<CompareAxis>('run')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [fixedLeg, setFixedLeg] = useState('A')
  const [fixedRun, setFixedRun] = useState(1)

  if (!test) return <div className="flex items-center justify-center h-screen text-gray-400">테스트 없음</div>

  const doneRuns = test.runs.filter(r => r.status === 'done' || r.status === 'active')
  const allLegs = Array.from(new Set(doneRuns.flatMap(r => r.legs)))

  // 비교 컬럼 결정
  const columns = axis === 'run'
    ? doneRuns.map(r => ({ key: String(r.id), label: `R${r.id}` }))
    : allLegs.map(leg => ({ key: leg, label: `Leg ${leg}` }))

  function getCellValue(itemId: string, colKey: string, type: 'conditions' | 'properties'): string {
    if (axis === 'run') {
      const run = doneRuns.find(r => String(r.id) === colKey)
      const val = type === 'conditions'
        ? run?.conditions[itemId]?.actuals[fixedLeg]
        : run?.properties[itemId]?.actuals[fixedLeg]
      return val !== undefined && val !== '' ? String(val) : '—'
    } else {
      const run = doneRuns.find(r => r.id === fixedRun)
      const val = type === 'conditions'
        ? run?.conditions[itemId]?.actuals[colKey]
        : run?.properties[itemId]?.actuals[colKey]
      return val !== undefined && val !== '' ? String(val) : '—'
    }
  }

  function isChangedCell(itemId: string, colIdx: number, type: 'conditions' | 'properties'): boolean {
    if (axis !== 'run' || colIdx === 0) return false
    const prevVal = getCellValue(itemId, columns[colIdx - 1].key, type)
    const currVal = getCellValue(itemId, columns[colIdx].key, type)
    return prevVal !== currVal && prevVal !== '—' && currVal !== '—'
  }

  function isChangedRow(itemId: string, type: 'conditions' | 'properties'): boolean {
    if (columns.length < 2) return false
    return columns.some((_, i) => i > 0 && isChangedCell(itemId, i, type))
  }

  const conditionGroups = {
    '공정 온도': test.template.conditionItems.filter(i => i.group === 'temperature'),
    '운전 조건': test.template.conditionItems.filter(i => i.group === 'operation'),
  }
  const propertyGroups = {
    '분석값': test.template.propertyItems,
  }

  function renderTable(
    groups: Record<string, typeof test.template.conditionItems>,
    type: 'conditions' | 'properties',
    sectionLabel: string
  ) {
    return (
      <div>
        <div className="px-3 py-2 bg-gray-200 text-xs font-bold text-gray-700">{sectionLabel}</div>
        {Object.entries(groups).map(([groupName, items]) => {
          const filteredItems = filterMode === 'changed'
            ? items.filter(item => isChangedRow(item.id, type))
            : items
          if (filteredItems.length === 0) return null
          return (
            <div key={groupName}>
              <div className="px-3 py-1.5 bg-gray-100 text-xs text-gray-500 font-medium">{groupName}</div>
              {filteredItems.map(item => {
                const target = type === 'conditions'
                  ? doneRuns[0]?.conditions[item.id]?.target
                  : doneRuns[0]?.properties[item.id]?.target
                const tolerance = type === 'conditions'
                  ? doneRuns[0]?.conditions[item.id]?.tolerance
                  : doneRuns[0]?.properties[item.id]?.tolerance
                return (
                  <div key={item.id} className="flex border-b border-gray-100">
                    <div className="w-28 flex-shrink-0 px-3 py-2">
                      <div className="text-xs text-gray-700 font-medium">{item.label}</div>
                      <div className="text-[10px] text-gray-400">
                        목표: {target ?? '—'} {tolerance ?? ''}
                      </div>
                    </div>
                    {columns.map((col, colIdx) => {
                      const val = getCellValue(item.id, col.key, type)
                      const changed = isChangedCell(item.id, colIdx, type)
                      const isError = val !== '—' && (val === '버블' || val === '외관불량')
                      return (
                        <div
                          key={col.key}
                          className={`flex-1 px-2 py-2 text-center text-xs border-l border-gray-100 ${
                            isError
                              ? 'bg-red-50 text-red-600 font-bold'
                              : changed
                              ? 'bg-yellow-50 text-orange-700 font-bold'
                              : 'text-gray-800'
                          }`}
                        >
                          {val}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#111111] text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(`/tests/${testId}`)} className="text-gray-300 text-lg">←</button>
        <span className="font-bold text-base flex-1 truncate">{test.name}</span>
      </div>

      {/* 탭 */}
      <div className="flex bg-white border-b border-gray-200">
        {(['compare', 'trend'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 ${
              activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'
            }`}
          >
            {tab === 'compare' ? '📊 차수비교' : '📈 트렌드'}
          </button>
        ))}
      </div>

      {activeTab === 'compare' && (
        <>
          {/* 비교 축 토글 + 필터 */}
          <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
            <div className="flex gap-1">
              {(['run', 'leg'] as const).map(a => (
                <button
                  key={a}
                  onClick={() => setAxis(a)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    axis === a ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {a === 'run' ? 'Run별 비교' : 'Leg별 비교'}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {(['all', 'changed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterMode(f)}
                  className={`px-2 py-1 rounded text-xs ${
                    filterMode === f ? 'bg-yellow-400 text-yellow-900 font-medium' : 'text-gray-500'
                  }`}
                >
                  {f === 'all' ? '전체 항목' : '변경 항목만'}
                </button>
              ))}
            </div>
          </div>

          {/* Leg 고정 선택 (Run별 비교 시) */}
          {axis === 'run' && (
            <div className="flex gap-1 px-4 py-1.5 bg-gray-50 border-b border-gray-100">
              <span className="text-xs text-gray-500 self-center mr-1">Leg 고정:</span>
              {allLegs.map(leg => (
                <button
                  key={leg}
                  onClick={() => setFixedLeg(leg)}
                  className={`px-2.5 py-1 rounded text-xs ${
                    fixedLeg === leg ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {leg}
                </button>
              ))}
            </div>
          )}

          {/* 테이블 헤더 */}
          <div className="flex bg-gray-800 text-white text-xs sticky top-0 z-10">
            <div className="w-28 flex-shrink-0 px-3 py-2">항목 / 목표(공차)</div>
            {columns.map(col => (
              <div key={col.key} className="flex-1 px-2 py-2 text-center">{col.label}</div>
            ))}
          </div>

          {/* 테이블 */}
          <div className="flex-1 overflow-y-auto">
            {renderTable(conditionGroups, 'conditions', '⚙️ 공정조건')}
            {renderTable(propertyGroups, 'properties', '🧪 물성평가')}
          </div>
        </>
      )}

      {activeTab === 'trend' && (
        <div className="flex-1 overflow-y-auto p-4">
          <TrendChart test={test} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/pages/Compare.tsx
git commit -m "feat: implement Compare screen with run/leg comparison table"
```

---

## Task 14: TrendChart 컴포넌트

**Files:**
- Create: `src/components/TrendChart.tsx`

- [ ] **Step 1: `src/components/TrendChart.tsx` 작성**

```tsx
import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend
} from 'recharts'
import type { LineTest } from '@/types'

interface Props {
  test: LineTest
}

const LEG_STYLES: Record<string, { stroke: string; strokeDasharray?: string }> = {
  A: { stroke: '#111111' },
  B: { stroke: '#2563eb', strokeDasharray: '8 4' },
  C: { stroke: '#16a34a', strokeDasharray: '3 3' },
}

export default function TrendChart({ test }: Props) {
  const allItems = [...test.template.conditionItems, ...test.template.propertyItems]
  const [selectedItemId, setSelectedItemId] = useState(allItems[0]?.id ?? '')

  const selectedItem = allItems.find(i => i.id === selectedItemId)
  const doneRuns = test.runs.filter(r => r.status === 'done' || r.status === 'active')
  const allLegs = Array.from(new Set(doneRuns.flatMap(r => r.legs)))

  const isCondition = test.template.conditionItems.some(i => i.id === selectedItemId)
  const firstRunItem = isCondition
    ? doneRuns[0]?.conditions[selectedItemId]
    : doneRuns[0]?.properties[selectedItemId]
  const target = firstRunItem ? parseFloat(String(firstRunItem.target)) : null

  const data = doneRuns.map(run => {
    const src = isCondition ? run.conditions[selectedItemId] : run.properties[selectedItemId]
    const point: Record<string, string | number> = { name: `R${run.id}` }
    for (const leg of allLegs) {
      const val = src?.actuals[leg]
      point[leg] = val !== undefined && val !== '' ? parseFloat(String(val)) : NaN
    }
    return point
  })

  return (
    <div>
      {/* 항목 선택 칩 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {allItems.map(item => (
          <button
            key={item.id}
            onClick={() => setSelectedItemId(item.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedItemId === item.id
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 차트 */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="text-sm font-medium text-gray-700 mb-3">
          {selectedItem?.label} ({selectedItem?.unit})
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ fontSize: 11, border: '1px solid #e5e7eb', borderRadius: 8 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {target !== null && !isNaN(target) && (
              <ReferenceLine
                y={target}
                stroke="#fbbf24"
                strokeDasharray="4 4"
                label={{ value: `목표 ${target}`, fill: '#f59e0b', fontSize: 10, position: 'right' }}
              />
            )}
            {allLegs.map(leg => (
              <Line
                key={leg}
                type="monotone"
                dataKey={leg}
                name={`Leg ${leg}`}
                stroke={LEG_STYLES[leg]?.stroke ?? '#666'}
                strokeDasharray={LEG_STYLES[leg]?.strokeDasharray}
                strokeWidth={2}
                dot={{ r: 4, fill: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 실행 확인**

Compare 화면 → 트렌드 탭 → 항목 칩 선택 → 꺾은선 차트 표시 확인.

- [ ] **Step 3: 커밋**

```bash
git add src/components/TrendChart.tsx
git commit -m "feat: add TrendChart with Recharts and target reference line"
```

---

## Task 15: PWA 설정

**Files:**
- Modify: `vite.config.ts`
- Create: `public/manifest-icon-192.png` (이미지 파일은 placeholder)

- [ ] **Step 1: vite-plugin-pwa 설치**

```bash
npm install -D vite-plugin-pwa
```

- [ ] **Step 2: `vite.config.ts`에 PWA 플러그인 추가**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Line Test Manager',
        short_name: 'LineTest',
        description: '공정 Line Test 차수별 데이터 입력 및 분석',
        theme_color: '#111111',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/manifest-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/manifest-icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
```

- [ ] **Step 3: 빌드 확인**

```bash
npm run build
```

Expected: dist 폴더 생성, 에러 없음.

- [ ] **Step 4: 전체 테스트 실행**

```bash
npx vitest run
```

Expected: 모든 테스트 PASS

- [ ] **Step 5: 최종 커밋**

```bash
git add -A
git commit -m "feat: add PWA configuration and complete Line Test Manager implementation"
```

---

## 완료 기준

- [ ] 모든 Vitest 테스트 PASS
- [ ] `npm run build` 에러 없음
- [ ] 홈 화면: 테스트 목록, 검색, FAB로 신규 생성
- [ ] TestDetail: 차수 목록, 진행 스트립, 새 차수 시작
- [ ] RunForm: 탭 전환, Leg 탭, 공차 이탈 즉시 표시, 이전 Run 복사, 임시저장
- [ ] Compare: Run별/Leg별 비교 테이블, 변경 항목 강조
- [ ] 트렌드: 항목 선택, Leg별 꺾은선, 목표값 기준선
