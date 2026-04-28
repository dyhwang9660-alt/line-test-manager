import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import ProductSelect from '@/components/ProductSelect'

export default function RecipeList() {
  const navigate = useNavigate()
  const recipes = useAppStore(s => s.recipes)
  const createRecipe = useAppStore(s => s.createRecipe)
  const deleteRecipe = useAppStore(s => s.deleteRecipe)

  const [showNew, setShowNew] = useState(false)
  const [newProduct, setNewProduct] = useState('')
  const [newName, setNewName] = useState('')

  function handleCreate() {
    if (!newProduct.trim()) return
    const id = createRecipe(newName.trim() || newProduct.trim(), newProduct.trim())
    setNewName('')
    setNewProduct('')
    setShowNew(false)
    navigate(`/recipes/${id}`)
  }

  function handleCancel() {
    setShowNew(false)
    setNewName('')
    setNewProduct('')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#111111] text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-gray-300 text-lg">←</button>
        <span className="font-bold text-base flex-1">레시피 관리</span>
        <button
          onClick={() => setShowNew(true)}
          className="text-gray-300 text-sm px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          + 새 레시피
        </button>
      </div>

      {/* 새 레시피 입력 */}
      {showNew && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-2">
          {/* 제품명 먼저 (폴더 드롭다운) */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">제품명 *</label>
            <ProductSelect
              value={newProduct}
              onChange={setNewProduct}
              placeholder="제품 선택"
            />
          </div>
          {/* 레시피명 (선택) */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">레시피명 (비우면 제품명으로 자동 설정)</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-500 bg-gray-50"
              placeholder="예: PE-LLD Film 기본 조건"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') handleCancel() }}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCreate}
              disabled={!newProduct.trim()}
              className="flex-1 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium disabled:opacity-40"
            >
              생성
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-500 text-sm rounded-xl border border-gray-200"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 레시피 목록 */}
      <div className="flex-1 px-4 py-3">
        {recipes.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-20 space-y-2">
            <div className="text-4xl">📋</div>
            <div>레시피를 만들어보세요</div>
            <div className="text-xs text-gray-300">제품별 공정 Target과 공차를 저장합니다</div>
            <button
              onClick={() => setShowNew(true)}
              className="mt-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm"
            >
              + 새 레시피 만들기
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recipes.map(recipe => (
              <div
                key={recipe.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                  className="w-full text-left px-4 py-3.5 flex items-center gap-3"
                >
                  <span className="text-xl">📋</span>
                  <div className="flex-1 min-w-0">
                    {/* 제품명 최상단 강조 */}
                    {recipe.productName && (
                      <div className="text-xs font-semibold text-blue-600 truncate mb-0.5">
                        {recipe.productName}
                      </div>
                    )}
                    <div className="text-sm font-bold text-gray-900 truncate">{recipe.name}</div>
                    <div className="text-xs text-gray-300 mt-0.5">
                      {new Date(recipe.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </div>
                  </div>
                  <span className="text-gray-300 text-sm flex-shrink-0">›</span>
                </button>
                <div className="border-t border-gray-100 flex">
                  <button
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                    className="flex-1 py-2 text-xs text-gray-500 hover:bg-gray-50"
                  >
                    ✏️ 편집
                  </button>
                  <div className="w-px bg-gray-100" />
                  <button
                    onClick={() => {
                      if (confirm(`"${recipe.name}" 레시피를 삭제할까요?`))
                        deleteRecipe(recipe.id)
                    }}
                    className="flex-1 py-2 text-xs text-red-400 hover:bg-red-50"
                  >
                    🗑 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
