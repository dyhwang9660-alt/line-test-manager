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
  const [productName, setProductName] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string>(defaultFolderId ?? '')
  const createTest = useAppStore(s => s.createTest)
  const folders = useAppStore(s => s.folders)
  const navigate = useNavigate()

  function handleSubmit() {
    if (!name.trim()) return
    const id = createTest(name.trim(), productName.trim(), selectedFolderId || undefined)
    onClose()
    setName('')
    setProductName('')
    setSelectedFolderId(defaultFolderId ?? '')
    navigate(`/tests/${id}`)
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>새 Line Test</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">테스트명 *</label>
            <Input
              placeholder="PE-LLD #23-A"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">제품명</label>
            <Input
              placeholder="Film Grade 0.918"
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">폴더</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-gray-400"
              value={selectedFolderId}
              onChange={e => setSelectedFolderId(e.target.value)}
            >
              <option value="">폴더 없음</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <Button className="w-full bg-gray-900 hover:bg-gray-700" onClick={handleSubmit}>
            생성
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
