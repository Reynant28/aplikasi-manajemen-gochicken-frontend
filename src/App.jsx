import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Login from './pages/Login'
import Dashboard from "./components/Dashboard";
import './App.css'


function App() {
  return (
    <div className="min-h-screen min-w-screen bg-gray-100">
      <Routes>
        {/* Halaman Login */}
        <Route path="/" element={<Login />} />

        {/* Halaman Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
