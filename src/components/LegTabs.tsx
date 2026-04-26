interface Props {
  legs: string[]
  activeLeg: string
  onSelect: (leg: string) => void
  onAdd: () => void
}

export default function LegTabs({ legs, activeLeg, onSelect, onAdd }: Props) {
  return (
    <div className="flex gap-1.5 px-4 py-2 overflow-x-auto bg-white border-b border-gray-100">
      {legs.map(leg => (
        <button
          key={leg}
          onClick={() => onSelect(leg)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-colors ${
            activeLeg === leg
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Leg {leg}
        </button>
      ))}
      <button
        onClick={onAdd}
        className="px-3 py-1.5 rounded-full text-xs text-gray-400 border border-dashed border-gray-300 flex-shrink-0"
      >
        + 추가
      </button>
    </div>
  )
}
