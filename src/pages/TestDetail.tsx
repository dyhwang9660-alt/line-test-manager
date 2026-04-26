import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import RunProgressStrip from '@/components/RunProgressStrip'
import type { Run } from '@/types'

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
        {new Date(run.startTime).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>
    </button>
  )
}

export default function TestDetail() {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const tests = useAppStore(s => s.tests)
  const addRun = useAppStore(s => s.addRun)
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
      <div className="bg-[#111111] text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-gray-300 text-lg">←</button>
        <span className="font-bold text-base flex-1 truncate">{test.name}</span>
        <button className="text-gray-300 text-sm">편집</button>
      </div>

      <div className="bg-white border-b border-gray-100">
        <RunProgressStrip runs={test.runs} />
      </div>

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

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 py-3 bg-white border-t border-gray-200">
        <button
          onClick={handleAddRun}
          className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium text-sm"
        >
          + 새 차수 입력 시작
        </button>
      </div>
    </div>
  )
}
