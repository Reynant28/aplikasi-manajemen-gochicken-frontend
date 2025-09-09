import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'


function App() {
  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen bg-gray-100">
      <Login />
    </div>
  );
}

export default App;