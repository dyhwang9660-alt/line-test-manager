import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import TrendChart from '@/components/TrendChart'
import type { ConditionItem } from '@/types'

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
  const [fixedRun, setFixedRun] = useState<number>(1)

  if (!test) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        테스트를 찾을 수 없습니다
      </div>
    )
  }

  const doneRuns = test.runs.filter(r => r.status === 'done' || r.status === 'active')
  const allLegs = Array.from(new Set(doneRuns.flatMap(r => r.legs)))

  const columns =
    axis === 'run'
      ? doneRuns.map(r => ({ key: String(r.id), label: `R${r.id}` }))
      : allLegs.map(leg => ({ key: leg, label: `Leg ${leg}` }))

  function getCellValue(
    itemId: string,
    colKey: string,
    type: 'conditions' | 'properties'
  ): string {
    if (axis === 'run') {
      const run = doneRuns.find(r => String(r.id) === colKey)
      const val =
        type === 'conditions'
          ? run?.conditions[itemId]?.actuals[fixedLeg]
          : run?.properties[itemId]?.actuals[fixedLeg]
      return val !== undefined && val !== '' ? String(val) : '—'
    } else {
      const run = doneRuns.find(r => r.id === fixedRun)
      const val =
        type === 'conditions'
          ? run?.conditions[itemId]?.actuals[colKey]
          : run?.properties[itemId]?.actuals[colKey]
      return val !== undefined && val !== '' ? String(val) : '—'
    }
  }

  function isChangedCell(
    itemId: string,
    colIdx: number,
    type: 'conditions' | 'properties'
  ): boolean {
    if (axis !== 'run' || colIdx === 0) return false
    const prevVal = getCellValue(itemId, columns[colIdx - 1].key, type)
    const currVal = getCellValue(itemId, columns[colIdx].key, type)
    return prevVal !== currVal && prevVal !== '—' && currVal !== '—'
  }

  function isChangedRow(itemId: string, type: 'conditions' | 'properties'): boolean {
    if (columns.length < 2) return false
    return columns.some((_, i) => i > 0 && isChangedCell(itemId, i, type))
  }

  const conditionGroups: Record<string, ConditionItem[]> = {
    '공정 온도': test.template.conditionItems.filter(i => i.group === 'temperature'),
    '운전 조건': test.template.conditionItems.filter(i => i.group === 'operation'),
  }
  const propertyGroups: Record<string, ConditionItem[]> = {
    '분석값': test.template.propertyItems,
  }

  function renderTable(
    groups: Record<string, ConditionItem[]>,
    type: 'conditions' | 'properties',
    sectionLabel: string
  ) {
    return (
      <div>
        <div className="px-3 py-2 bg-gray-200 text-xs font-bold text-gray-700">
          {sectionLabel}
        </div>
        {Object.entries(groups).map(([groupName, items]) => {
          const filteredItems =
            filterMode === 'changed'
              ? items.filter(item => isChangedRow(item.id, type))
              : items
          if (filteredItems.length === 0) return null
          return (
            <div key={groupName}>
              <div className="px-3 py-1.5 bg-gray-100 text-xs text-gray-500 font-medium">
                {groupName}
              </div>
              {filteredItems.map(item => {
                const target =
                  type === 'conditions'
                    ? doneRuns[0]?.conditions[item.id]?.target
                    : doneRuns[0]?.properties[item.id]?.target
                const tolerance =
                  type === 'conditions'
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
                      return (
                        <div
                          key={col.key}
                          className={`flex-1 px-2 py-2 text-center text-xs border-l border-gray-100 ${
                            changed
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
        <button
          onClick={() => navigate(`/tests/${testId}`)}
          className="text-gray-300 text-lg"
        >
          ←
        </button>
        <span className="font-bold text-base flex-1 truncate">{test.name}</span>
      </div>

      {/* 탭 */}
      <div className="flex bg-white border-b border-gray-200">
        {(['compare', 'trend'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 ${
              activeTab === tab
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500'
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
                    filterMode === f
                      ? 'bg-yellow-400 text-yellow-900 font-medium'
                      : 'text-gray-500'
                  }`}
                >
                  {f === 'all' ? '전체 항목' : '변경 항목만'}
                </button>
              ))}
            </div>
          </div>

          {/* Leg 고정 (Run별 비교 시) */}
          {axis === 'run' && allLegs.length > 0 && (
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

          {/* Run 고정 (Leg별 비교 시) */}
          {axis === 'leg' && doneRuns.length > 0 && (
            <div className="flex gap-1 px-4 py-1.5 bg-gray-50 border-b border-gray-100">
              <span className="text-xs text-gray-500 self-center mr-1">Run 고정:</span>
              {doneRuns.map(r => (
                <button
                  key={r.id}
                  onClick={() => setFixedRun(r.id)}
                  className={`px-2.5 py-1 rounded text-xs ${
                    fixedRun === r.id ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  R{r.id}
                </button>
              ))}
            </div>
          )}

          {doneRuns.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              저장된 차수가 없습니다
            </div>
          ) : (
            <>
              {/* 테이블 헤더 */}
              <div className="flex bg-gray-800 text-white text-xs sticky top-0 z-10">
                <div className="w-28 flex-shrink-0 px-3 py-2">항목 / 목표(공차)</div>
                {columns.map(col => (
                  <div key={col.key} className="flex-1 px-2 py-2 text-center">
                    {col.label}
                  </div>
                ))}
              </div>

              {/* 테이블 내용 */}
              <div className="flex-1 overflow-y-auto">
                {renderTable(conditionGroups, 'conditions', '⚙️ 공정조건')}
                {renderTable(propertyGroups, 'properties', '🧪 물성평가')}
              </div>
            </>
          )}
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
