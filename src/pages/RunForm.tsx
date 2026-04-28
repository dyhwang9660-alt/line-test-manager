import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import FormRow from '@/components/FormRow'
import LegTabs from '@/components/LegTabs'
import ChangedChips from '@/components/ChangedChips'
import { buildChangedChips } from '@/lib/utils'
import type { Recipe } from '@/types'

const PHOTO_TAGS = ['외관불량', '버블', '압력이상', '온도이상', '이물질', '기타']
const MAIN_TABS = ['공정조건', '물성평가', '사진·특이점'] as const
type MainTab = typeof MAIN_TABS[number]

// ─── 레시피 선택 바텀시트 ─────────────────────────────────────────
function RecipePickerSheet({
  recipes,
  onSelect,
  onClose,
}: {
  recipes: Recipe[]
  onSelect: (recipe: Recipe) => void
  onClose: () => void
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-30" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="px-5 pb-2 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900">레시피 불러오기</h2>
          <p className="text-xs text-gray-400 mt-0.5">불러오면 Target과 공차가 채워집니다 (실측값 유지)</p>
        </div>
        <div className="overflow-y-auto flex-1 pb-6">
          {recipes.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10">
              저장된 레시피가 없습니다
            </div>
          ) : (
            recipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => onSelect(recipe)}
                className="w-full text-left px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50 last:border-0"
              >
                <div className="text-sm font-semibold text-gray-900">{recipe.name}</div>
                {recipe.productName && (
                  <div className="text-xs text-gray-400 mt-0.5">{recipe.productName}</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default function RunForm() {
  const { testId, runId } = useParams<{ testId: string; runId: string }>()
  const navigate = useNavigate()
  const tests = useAppStore(s => s.tests)
  const saveRun = useAppStore(s => s.saveRun)
  const saveDraft = useAppStore(s => s.saveDraft)
  const clearDraft = useAppStore(s => s.clearDraft)
  const drafts = useAppStore(s => s.drafts)
  const recipes = useAppStore(s => s.recipes)

  const test = tests.find(t => t.id === testId)
  const run = test?.runs.find(r => r.id === Number(runId))
  const prevRun = run ? test?.runs.find(r => r.id === run.id - 1) : undefined

  const draftKey = `${testId}-${runId}`
  const draft = drafts[draftKey]

  const [activeTab, setActiveTab] = useState<MainTab>('공정조건')
  const [activeLeg, setActiveLeg] = useState('A')
  const [legs, setLegs] = useState<string[]>(run?.legs ?? ['A'])
  const [conditions, setConditions] = useState(draft?.conditions ?? run?.conditions ?? {})
  const [properties, setProperties] = useState(draft?.properties ?? run?.properties ?? {})
  const [recipePickerOpen, setRecipePickerOpen] = useState(false)
  const [memo, setMemo] = useState(draft?.memo ?? run?.memo ?? '')
  const [tags, setTags] = useState<string[]>(draft?.tags ?? run?.tags ?? [])

  // 자동 임시저장
  useEffect(() => {
    saveDraft(draftKey, { conditions, properties, memo, tags, legs })
  }, [conditions, properties, memo, tags, legs, saveDraft, draftKey])

  const handleAddLeg = useCallback(() => {
    if (legs.length >= 6) return
    const next = String.fromCharCode(65 + legs.length)
    setLegs(prev => [...prev, next])
    setConditions(prev => {
      const updated = { ...prev }
      for (const key of Object.keys(updated)) {
        updated[key] = { ...updated[key], actuals: { ...updated[key].actuals, [next]: '' } }
      }
      return updated
    })
    setProperties(prev => {
      const updated = { ...prev }
      for (const key of Object.keys(updated)) {
        updated[key] = { ...updated[key], actuals: { ...updated[key].actuals, [next]: '' } }
      }
      return updated
    })
    setActiveLeg(next)
  }, [legs])

  function updateActual(
    type: 'conditions' | 'properties',
    itemId: string,
    leg: string,
    val: string
  ) {
    if (type === 'conditions') {
      setConditions(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          actuals: { ...prev[itemId]?.actuals, [leg]: val },
        },
      }))
    } else {
      setProperties(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          actuals: { ...prev[itemId]?.actuals, [leg]: val },
        },
      }))
    }
  }

  function updateTolerance(type: 'conditions' | 'properties', itemId: string, val: string) {
    if (type === 'conditions') {
      setConditions(prev => ({ ...prev, [itemId]: { ...prev[itemId], tolerance: val } }))
    } else {
      setProperties(prev => ({ ...prev, [itemId]: { ...prev[itemId], tolerance: val } }))
    }
  }

  function handleCopyPrev() {
    if (!prevRun) return
    setConditions(JSON.parse(JSON.stringify(prevRun.conditions)))
    setProperties(JSON.parse(JSON.stringify(prevRun.properties)))
  }

  function applyRecipe(recipe: Recipe) {
    // Target·공차만 덮어쓰고 actuals(실측값)은 보존
    setConditions(prev => {
      const updated = { ...prev }
      for (const [itemId, rv] of Object.entries(recipe.conditions)) {
        updated[itemId] = {
          target: rv.target,
          tolerance: rv.tolerance,
          actuals: updated[itemId]?.actuals ?? Object.fromEntries(legs.map(l => [l, ''])),
        }
      }
      return updated
    })
    setProperties(prev => {
      const updated = { ...prev }
      for (const [itemId, rv] of Object.entries(recipe.properties)) {
        updated[itemId] = {
          target: rv.target,
          tolerance: rv.tolerance,
          actuals: updated[itemId]?.actuals ?? Object.fromEntries(legs.map(l => [l, ''])),
        }
      }
      return updated
    })
    setRecipePickerOpen(false)
  }

  function handleSave() {
    if (!testId || !run) return
    const chips = prevRun
      ? buildChangedChips(prevRun.conditions, conditions, test?.template.conditionItems ?? [])
      : []
    saveRun(testId, run.id, {
      conditions,
      properties,
      memo,
      tags,
      legs,
      status: 'done',
      hasConditionChange: chips.length > 0,
      note: chips.slice(0, 3).join(', '),
    })
    clearDraft(draftKey)
    navigate(`/tests/${testId}`)
  }

  if (!test || !run) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        차수를 찾을 수 없습니다
      </div>
    )
  }

  const changedChips = prevRun
    ? buildChangedChips(prevRun.conditions, conditions, test.template.conditionItems)
    : []

  const conditionGroups: Record<string, typeof test.template.conditionItems> = {
    '공정 온도': test.template.conditionItems.filter(i => i.group === 'temperature'),
    '운전 조건': test.template.conditionItems.filter(i => i.group === 'operation'),
  }
  const propertyGroups: Record<string, typeof test.template.propertyItems> = {
    '분석값': test.template.propertyItems,
  }

  function isChanged(type: 'conditions' | 'properties', itemId: string) {
    if (!prevRun) return false
    const prev = type === 'conditions' ? prevRun.conditions[itemId] : prevRun.properties[itemId]
    const curr = type === 'conditions' ? conditions[itemId] : properties[itemId]
    if (!prev || !curr) return false
    return String(prev.actuals[activeLeg] ?? '') !== String(curr.actuals[activeLeg] ?? '')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#111111] text-white px-4 py-3 flex items-center gap-2">
        <button
          onClick={() => navigate(`/tests/${testId}`)}
          className="text-gray-300 text-lg flex-shrink-0"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 truncate">{test.name}</div>
          <div className="font-bold text-sm">{run.label}</div>
        </div>
        <button
          onClick={() => setRecipePickerOpen(true)}
          className="text-xs text-blue-300 border border-blue-400 px-2 py-1 rounded flex-shrink-0"
        >
          📋 레시피
        </button>
        <button
          onClick={() => saveDraft(draftKey, { conditions, properties, memo, tags, legs })}
          className="text-xs text-yellow-400 border border-yellow-400 px-2 py-1 rounded flex-shrink-0"
        >
          임시저장
        </button>
      </div>

      {/* 변경 칩 */}
      <ChangedChips chips={changedChips} />

      {/* 메인 탭 */}
      <div className="flex bg-white border-b border-gray-200">
        {MAIN_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500'
            }`}
          >
            {tab === '공정조건' ? '⚙️ 공정조건' : tab === '물성평가' ? '🧪 물성평가' : '📷 사진·특이점'}
          </button>
        ))}
      </div>

      {/* Leg 탭 (사진 탭 제외) */}
      {activeTab !== '사진·특이점' && (
        <LegTabs legs={legs} activeLeg={activeLeg} onSelect={setActiveLeg} onAdd={handleAddLeg} />
      )}

      {/* 컬럼 헤더 */}
      {activeTab !== '사진·특이점' && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200 text-[10px] text-gray-500 uppercase tracking-wide">
          <div className="w-2" />
          <div className="w-20">항목</div>
          <div className="w-12 text-center">Target</div>
          <div className="w-11 text-center">공차</div>
          <div className="flex-1 text-right">실측값 (Leg {activeLeg})</div>
        </div>
      )}

      {/* 폼 영역 */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === '공정조건' && (
          <div>
            {Object.entries(conditionGroups).map(([groupName, items]) => (
              <div key={groupName}>
                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100">
                  {groupName}
                </div>
                {items.map(item => (
                  <FormRow
                    key={item.id}
                    label={item.label}
                    unit={item.unit}
                    target={conditions[item.id]?.target ?? ''}
                    tolerance={conditions[item.id]?.tolerance ?? '±0'}
                    actual={conditions[item.id]?.actuals[activeLeg] ?? ''}
                    changed={isChanged('conditions', item.id)}
                    onActualChange={val => updateActual('conditions', item.id, activeLeg, val)}
                    onToleranceChange={val => updateTolerance('conditions', item.id, val)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === '물성평가' && (
          <div>
            {Object.entries(propertyGroups).map(([groupName, items]) => (
              <div key={groupName}>
                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100">
                  {groupName}
                </div>
                {items.map(item => (
                  <FormRow
                    key={item.id}
                    label={item.label}
                    unit={item.unit}
                    target={properties[item.id]?.target ?? ''}
                    tolerance={properties[item.id]?.tolerance ?? '±0'}
                    actual={properties[item.id]?.actuals[activeLeg] ?? ''}
                    changed={isChanged('properties', item.id)}
                    onActualChange={val => updateActual('properties', item.id, activeLeg, val)}
                    onToleranceChange={val => updateTolerance('properties', item.id, val)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === '사진·특이점' && (
          <div className="p-4 space-y-4">
            {/* 사진 */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">사진</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <label className="w-20 h-20 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer text-xs gap-1">
                  <span className="text-2xl">📷</span>
                  <span>추가</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = ev => {
                        const dataUrl = ev.target?.result as string
                        if (!dataUrl) return
                        saveRun(testId!, run.id, {
                          photos: [
                            ...run.photos,
                            { id: crypto.randomUUID(), dataUrl, caption: '' },
                          ],
                        })
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                </label>
              </div>
            </div>

            {/* 태그 */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">특이점 태그</div>
              <div className="flex flex-wrap gap-2">
                {PHOTO_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() =>
                      setTags(prev =>
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      tags.includes(tag)
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 메모 */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">특이점 메모</div>
              <textarea
                className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none outline-none focus:border-gray-500"
                rows={4}
                placeholder="특이사항을 입력하세요..."
                value={memo}
                onChange={e => setMemo(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto flex gap-2 px-4 py-3 bg-white border-t border-gray-200 z-10">
        <button
          onClick={handleCopyPrev}
          disabled={!prevRun}
          className="flex-1 py-2.5 text-sm border border-gray-300 rounded-xl text-gray-700 disabled:opacity-40"
        >
          ← 이전 Run 복사
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 text-sm bg-gray-900 text-white rounded-xl font-medium"
        >
          저장 →
        </button>
      </div>

      {/* 레시피 선택 바텀시트 */}
      {recipePickerOpen && (
        <RecipePickerSheet
          recipes={recipes}
          onSelect={applyRecipe}
          onClose={() => setRecipePickerOpen(false)}
        />
      )}
    </div>
  )
}
