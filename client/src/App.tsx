import { useState } from 'react'
import Login from './pages/Login'
import './App.css'

function App() {
  const [isLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <h1>Dashboard</h1>
    </div>
  )
}

export default App
