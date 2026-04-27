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

export interface Folder {
  id: string
  name: string
  createdAt: string
}

export interface LineTest {
  id: string
  name: string
  productName: string
  status: TestStatus
  runs: Run[]
  template: Template
  createdAt: string
  folderId?: string
}

export type Draft = Partial<Pick<Run, 'conditions' | 'properties' | 'photos' | 'memo' | 'tags' | 'legs'>>
