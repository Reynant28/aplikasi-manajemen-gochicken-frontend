import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from './components/DashboardLayout.jsx';
//import protected route
import ProtectedRoute from "./components/ProtectedRoute.jsx";
// ✅ IMPORT PROVIDER


// Super Admin pages
import GeneralPageSuper from './pages/super-admin/GeneralPage.jsx';
import ReportsPageSuper from './pages/super-admin/ReportsPage.jsx';
import DailyReportPage from './pages/super-admin/DailyReportPage.jsx';
import KelolaCabangPageSuper from './pages/super-admin/KelolaCabangPage.jsx';
import ProdukPageSuper from "./pages/super-admin/ProdukPage.jsx";
import BranchAdminPageSuper from "./pages/super-admin/BranchAdminPage.jsx";
import PengeluaranPageSuper from "./pages/super-admin/PengeluaranPage.jsx";
import KaryawanPageSuper from "./pages/super-admin/KaryawanPage.jsx";
import JenisPengeluaranPageSuper from "./pages/super-admin/JenisPengeluaranPage.jsx";
import TransaksiPageSuper from "./pages/super-admin/TransaksiPage.jsx";
import BahanPage from "./pages/super-admin/BahanPage.jsx";
import HelpPage from "./pages/super-admin/HelpPage.jsx";
import BahanBakuPakaiPage from "./pages/super-admin/BahanBakuPakai.jsx";

// Admin Cabang pages
import GeneralPageCabang from './pages/admin-cabang/GeneralPage.jsx';
import ReportsPageCabang from './pages/admin-cabang/ReportsPage.jsx';
import PengeluaranPageCabang from "./pages/admin-cabang/PengeluaranPage.jsx";
import KaryawanPageCabang from "./pages/admin-cabang/KaryawanPage.jsx";
import KasirPageCabang from "./pages/admin-cabang/KasirPage.jsx";
import PemesananPageCabang from "./pages/admin-cabang/PemesananPage.jsx";
import TransaksiPageCabang from "./pages/admin-cabang/TransaksiPage.jsx";
import ProdukPage from "./pages/admin-cabang/ProdukPage.jsx";
import HelpPageCabang from "./pages/admin-cabang/HelpPageCabang.jsx";

import Dashboard from "./components/Dashboard";
import './App.css'
import AuditLogPage from "./pages/super-admin/AuditLogPage.jsx";

function App() {
  return (
    // ✅ BUNGKUS DENGAN NotificationProvider
    <BrowserRouter>
      <div className="min-h-screen min-w-screen bg-gray-100">
        <Routes>
          {/* Halaman Login */}
          <Route path="/" element={<Login />} />

            {/* Super Admin */}
            <Route element={<ProtectedRoute allowedRole="super admin" />}>
              <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
              <Route path="/super-admin/dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="general" replace />} />
                <Route path="general" element={<GeneralPageSuper />} />
                <Route path="reports" element={<ReportsPageSuper />} />
                <Route path="daily-reports" element={<DailyReportPage />} />
                <Route path="kelola-cabang" element={<KelolaCabangPageSuper />} />
                <Route path="produk" element={<ProdukPageSuper />} />
                <Route path="branch" element={<BranchAdminPageSuper />} />
                <Route path="bahan-baku-pakai" element={<BahanBakuPakaiPage />} />
              <Route path="pengeluaran" element={<PengeluaranPageSuper />} />
                <Route path="karyawan" element={<KaryawanPageSuper />} />
                <Route path="transaksi" element={<TransaksiPageSuper />} />
                <Route path="jenis-pengeluaran" element={<JenisPengeluaranPageSuper />} />
                <Route path="bahan" element={<BahanPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="audit-log" element={<AuditLogPage />} />
              </Route>
            </Route>

          {/* Admin Cabang */}
          <Route element={<ProtectedRoute allowedRole="admin cabang" />}>
            <Route path="/admin-cabang/:id_cabang/dashboard" element={<DashboardLayout />}>
              <Route index element={<Navigate to="general" replace />} />
              <Route path="general" element={<GeneralPageCabang />} />
              <Route path="reports" element={<ReportsPageCabang />} />
              <Route path="pengeluaran" element={<PengeluaranPageCabang />} />
              <Route path="pemesanan" element={<PemesananPageCabang />} />
              <Route path="karyawan" element={<KaryawanPageCabang />} />
              <Route path="kasir" element={<KasirPageCabang />} />
              <Route path="transaksi" element={<TransaksiPageCabang />} />
              <Route path="produk" element={<ProdukPage />} />
              <Route path="help" element={<HelpPageCabang />} />
            </Route>
          </Route>

          {/* Default Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;