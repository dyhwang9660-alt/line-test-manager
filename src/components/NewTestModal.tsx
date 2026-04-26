import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'
import { useNavigate } from 'react-router-dom'

interface Props {
  open: boolean
  onClose: () => void
}

export default function NewTestModal({ open, onClose }: Props) {
  const [name, setName] = useState('')
  const [productName, setProductName] = useState('')
  const createTest = useAppStore(s => s.createTest)
  const navigate = useNavigate()

  function handleSubmit() {
    if (!name.trim()) return
    const id = createTest(name.trim(), productName.trim())
    onClose()
    setName('')
    setProductName('')
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
          <Button className="w-full bg-gray-900 hover:bg-gray-700" onClick={handleSubmit}>
            생성
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
