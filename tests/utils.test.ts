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
