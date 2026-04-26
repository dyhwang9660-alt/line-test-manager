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
