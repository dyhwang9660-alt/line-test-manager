import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'
import { useNavigate } from 'react-router-dom'

interface Props {
  open: boolean
  onClose: () => void
  defaultFolderId?: string
}

export default function NewTestModal({ open, onClose, defaultFolderId }: Props) {
  const [name, setName] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string>(defaultFolderId ?? '')
  const [memo, setMemo] = useState('')
  const createTest = useAppStore(s => s.createTest)
  const folders = useAppStore(s => s.folders)
  const navigate = useNavigate()

  // 선택된 폴더의 이름을 제품명으로 사용
  const selectedFolder = folders.find(f => f.id === selectedFolderId)
  const productName = selectedFolder?.name ?? ''

  function handleSubmit() {
    if (!name.trim()) return
    const id = createTest(name.trim(), productName, selectedFolderId || undefined, memo.trim() || undefined)
    onClose()
    setName('')
    setSelectedFolderId(defaultFolderId ?? '')
    setMemo('')
    navigate(`/tests/${id}`)
  }

  function handleClose() {
    onClose()
    setName('')
    setSelectedFolderId(defaultFolderId ?? '')
    setMemo('')
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>새 Line Test</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">

          {/* 테스트명 */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">테스트명 *</label>
            <Input
              placeholder="PE-LLD #23-A"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {/* 제품명 (= 폴더 선택) */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">제품명</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-gray-400"
              value={selectedFolderId}
              onChange={e => setSelectedFolderId(e.target.value)}
            >
              <option value="">선택 안 함</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* 메모 */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">메모</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none"
              placeholder="테스트 목적, 특이사항 등..."
              rows={3}
              value={memo}
              onChange={e => setMemo(e.target.value)}
            />
          </div>

          <Button className="w-full bg-gray-900 hover:bg-gray-700" onClick={handleSubmit}>
            생성
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
