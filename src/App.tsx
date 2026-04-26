import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import TestDetail from '@/pages/TestDetail'
import RunForm from '@/pages/RunForm'
import Compare from '@/pages/Compare'

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tests/:testId" element={<TestDetail />} />
          <Route path="/tests/:testId/runs/:runId" element={<RunForm />} />
          <Route path="/tests/:testId/compare" element={<Compare />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
