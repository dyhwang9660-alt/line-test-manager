import { isOutOfTolerance } from '@/lib/utils'

interface Props {
  label: string
  unit: string
  target: number | string
  tolerance: string
  actual: number | string
  changed: boolean
  onActualChange: (val: string) => void
  onToleranceChange: (val: string) => void
}

export default function FormRow({
  label, unit, target, tolerance, actual, changed,
  onActualChange, onToleranceChange,
}: Props) {
  const outOfTol = isOutOfTolerance(actual, target, tolerance)
  const isEmpty = actual === '' || actual === undefined || actual === null

  return (
    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${changed ? 'bg-[#fff8e0]' : ''}`}>
      <div className="w-2 flex-shrink-0">
        {changed && <div className="w-2 h-2 bg-red-500 rounded-full" />}
      </div>

      <div className="w-20 flex-shrink-0">
        <div className="text-xs text-gray-600 leading-tight">{label}</div>
        {unit && <div className="text-[10px] text-gray-400">{unit}</div>}
      </div>

      <div
        className={`w-12 flex-shrink-0 text-center text-xs py-1.5 rounded-md bg-[#f3f4f6] text-gray-500 border ${
          changed ? 'border-orange-300' : 'border-gray-200'
        }`}
      >
        {target !== '' ? String(target) : '—'}
      </div>

      <input
        className="w-11 flex-shrink-0 text-center text-xs py-1.5 rounded-md border border-dashed border-yellow-400 bg-yellow-50 text-yellow-700 outline-none"
        value={tolerance}
        onChange={e => onToleranceChange(e.target.value)}
        inputMode="text"
      />

      <div className="flex-1 relative">
        <input
          className={`w-full text-sm py-1.5 px-2 rounded-md border outline-none text-right ${
            isEmpty
              ? 'border-gray-300 text-gray-400'
              : outOfTol
              ? 'border-red-500 text-red-600 bg-red-50'
              : 'border-gray-800 text-gray-900'
          }`}
          value={isEmpty ? '' : String(actual)}
          placeholder="—"
          inputMode="decimal"
          onChange={e => onActualChange(e.target.value)}
        />
        {outOfTol && (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-red-500 text-xs font-bold pointer-events-none">!</span>
        )}
      </div>
    </div>
  )
}
