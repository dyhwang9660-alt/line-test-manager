import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import RunProgressStrip from '@/components/RunProgressStrip'
import ProductSelect from '@/components/ProductSelect'
import type { Run } from '@/types'

// ─── Run 행 ───────────────────────────────────────────────────────
function RunItem({ run, testId }: { run: Run; testId: string }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/tests/${testId}/runs/${run.id}`)}
      className={`w-full text-left rounded-xl px-4 py-3 mb-2 border ${
        run.status === 'active'
          ? 'bg-[#fff8e0] border-[#fbbf24]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-900">{run.label}</span>
          {run.hasConditionChange && (
            <span className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-300 px-1.5 py-0.5 rounded-full">
              조건변경
            </span>
          )}
          {run.status === 'active' && (
            <span className="text-xs bg-red-100 text-red-700 border border-red-300 px-1.5 py-0.5 rounded-full">
              진행중
            </span>
          )}
        </div>
        <span className="text-gray-400">›</span>
      </div>
      {run.note && (
        <div className="text-xs text-gray-500 mt-1">{run.note}</div>
      )}
      <div className="text-xs text-gray-400 mt-0.5">
        {new Date(run.startTime).toLocaleDateString('ko-KR', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </button>
  )
}

// ─── 편집 바텀시트 ────────────────────────────────────────────────
interface EditSheetProps {
  testId: string
  onClose: () => void
}

function EditSheet({ testId, onClose }: EditSheetProps) {
  const navigate = useNavigate()
  const tests = useAppStore(s => s.tests)
  const folders = useAppStore(s => s.folders)
  const updateTest = useAppStore(s => s.updateTest)
  const deleteTest = useAppStore(s => s.deleteTest)

  const test = tests.find(t => t.id === testId)!

  const [name, setName] = useState(test.name)
  const [productName, setProductName] = useState(test.productName)
  const [folderId, setFolderId] = useState(test.folderId ?? '')
  const [status, setStatus] = useState<'active' | 'done'>(test.status)
  const [memo, setMemo] = useState(test.memo ?? '')

  function handleSave() {
    updateTest(testId, {
      name: name.trim() || test.name,
      productName: productName.trim(),
      folderId: folderId || undefined,
      status,
      memo: memo.trim() || undefined,
    })
    onClose()
  }

  function handleDelete() {
    if (!confirm(`"${test.name}" 테스트를 삭제할까요?\n모든 Run 데이터가 삭제됩니다.`)) return
    deleteTest(testId)
    navigate('/', { replace: true })
  }

  return (
    <>
      {/* 딤 배경 */}
      <div
        className="fixed inset-0 bg-black/40 z-30"
        onClick={onClose}
      />

      {/* 시트 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white rounded-t-2xl shadow-2xl">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="px-5 pb-6">
          <h2 className="text-base font-bold text-gray-900 mb-4 mt-1">테스트 편집</h2>

          {/* 테스트명 */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">테스트명 *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-500 bg-gray-50"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="테스트명을 입력하세요"
            />
          </div>

          {/* 제품명 */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">제품명</label>
            <ProductSelect
              value={productName}
              onChange={setProductName}
              placeholder="제품 선택"
            />
          </div>

          {/* 폴더 */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">폴더</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-gray-500"
              value={folderId}
              onChange={e => setFolderId(e.target.value)}
            >
              <option value="">폴더 없음 (미분류)</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* 상태 */}
          <div className="mb-5">
            <label className="text-xs text-gray-500 mb-2 block">테스트 상태</label>
            <div className="flex gap-2">
              <button
                onClick={() => setStatus('active')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  status === 'active'
                    ? 'bg-yellow-400 border-yellow-400 text-yellow-900'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                🟡 진행중
              </button>
              <button
                onClick={() => setStatus('done')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  status === 'done'
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                ✅ 완료
              </button>
            </div>
          </div>

          {/* 메모 */}
          <div className="mb-5">
            <label className="text-xs text-gray-500 mb-2 block">메모</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-500 bg-gray-50 resize-none"
              rows={3}
              placeholder="테스트 목적, 특이사항 등..."
              value={memo}
              onChange={e => setMemo(e.target.value)}
            />
          </div>

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium text-sm mb-2 disabled:opacity-40"
          >
            저장
          </button>

          {/* 삭제 버튼 */}
          <button
            onClick={handleDelete}
            className="w-full py-3 text-red-500 rounded-xl text-sm font-medium border border-red-200 hover:bg-red-50 transition-colors"
          >
            테스트 삭제
          </button>
        </div>
      </div>
    </>
  )
}

// ─── TestDetail 메인 ──────────────────────────────────────────────
export default function TestDetail() {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const tests = useAppStore(s => s.tests)
  const addRun = useAppStore(s => s.addRun)

  const [editOpen, setEditOpen] = useState(false)

  const test = tests.find(t => t.id === testId)

  if (!test) return (
    <div className="flex items-center justify-center h-screen text-gray-400">
      테스트를 찾을 수 없습니다
    </div>
  )

  function handleAddRun() {
    if (!testId) return
    const runId = addRun(testId)
    navigate(`/tests/${testId}/runs/${runId}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#111111] text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-gray-300 text-lg">←</button>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base truncate">{test.name}</div>
          {test.productName && (
            <div className="text-xs text-gray-400 truncate">{test.productName}</div>
          )}
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="text-gray-300 text-sm px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          편집
        </button>
      </div>

      {/* 진행 스트립 */}
      <div className="bg-white border-b border-gray-100">
        <RunProgressStrip runs={test.runs} />
      </div>

      {/* 테스트 메모 */}
      {test.memo && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 flex gap-2 items-start">
          <span className="text-amber-400 text-sm flex-shrink-0 mt-0.5">📝</span>
          <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap">{test.memo}</p>
        </div>
      )}

      {/* 비교/트렌드 버튼 */}
      {test.runs.length > 0 && (
        <div className="flex gap-2 px-4 py-2 bg-white border-b border-gray-100">
          <button
            onClick={() => navigate(`/tests/${testId}/compare`)}
            className="flex-1 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700"
          >
            📊 비교 보기
          </button>
          <button
            onClick={() => navigate(`/tests/${testId}/compare?tab=trend`)}
            className="flex-1 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700"
          >
            📈 트렌드
          </button>
        </div>
      )}

      {/* Run 목록 */}
      <div className="flex-1 px-4 py-3 pb-24">
        {test.runs.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-16">
            첫 번째 차수를 시작해보세요
          </div>
        )}
        {[...test.runs].reverse().map(run => (
          <RunItem key={run.id} run={run} testId={test.id} />
        ))}
      </div>

      {/* 새 차수 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 py-3 bg-white border-t border-gray-200 z-10">
        <button
          onClick={handleAddRun}
          className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium text-sm"
        >
          + 새 차수 입력 시작
        </button>
      </div>

      {/* 편집 바텀시트 */}
      {editOpen && (
        <EditSheet testId={test.id} onClose={() => setEditOpen(false)} />
      )}
    </div>
  )
}
