interface Props {
  chips: string[]
}

export default function ChangedChips({ chips }: Props) {
  if (chips.length === 0) return null
  return (
    <div className="flex gap-1.5 px-4 py-2 overflow-x-auto bg-yellow-50 border-b border-yellow-100">
      <span className="text-xs text-gray-500 flex-shrink-0 self-center">이전 Run 대비:</span>
      {chips.map((chip, i) => (
        <span
          key={i}
          className="text-xs bg-yellow-300 text-yellow-900 px-2 py-1 rounded-full flex-shrink-0 font-medium"
        >
          {chip}
        </span>
      ))}
    </div>
  )
}
