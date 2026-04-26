import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import NewTestModal from '@/components/NewTestModal'
import type { LineTest } from '@/types'

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
          {test.productName} · Run {test.runs.length}차 · 최근 {lastDate}
        </div>
      </div>
      <span className="text-gray-400 text-lg">›</span>
    </button>
  )
}

export default function Home() {
  const tests = useAppStore(s => s.tests)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = tests.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.productName.toLowerCase().includes(search.toLowerCase())
  )
  const active = filtered.filter(t => t.status === 'active')
  const done = filtered.filter(t => t.status === 'done')

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-[#111111] text-white px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-base">Line Test</span>
        <button className="text-sm text-gray-300">+ 신규</button>
      </div>

      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <input
          className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none placeholder:text-gray-400"
          placeholder="테스트 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 px-4 py-3">
        {active.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">진행중</div>
            {active.map(t => <TestItem key={t.id} test={t} />)}
          </div>
        )}
        {done.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">완료됨</div>
            {done.map(t => <TestItem key={t.id} test={t} />)}
          </div>
        )}
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-16">
            {search ? '검색 결과가 없습니다' : '테스트를 추가해보세요'}
          </div>
        )}
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg text-2xl flex items-center justify-center"
      >
        +
      </button>

      <NewTestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
