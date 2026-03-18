import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import Footer from './components/Footer'

function App() {
  const [page, setPage] = useState('home')

  const handleLogout = () => setPage('home')

  return (
    <div className="app">
      <Header currentPage={page} onNavigate={setPage} />

      {page === 'home' && <HomePage onNavigate={setPage} />}
      {page === 'auth' && <AuthPage onNavigate={setPage} />}
      {page === 'dashboard' && <DashboardPage onLogout={handleLogout} />}

      <Footer />
    </div>
  )
}

export default App
