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
