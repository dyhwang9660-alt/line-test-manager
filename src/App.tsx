import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/tests/:testId" element={<div>Detail</div>} />
        <Route path="/tests/:testId/runs/:runId" element={<div>Form</div>} />
        <Route path="/tests/:testId/compare" element={<div>Compare</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
