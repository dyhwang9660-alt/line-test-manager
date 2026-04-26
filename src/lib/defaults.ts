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
