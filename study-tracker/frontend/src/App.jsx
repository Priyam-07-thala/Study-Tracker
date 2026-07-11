import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
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

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/subject/:id" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
