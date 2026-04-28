import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import NewTestModal from '@/components/NewTestModal'
import type { LineTest, Folder } from '@/types'

// ─── 테스트 카드 ────────────────────────────────────────────────
function TestItem({ test }: { test: LineTest }) {
  const navigate = useNavigate()
  const lastRun = test.runs[test.runs.length - 1]
  const lastDate = lastRun
    ? new Date(lastRun.startTime).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
    : new Date(test.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })

  return (
    <button
      onClick={() => navigate(`/tests/${test.id}`)}
      className={`w-full text-left rounded-xl px-4 py-3 mb-2 flex items-center justify-between border ${
        test.status === 'active'
          ? 'bg-[#fff8e0] border-[#fbbf24]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div>
        <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          {test.name}
          {test.status === 'active' && (
            <span className="text-xs bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full font-medium">
              진행중
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {test.productName && `${test.productName} · `}Run {test.runs.length}차 · 최근 {lastDate}
        </div>
      </div>
      <span className="text-gray-400 text-lg">›</span>
    </button>
  )
}

// ─── 폴더 카드 ────────────────────────────────────────────────────
function FolderCard({
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
  const deleteFolder = useAppStore(s => s.deleteFolder)
  const renameFolder = useAppStore(s => s.renameFolder)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(folder.name)

  const filtered = tests.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.productName.toLowerCase().includes(search.toLowerCase())
  )

  const hasActive = filtered.some(t => t.status === 'active')

  function handleRename() {
    if (editName.trim()) renameFolder(folder.id, editName.trim())
    setEditing(false)
  }

  return (
    <div className="mb-3">
      {/* 폴더 헤더 */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
          hasActive ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-100 border-gray-200'
        }`}
      >
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <span className="text-base">{open ? '📂' : '📁'}</span>
          {editing ? (
            <input
              className="flex-1 text-sm font-semibold bg-transparent border-b border-gray-400 outline-none"
              value={editName}
              autoFocus
              onChange={e => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 text-sm font-semibold text-gray-800 truncate text-left">
              {folder.name}
            </span>
          )}
          <span className="text-xs text-gray-400 flex-shrink-0">{filtered.length}개</span>
          <span className="text-gray-400 text-xs">{open ? '▾' : '▸'}</span>
        </button>

        {/* 폴더 메뉴 */}
        <button
          onClick={() => setEditing(true)}
          className="text-gray-400 text-xs px-1.5 py-1 hover:text-gray-600"
        >
          ✏️
        </button>
        <button
          onClick={() => onNewTest(folder.id)}
          className="text-gray-400 text-xs px-1.5 py-1 hover:text-gray-600"
        >
          +
        </button>
        <button
          onClick={() => {
            if (confirm(`"${folder.name}" 폴더를 삭제할까요?\n테스트는 미분류로 이동됩니다.`))
              deleteFolder(folder.id)
          }}
          className="text-gray-300 text-xs px-1.5 py-1 hover:text-red-400"
        >
          ✕
        </button>
      </div>

      {/* 폴더 내 테스트 목록 */}
      {open && (
        <div className="mt-1 pl-3">
          {filtered.length === 0 ? (
            <div className="text-xs text-gray-400 py-2 px-2">
              {search ? '검색 결과 없음' : '테스트가 없습니다'}
            </div>
          ) : (
            filtered.map(t => <TestItem key={t.id} test={t} />)
          )}
        </div>
      )}
    </div>
  )
}

// ─── 홈 메인 ────────────────────────────────────────────────────
export default function Home() {
  const tests = useAppStore(s => s.tests)
  const folders = useAppStore(s => s.folders)
  const createFolder = useAppStore(s => s.createFolder)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalFolderId, setModalFolderId] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [fabOpen, setFabOpen] = useState(false)

  function handleNewTest(folderId?: string) {
    setModalFolderId(folderId)
    setModalOpen(true)
    setFabOpen(false)
  }

  function handleCreateFolder() {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim())
      setNewFolderName('')
    }
    setShowFolderInput(false)
    setFabOpen(false)
  }

  // 검색 필터 (폴더 없는 테스트)
  const ungrouped = tests.filter(t => !t.folderId)
  const filteredUngrouped = ungrouped.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.productName.toLowerCase().includes(search.toLowerCase())
  )
  const activeUngrouped = filteredUngrouped.filter(t => t.status === 'active')
  const doneUngrouped = filteredUngrouped.filter(t => t.status === 'done')

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#111111] text-white px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-base">Line Test</span>
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

      {/* 새 폴더 입력창 */}
      {showFolderInput && (
        <div className="px-4 py-2 bg-white border-b border-gray-100 flex gap-2">
          <input
            autoFocus
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
            placeholder="폴더 이름 입력..."
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreateFolder()
              if (e.key === 'Escape') setShowFolderInput(false)
            }}
          />
          <button
            onClick={handleCreateFolder}
            className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium"
          >
            생성
          </button>
          <button
            onClick={() => setShowFolderInput(false)}
            className="px-3 py-2 text-gray-400 text-sm"
          >
            취소
          </button>
        </div>
      )}

      {/* 목록 */}
      <div className="flex-1 px-4 py-3 pb-28">

        {/* 폴더 목록 */}
        {folders.map(folder => (
          <FolderCard
            key={folder.id}
            folder={folder}
            tests={tests.filter(t => t.folderId === folder.id)}
            search={search}
            onNewTest={handleNewTest}
          />
        ))}

        {/* 미분류 테스트 */}
        {filteredUngrouped.length > 0 && (
          <div>
            {folders.length > 0 && (
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-1">
                미분류
              </div>
            )}
            {activeUngrouped.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  진행중
                </div>
                {activeUngrouped.map(t => <TestItem key={t.id} test={t} />)}
              </div>
            )}
            {doneUngrouped.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  완료됨
                </div>
                {doneUngrouped.map(t => <TestItem key={t.id} test={t} />)}
              </div>
            )}
          </div>
        )}

        {/* 빈 상태 */}
        {folders.length === 0 && filteredUngrouped.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-16">
            {search ? '검색 결과가 없습니다' : '폴더나 테스트를 추가해보세요'}
          </div>
        )}
      </div>

      {/* FAB 배경 클릭 닫기 */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* FAB 컨테이너 — max-w-md 안에 고정 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto pointer-events-none z-20">
        {fabOpen && (
          <div className="absolute bottom-24 right-4 flex flex-col gap-2 items-end pointer-events-auto">
            <button
              onClick={() => { setShowFolderInput(true); setFabOpen(false) }}
              className="flex items-center gap-2 bg-white border border-gray-200 shadow-md rounded-full px-4 py-2.5 text-sm font-medium text-gray-700"
            >
              <span>📁</span> 새 폴더
            </button>
            <button
              onClick={() => handleNewTest()}
              className="flex items-center gap-2 bg-white border border-gray-200 shadow-md rounded-full px-4 py-2.5 text-sm font-medium text-gray-700"
            >
              <span>📋</span> 새 테스트
            </button>
          </div>
        )}
        <button
          onClick={() => setFabOpen(o => !o)}
          className={`absolute bottom-6 right-4 w-14 h-14 rounded-full shadow-lg text-2xl flex items-center justify-center pointer-events-auto transition-transform ${
            fabOpen ? 'bg-gray-700 rotate-45' : 'bg-gray-900'
          } text-white`}
        >
          +
        </button>
      </div>

      <NewTestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultFolderId={modalFolderId}
      />
    </div>
  )
}
