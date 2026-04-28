import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { DEFAULT_CONDITION_ITEMS, DEFAULT_PROPERTY_ITEMS } from '@/lib/defaults'
import type { RecipeValue } from '@/types'

const TABS = ['공정조건', '물성평가'] as const
type Tab = typeof TABS[number]

const CONDITION_GROUPS: Record<string, string[]> = {
  '공정 온도': ['t1', 't2', 't3', 't4', 'die'],
  '운전 조건': ['rpm', 'pressure', 'feed', 'vacuum', 'cooling'],
}

// ─── 레시피 항목 행 ────────────────────────────────────────────────
interface RecipeRowProps {
  label: string
  unit: string
  value: RecipeValue
  onChange: (patch: Partial<RecipeValue>) => void
}

function RecipeRow({ label, unit, value, onChange }: RecipeRowProps) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-gray-100 bg-white last:border-0">
      {/* 항목명 */}
      <div className="w-24 min-w-0">
        <div className="text-xs font-medium text-gray-800 truncate">{label}</div>
        {unit && <div className="text-[10px] text-gray-400">{unit}</div>}
      </div>

      {/* Target */}
      <input
        className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center outline-none focus:border-gray-500 bg-gray-50"
        placeholder="Target"
        value={String(value.target ?? '')}
        onChange={e => onChange({ target: e.target.value })}
      />

      {/* 공차 */}
      <input
        className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center outline-none focus:border-gray-500 bg-gray-50"
        placeholder="±0"
        value={value.tolerance ?? ''}
        onChange={e => onChange({ tolerance: e.target.value })}
      />
    </div>
  )
}

// ─── RecipeEditor 메인 ─────────────────────────────────────────────
export default function RecipeEditor() {
  const { recipeId } = useParams<{ recipeId: string }>()
  const navigate = useNavigate()
  const recipes = useAppStore(s => s.recipes)
  const updateRecipe = useAppStore(s => s.updateRecipe)
  const setRecipeValue = useAppStore(s => s.setRecipeValue)

  const recipe = recipes.find(r => r.id === recipeId)

  const [activeTab, setActiveTab] = useState<Tab>('공정조건')
  const [editingMeta, setEditingMeta] = useState(false)
  const [metaName, setMetaName] = useState(recipe?.name ?? '')
  const [metaProduct, setMetaProduct] = useState(recipe?.productName ?? '')

  if (!recipe) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        레시피를 찾을 수 없습니다
      </div>
    )
  }

  function handleMetaSave() {
    if (!metaName.trim()) return
    updateRecipe(recipe!.id, { name: metaName.trim(), productName: metaProduct.trim() })
    setEditingMeta(false)
  }

  function getValue(kind: 'conditions' | 'properties', itemId: string): RecipeValue {
    return recipe![kind][itemId] ?? { target: '', tolerance: '±0' }
  }

  const conditionItems = DEFAULT_CONDITION_ITEMS
  const propertyItems = DEFAULT_PROPERTY_ITEMS

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#111111] text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/recipes')} className="text-gray-300 text-lg">←</button>
        <div className="flex-1 min-w-0">
          {editingMeta ? (
            <div className="flex flex-col gap-1">
              <input
                autoFocus
                className="bg-white/10 rounded px-2 py-0.5 text-sm font-bold outline-none w-full"
                value={metaName}
                onChange={e => setMetaName(e.target.value)}
                onBlur={handleMetaSave}
                onKeyDown={e => { if (e.key === 'Enter') handleMetaSave(); if (e.key === 'Escape') setEditingMeta(false) }}
              />
              <input
                className="bg-white/10 rounded px-2 py-0.5 text-xs outline-none w-full"
                value={metaProduct}
                onChange={e => setMetaProduct(e.target.value)}
                onBlur={handleMetaSave}
                placeholder="제품명"
              />
            </div>
          ) : (
            <button onClick={() => { setMetaName(recipe.name); setMetaProduct(recipe.productName); setEditingMeta(true) }} className="text-left w-full">
              <div className="font-bold text-sm truncate">{recipe.name}</div>
              {recipe.productName && <div className="text-xs text-gray-400 truncate">{recipe.productName}</div>}
            </button>
          )}
        </div>
        <span className="text-gray-400 text-xs flex-shrink-0">탭하여 편집</span>
      </div>

      {/* 컬럼 헤더 설명 */}
      <div className="bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-wide">
        <div className="w-24">항목</div>
        <div className="w-20 text-center">Target</div>
        <div className="w-20 text-center">공차</div>
        <div className="flex-1 text-right text-gray-300">예) ±2 · ≥0.918 · &lt;5</div>
      </div>

      {/* 탭 */}
      <div className="flex bg-white border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500'
            }`}
          >
            {tab === '공정조건' ? '⚙️ 공정조건' : '🧪 물성평가'}
          </button>
        ))}
      </div>

      {/* 입력 영역 */}
      <div className="flex-1 overflow-y-auto pb-10">
        {activeTab === '공정조건' && (
          <div>
            {Object.entries(CONDITION_GROUPS).map(([groupName, ids]) => (
              <div key={groupName}>
                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100">
                  {groupName}
                </div>
                {conditionItems.filter(i => ids.includes(i.id)).map(item => (
                  <RecipeRow
                    key={item.id}
                    label={item.label}
                    unit={item.unit}
                    value={getValue('conditions', item.id)}
                    onChange={patch => setRecipeValue(recipe.id, 'conditions', item.id, patch)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === '물성평가' && (
          <div>
            <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100">
              분석값
            </div>
            {propertyItems.map(item => (
              <RecipeRow
                key={item.id}
                label={item.label}
                unit={item.unit}
                value={getValue('properties', item.id)}
                onChange={patch => setRecipeValue(recipe.id, 'properties', item.id, patch)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
