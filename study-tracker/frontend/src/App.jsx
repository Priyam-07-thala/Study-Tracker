import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import SpiralRings from './components/SpiralRings'
import Dashboard from './pages/Dashboard'
import SubjectPage from './pages/SubjectPage'
import Login from './pages/Login'

function ProtectedRoute({ children }) {
  const userId = localStorage.getItem('user_id')
  if (!userId) {
    return <Navigate to="/login" replace />
  }
  return children
}

function NotebookLayout() {
  const userId = localStorage.getItem('user_id')

  if (!userId) {
    return (
      <div className="graph-paper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className="graph-paper app-outer-wrapper">
      <div className="notebook-container">
        <Navbar />
        <div className="desktop-rings-only">
          <SpiralRings count={16} />
        </div>
        <main className="notebook-content-page">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/subject/:id" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <NotebookLayout />
    </BrowserRouter>
  )
}
