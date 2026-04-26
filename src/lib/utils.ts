import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
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
        const prevNum = parseFloat(String(prevVal))
        const currNum = parseFloat(String(currVal))
        const diff = !isNaN(prevNum) && !isNaN(currNum)
          ? (currNum - prevNum > 0 ? `+${currNum - prevNum}` : `${currNum - prevNum}`)
          : String(currVal)
        chips.push(`${item.label} ${diff}${item.unit}`)
        break
      }
    }
  }
  return chips
}
