import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { LineTest } from '@/types'

interface Props {
  test: LineTest
}

const LEG_STYLES: Record<string, { stroke: string; strokeDasharray?: string }> = {
  A: { stroke: '#111111' },
  B: { stroke: '#2563eb', strokeDasharray: '8 4' },
  C: { stroke: '#16a34a', strokeDasharray: '3 3' },
  D: { stroke: '#dc2626', strokeDasharray: '6 2' },
  E: { stroke: '#7c3aed', strokeDasharray: '2 2' },
  F: { stroke: '#d97706', strokeDasharray: '10 3' },
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
          {selectedItem?.label}
          {selectedItem?.unit ? ` (${selectedItem.unit})` : ''}
        </div>
        {doneRuns.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
            저장된 차수 데이터가 없습니다
          </div>
        ) : (
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
                  label={{
                    value: `목표 ${target}`,
                    fill: '#f59e0b',
                    fontSize: 10,
                    position: 'right',
                  }}
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
        )}
      </div>
    </div>
  )
}
