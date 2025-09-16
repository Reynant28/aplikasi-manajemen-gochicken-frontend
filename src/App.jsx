import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { useState } from 'react'
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";
import DashboardLayout from './components/DashboardLayout.jsx';
import GeneralPage from './pages/GeneralPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import AdvertisingPage from './pages/AdvertisingPage.jsx';
import AudiencePage from './pages/AudiencePage.jsx';
import BranchAdminPage from "./pages/BranchAdminPage.jsx";
import PengeluaranPage from "./pages/PengeluaranPage.jsx";
import KaryawanPage from "./pages/KaryawanPage.jsx";
import './App.css'

function App() {
  return (
    // Tambahkan komponen BrowserRouter di sini untuk membungkus seluruh aplikasi
    <BrowserRouter>
      <div className="min-h-screen min-w-screen bg-gray-100">
        <Routes>
          {/* Halaman Login */}
          <Route path="/" element={<Login />} />

          <Route path="/general" element={<Navigate to="/super-admin/dashboard/general" replace />} />
          <Route path="/advertising" element={<Navigate to="/super-admin/dashboard/advertising" replace />} />
          <Route path="/reports" element={<Navigate to="/super-admin/dashboard/reports" replace />} />
          <Route path="/branch" element={<Navigate to="/super-admin/dashboard/branch" replace />} />
          <Route path="/audience" element={<Navigate to="/super-admin/dashboard/audience" replace />} />
          <Route path="/pengeluaran" element={<Navigate to="/super-admin/dashboard/pengeluaran" replace />} />
          <Route path="/karyawan" element={<Navigate to="/super-admin/dashboard/karyawan" replace />} />

          <Route path="/admin-cabang/dashboard" element={<DashboardLayout />}>
            {/* Tambahkan rute anak untuk Admin Cabang di sini */}
          </Route>

          <Route path="/super-admin/dashboard" element={<DashboardLayout />}>
            {/* Rute anak sekarang bersifat relatif (tanpa '/') */}
            <Route path="general" element={<GeneralPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="advertising" element={<AdvertisingPage />} />
            <Route path="branch" element={<BranchAdminPage />} />
            <Route path="audience" element={<AudiencePage />} />
            <Route path="pengeluaran" element={<PengeluaranPage />} />
            <Route path="karyawan" element={<KaryawanPage />} />
            {/* Tambahkan rute indeks untuk default ke /super-admin/dashboard */}
            <Route index element={<GeneralPage />} />
          </Route>

          {/* Halaman Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;