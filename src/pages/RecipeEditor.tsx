import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { DEFAULT_CONDITION_ITEMS, DEFAULT_PROPERTY_ITEMS } from '@/lib/defaults'
import ProductSelect from '@/components/ProductSelect'
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
      <div className="w-24 min-w-0">
        <div className="text-xs font-medium text-gray-800 truncate">{label}</div>
        {unit && <div className="text-[10px] text-gray-400">{unit}</div>}
      </div>
      <input
        className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center outline-none focus:border-gray-500 bg-gray-50"
        placeholder="Target"
        value={String(value.target ?? '')}
        onChange={e => onChange({ target: e.target.value })}
      />
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
  const [metaProduct, setMetaProduct] = useState(recipe?.productName ?? '')
  const [metaName, setMetaName] = useState(recipe?.name ?? '')

  if (!recipe) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        레시피를 찾을 수 없습니다
      </div>
    )
  }

  function handleMetaSave() {
    if (!metaProduct.trim()) return
    updateRecipe(recipe!.id, {
      productName: metaProduct.trim(),
      name: metaName.trim() || metaProduct.trim(),
    })
    setEditingMeta(false)
  }

  function getValue(kind: 'conditions' | 'properties', itemId: string): RecipeValue {
    return recipe![kind][itemId] ?? { target: '', tolerance: '±0' }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#111111] text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/recipes')} className="text-gray-300 text-lg flex-shrink-0">←</button>

        {editingMeta ? (
          /* 편집 모드 */
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            {/* 제품명 먼저 */}
            <div>
              <div className="text-[10px] text-gray-400 mb-0.5">제품명</div>
              <ProductSelect
                value={metaProduct}
                onChange={setMetaProduct}
                placeholder="제품 선택"
                className="!py-1.5 !text-xs"
              />
            </div>
            <div>
              <div className="text-[10px] text-gray-400 mb-0.5">레시피명</div>
              <input
                className="w-full bg-white/10 rounded px-2 py-1 text-xs outline-none"
                value={metaName}
                onChange={e => setMetaName(e.target.value)}
                placeholder={metaProduct || '레시피명'}
                onKeyDown={e => { if (e.key === 'Enter') handleMetaSave(); if (e.key === 'Escape') setEditingMeta(false) }}
              />
            </div>
          </div>
        ) : (
          /* 보기 모드 — 제품명 상단 */
          <button
            onClick={() => {
              setMetaProduct(recipe.productName)
              setMetaName(recipe.name)
              setEditingMeta(true)
            }}
            className="flex-1 text-left min-w-0"
          >
            {recipe.productName && (
              <div className="text-[11px] text-blue-300 font-semibold truncate">{recipe.productName}</div>
            )}
            <div className="font-bold text-sm truncate">{recipe.name}</div>
          </button>
        )}

        {editingMeta ? (
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={handleMetaSave}
              disabled={!metaProduct.trim()}
              className="text-xs bg-white text-gray-900 px-2 py-1 rounded-lg font-medium disabled:opacity-40"
            >
              저장
            </button>
            <button
              onClick={() => setEditingMeta(false)}
              className="text-xs text-gray-400 px-2 py-1 rounded-lg"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setMetaProduct(recipe.productName)
              setMetaName(recipe.name)
              setEditingMeta(true)
            }}
            className="text-gray-400 text-xs flex-shrink-0 px-2 py-1 rounded-lg hover:bg-white/10"
          >
            ✏️
          </button>
        )}
      </div>

      {/* 컬럼 헤더 */}
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
                {DEFAULT_CONDITION_ITEMS.filter(i => ids.includes(i.id)).map(item => (
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
            {DEFAULT_PROPERTY_ITEMS.map(item => (
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
