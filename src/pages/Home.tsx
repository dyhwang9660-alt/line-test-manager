import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import NewTestModal from '@/components/NewTestModal'
import type { LineTest, Folder } from '@/types'

// ─── 새 폴더 중앙 팝업 ───────────────────────────────────────────
function NewFolderModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (name: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')

  function handleSubmit() {
    if (name.trim()) {
      onConfirm(name.trim())
    }
  }

  return (
    <>
      {/* 딤 배경 */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      {/* 중앙 카드 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">새 제품 폴더</h2>
          <p className="text-xs text-gray-400 mb-4">폴더명은 제품명으로 입력하세요</p>
          <input
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-600 bg-gray-50 mb-4"
            placeholder="예: PE-LLD"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSubmit()
              if (e.key === 'Escape') onClose()
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-40"
            >
              생성
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── 테스트 행 (폴더 하위) ──────────────────────────────────────
function TestRow({ test }: { test: LineTest }) {
  const navigate = useNavigate()
  const lastRun = test.runs[test.runs.length - 1]
  const lastDate = lastRun
    ? new Date(lastRun.startTime).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
    : new Date(test.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
  const activeRun = test.runs.find(r => r.status === 'active')

  return (
    <button
      onClick={() => navigate(`/tests/${test.id}`)}
      className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 shadow-sm bg-white hover:border-gray-200 hover:shadow-md transition-colors mb-2 last:mb-0"
    >
      {/* 상태 dot */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        test.status === 'active' ? 'bg-yellow-400' : 'bg-gray-300'
      }`} />

      {/* 테스트명 */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{test.name}</div>
        <div className="text-xs text-gray-400 mt-0.5">
          Run {test.runs.length}차
          {activeRun && (
            <span className="ml-1.5 text-yellow-600 font-medium">
              · Run {activeRun.id} 진행중
            </span>
          )}
        </div>
      </div>

      {/* 날짜 + 배지 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-gray-400">{lastDate}</span>
        {test.status === 'active' && (
          <span className="text-[10px] bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full font-semibold">
            진행중
          </span>
        )}
        <span className="text-gray-300 text-sm">›</span>
      </div>
    </button>
  )
}

// ─── 폴더 아코디언 ───────────────────────────────────────────────
function FolderAccordion({
  folder,
  tests,
  search,
  onNewTest,
}: {
  folder: Folder
  tests: LineTest[]
  search: string
  onNewTest: (folderId: string) => void
}) {
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(folder.name)
  const deleteFolder = useAppStore(s => s.deleteFolder)
  const renameFolder = useAppStore(s => s.renameFolder)

  const filtered = tests.filter(
    t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.productName.toLowerCase().includes(search.toLowerCase())
  )
  const hasActive = filtered.some(t => t.status === 'active')

  function handleRename() {
    if (editName.trim()) renameFolder(folder.id, editName.trim())
    setEditing(false)
  }

  return (
    <div className={`mb-3 rounded-xl overflow-hidden border ${
      hasActive ? 'border-yellow-300' : 'border-gray-200'
    }`}>
      {/* 폴더 헤더 */}
      <div className={`flex items-center px-4 py-3 ${
        hasActive ? 'bg-yellow-50' : 'bg-gray-50'
      }`}>
        {/* 펼침 토글 */}
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <span className="text-base leading-none">{open ? '📂' : '📁'}</span>
          {editing ? (
            <input
              className="flex-1 text-sm font-bold bg-transparent border-b border-gray-400 outline-none"
              value={editName}
              autoFocus
              onChange={e => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') setEditing(false)
              }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 text-sm font-bold text-gray-800 truncate text-left">
              {folder.name}
            </span>
          )}
          <span className="text-xs text-gray-400 ml-1 flex-shrink-0">
            {filtered.length}개
          </span>
          <span className="text-gray-400 text-xs ml-1">{open ? '▾' : '▸'}</span>
        </button>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setEditing(true)}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xs rounded-lg hover:bg-gray-200"
          >
            ✏️
          </button>
          <button
            onClick={() => onNewTest(folder.id)}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 text-base font-bold rounded-lg hover:bg-gray-200"
          >
            +
          </button>
          <button
            onClick={() => {
              if (confirm(`"${folder.name}" 폴더를 삭제할까요?\n테스트는 미분류로 이동됩니다.`))
                deleteFolder(folder.id)
            }}
            className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 text-xs rounded-lg hover:bg-gray-200"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 하위 테스트 목록 */}
      {open && (
        <div className="px-3 py-2.5 bg-gray-50">
          {filtered.length === 0 ? (
            <div className="px-1 py-2 text-xs text-gray-400">
              {search ? '검색 결과 없음' : (
                <button
                  onClick={() => onNewTest(folder.id)}
                  className="text-blue-500 hover:underline"
                >
                  + 테스트 추가하기
                </button>
              )}
            </div>
          ) : (
            filtered.map(t => <TestRow key={t.id} test={t} />)
          )}
        </div>
      )}
    </div>
  )
}

// ─── 홈 메인 ─────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate()
  const tests = useAppStore(s => s.tests)
  const folders = useAppStore(s => s.folders)
  const createFolder = useAppStore(s => s.createFolder)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalFolderId, setModalFolderId] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const [folderModalOpen, setFolderModalOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)

  function handleNewTest(folderId?: string) {
    setModalFolderId(folderId)
    setModalOpen(true)
    setFabOpen(false)
  }

  function handleCreateFolder(name: string) {
    createFolder(name)
    setFolderModalOpen(false)
    setFabOpen(false)
  }

  // 미분류 테스트
  const ungrouped = tests.filter(t => !t.folderId)
  const filteredUngrouped = ungrouped.filter(
    t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.productName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#111111] text-white px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-base">Line Test</span>
        <button
          onClick={() => navigate('/recipes')}
          className="text-gray-300 text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1"
        >
          <span>📋</span> 레시피
        </button>
      </div>

      {/* 검색 */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <input
          className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none placeholder:text-gray-400"
          placeholder="테스트 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* 목록 */}
      <div className="flex-1 px-4 py-3 pb-28">

        {/* 폴더 아코디언 목록 */}
        {folders.map(folder => (
          <FolderAccordion
            key={folder.id}
            folder={folder}
            tests={tests.filter(t => t.folderId === folder.id)}
            search={search}
            onNewTest={handleNewTest}
          />
        ))}

        {/* 미분류 테스트 */}
        {filteredUngrouped.length > 0 && (
          <div className="mb-3">
            {folders.length > 0 && (
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                미분류
              </div>
            )}
            <div className="space-y-2">
              {filteredUngrouped.map(t => <TestRow key={t.id} test={t} />)}
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {folders.length === 0 && filteredUngrouped.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-20 space-y-2">
            <div className="text-4xl">📁</div>
            <div>{search ? '검색 결과가 없습니다' : '제품 폴더를 만들어보세요'}</div>
          </div>
        )}
      </div>

      {/* FAB 배경 클릭 닫기 */}
      {fabOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setFabOpen(false)} />
      )}

      {/* FAB — max-w-md 컨테이너 안에 고정 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto pointer-events-none z-20">
        {fabOpen && (
          <div className="absolute bottom-24 right-4 flex flex-col gap-2 items-end pointer-events-auto">
            <button
              onClick={() => { setFolderModalOpen(true); setFabOpen(false) }}
              className="flex items-center gap-2 bg-white border border-gray-200 shadow-lg rounded-full px-4 py-2.5 text-sm font-medium text-gray-700"
            >
              <span>📁</span> 새 제품 폴더
            </button>
            <button
              onClick={() => handleNewTest()}
              className="flex items-center gap-2 bg-white border border-gray-200 shadow-lg rounded-full px-4 py-2.5 text-sm font-medium text-gray-700"
            >
              <span>📋</span> 새 테스트
            </button>
          </div>
        )}
        <button
          onClick={() => setFabOpen(o => !o)}
          className={`absolute bottom-6 right-4 w-14 h-14 rounded-full shadow-lg text-2xl flex items-center justify-center pointer-events-auto transition-transform duration-200 ${
            fabOpen ? 'bg-gray-700 rotate-45' : 'bg-gray-900'
          } text-white`}
        >
          +
        </button>
      </div>

      {/* 새 테스트 모달 */}
      <NewTestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultFolderId={modalFolderId}
      />

      {/* 새 폴더 중앙 팝업 */}
      {folderModalOpen && (
        <NewFolderModal
          onConfirm={handleCreateFolder}
          onClose={() => setFolderModalOpen(false)}
        />
      )}
    </div>
  )
}
