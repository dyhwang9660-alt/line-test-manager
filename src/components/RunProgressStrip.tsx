import type { Run } from '@/types'

interface Props {
  runs: Run[]
}

export default function RunProgressStrip({ runs }: Props) {
  if (runs.length === 0) return null

  return (
    <div className="flex items-center gap-0 py-3 px-4 overflow-x-auto">
      {runs.map((run, i) => (
        <div key={run.id} className="flex items-center">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
              run.status === 'done'
                ? 'bg-gray-900 border-gray-900 text-white'
                : run.status === 'active'
                ? 'bg-yellow-400 border-yellow-400 text-gray-900'
                : 'bg-white border-gray-300 text-gray-400'
            }`}
          >
            {run.id}
          </div>
          {i < runs.length - 1 && (
            <div
              className={`h-0.5 w-6 ${
                run.status === 'done' ? 'bg-gray-900' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
