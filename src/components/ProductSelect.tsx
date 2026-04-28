import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

const CUSTOM_KEY = '__custom__'

/**
 * 홈 화면의 제품 폴더 목록을 드롭다운으로 보여주는 제품명 선택 컴포넌트.
 * 폴더가 없으면 일반 텍스트 입력으로 fallback.
 * "직접 입력" 선택 시 텍스트 입력 필드가 추가로 표시됨.
 */
export default function ProductSelect({
  value,
  onChange,
  placeholder = '제품 선택',
  className = '',
}: Props) {
  const folders = useAppStore(s => s.folders)
  const folderNames = folders.map(f => f.name)
  const isInFolders = folderNames.includes(value)

  // 폴더 목록에 없는 값이 이미 있으면 커스텀 입력 모드로 시작
  const [isCustom, setIsCustom] = useState(() => !isInFolders && value !== '')

  // 폴더가 하나도 없으면 일반 텍스트 입력
  if (folders.length === 0) {
    return (
      <input
        className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-500 bg-gray-50 ${className}`}
        placeholder="제품명 입력"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    )
  }

  const selectValue = isCustom ? CUSTOM_KEY : (isInFolders ? value : '')

  return (
    <div className="space-y-2">
      <select
        className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-gray-500 ${className}`}
        value={selectValue}
        onChange={e => {
          if (e.target.value === CUSTOM_KEY) {
            setIsCustom(true)
            onChange('')
          } else {
            setIsCustom(false)
            onChange(e.target.value)
          }
        }}
      >
        <option value="">{placeholder}</option>
        {folderNames.map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
        <option value={CUSTOM_KEY}>✏️ 직접 입력...</option>
      </select>

      {isCustom && (
        <input
          autoFocus
          className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-500 bg-white ${className}`}
          placeholder="제품명 직접 입력"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  )
}
