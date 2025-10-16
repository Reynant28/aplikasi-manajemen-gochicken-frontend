import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from './components/DashboardLayout.jsx';
//import protected route
import ProtectedRoute from "./components/ProtectedRoute.jsx";



// Super Admin pages
import GeneralPageSuper from './pages/super-admin/GeneralPage.jsx';
import ReportsPageSuper from './pages/super-admin/ReportsPage.jsx';
import KelolaCabangPageSuper from './pages/super-admin/KelolaCabangPage.jsx';
import ProdukPageSuper from "./pages/super-admin/ProdukPage.jsx";
import BranchAdminPageSuper from "./pages/super-admin/BranchAdminPage.jsx";
import PengeluaranPageSuper from "./pages/super-admin/PengeluaranPage.jsx";
import KaryawanPageSuper from "./pages/super-admin/KaryawanPage.jsx";
import TransaksiPage from "./pages/super-admin/TransaksiPage.jsx";
import BahanPage from "./pages/super-admin/BahanPage.jsx";
import HelpPage from "./pages/super-admin/HelpPage.jsx";
import SettingsPage from "./pages/super-admin/SettingsPage.jsx";
import BahanBakuPakaiPage from "./pages/super-admin/BahanBakuPakai.jsx";

// Admin Cabang pages
import GeneralPageCabang from './pages/admin-cabang/GeneralPage.jsx';
import ReportsPageCabang from './pages/admin-cabang/ReportsPage.jsx';
import PengeluaranPageCabang from "./pages/admin-cabang/PengeluaranPage.jsx";
import KaryawanPageCabang from "./pages/admin-cabang/KaryawanPage.jsx";
import ProdukPage from "./pages/admin-cabang/ProdukPage.jsx";
import HelpPageCabang from "./pages/admin-cabang/HelpPageCabang.jsx";
import Settingspage from "./pages/admin-cabang/SettingsPage.jsx";
import PemesananPage from "./pages/admin-cabang/PemesananPage.jsx";

import Dashboard from "./components/Dashboard";
import './App.css'

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
              <Route path="/super-admin/dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="general" replace />} />
                <Route path="general" element={<GeneralPageSuper />} />
                <Route path="reports" element={<ReportsPageSuper />} />
                <Route path="kelola-cabang" element={<KelolaCabangPageSuper />} />
                <Route path="produk" element={<ProdukPageSuper />} />
                <Route path="branch" element={<BranchAdminPageSuper />} />
                <Route path="bahan-baku-pakai" element={<BahanBakuPakaiPage />} />
              <Route path="pengeluaran" element={<PengeluaranPageSuper />} />
                <Route path="karyawan" element={<KaryawanPageSuper />} />
                <Route path="transaksi" element={<TransaksiPage />} />
                <Route path="bahan" element={<BahanPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="help" element={<HelpPage />} />
              </Route>
            </Route>

            {/* Admin Cabang */}
            <Route element={<ProtectedRoute allowedRole="admin cabang" />}>
              <Route path="/admin-cabang/:id_cabang/dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="general" replace />} />
                <Route path="general" element={<GeneralPageCabang />} />
                <Route path="reports" element={<ReportsPageCabang />} />
                <Route path="pengeluaran" element={<PengeluaranPageCabang />} />
                <Route path="karyawan" element={<KaryawanPageCabang />} />
                <Route path="produk" element={<ProdukPage />} />
                <Route path="settings" element={<Settingspage />} />
                <Route path="help" element={<HelpPageCabang />} />
                <Route path="pemesanan" element={<PemesananPage />} />
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