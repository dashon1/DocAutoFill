import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import DashboardPage from './components/DashboardPage'
import AuthCallback from './components/AuthCallback'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App