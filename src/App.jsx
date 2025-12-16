import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from './components/DashboardLayout.jsx';
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { NotificationProvider } from "./components/context/NotificationContext.jsx"; 
import NotFound from "./components/ui/NotFound.jsx"; // ✅ Import NotFound

// Super Admin pages
import GeneralPageSuper from './pages/super-admin/GeneralPage.jsx';
import ReportsPageSuper from './pages/super-admin/ReportsPage.jsx';
import KelolaCabangPageSuper from './pages/super-admin/KelolaCabangPage.jsx';
import ProdukPageSuper from "./pages/super-admin/ProdukPage.jsx";
import BranchAdminPageSuper from "./pages/super-admin/BranchAdminPage.jsx";
import PengeluaranPageSuper from "./pages/super-admin/PengeluaranPage.jsx";
import KaryawanPageSuper from "./pages/super-admin/KaryawanPage.jsx";
import JenisPengeluaranPageSuper from "./pages/super-admin/JenisPengeluaranPage.jsx";
import TransaksiPage from "./pages/super-admin/TransaksiPage.jsx";
import BahanPage from "./pages/super-admin/BahanPage.jsx";
import HelpPage from "./pages/super-admin/HelpPage.jsx";
import SettingsPage from "./pages/super-admin/SettingsPage.jsx";
import BahanBakuPakaiPage from "./pages/super-admin/BahanBakuPakai.jsx";
import DailyReportPage from "./pages/super-admin/DailyReportPage.jsx";
import BackupRestorePage from "./pages/super-admin/BackupRestorePage.jsx";

// Admin Cabang pages
import GeneralPageCabang from './pages/admin-cabang/GeneralPage.jsx';
import ReportsPageCabang from './pages/admin-cabang/ReportsPage.jsx';
import PengeluaranPageCabang from "./pages/admin-cabang/PengeluaranPage.jsx";
import KaryawanPageCabang from "./pages/admin-cabang/KaryawanPage.jsx";
import ProdukPage from "./pages/admin-cabang/ProdukPage.jsx";
import HelpPageCabang from "./pages/admin-cabang/HelpPageCabang.jsx";
import Settingspage from "./pages/admin-cabang/SettingsPage.jsx";
import PemesananPage from "./pages/admin-cabang/PemesananPage.jsx";
import TransaksiPageCabang from "./pages/admin-cabang/TransaksiPageCabang.jsx";

import Dashboard from "./components/Dashboard";
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider> 
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
                <Route path="daily" element={<DailyReportPage />} />
                <Route path="kelola-cabang" element={<KelolaCabangPageSuper />} />
                <Route path="produk" element={<ProdukPageSuper />} />
                <Route path="branch" element={<BranchAdminPageSuper />} />
                <Route path="bahan-baku-pakai" element={<BahanBakuPakaiPage />} />
                <Route path="pengeluaran" element={<PengeluaranPageSuper />} />
                <Route path="karyawan" element={<KaryawanPageSuper />} />
                <Route path="transaksi" element={<TransaksiPage />} />
                <Route path="jenis-pengeluaran" element={<JenisPengeluaranPageSuper />} />
                <Route path="bahan" element={<BahanPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="backup-restore" element={<BackupRestorePage />} />
                
                {/* ✅ 404 untuk nested routes super admin */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>

            {/* Admin Cabang */}
            <Route element={<ProtectedRoute allowedRole="admin cabang" />}>
              <Route path="/admin-cabang/:id_cabang/dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="general" replace />} />
                <Route path="general" element={<GeneralPageCabang />} />
                <Route path="reports" element={<ReportsPageCabang />} />
                <Route path="daily" element={<DailyReportPage />} />
                <Route path="pengeluaran" element={<PengeluaranPageCabang />} />
                <Route path="transaksi" element={<TransaksiPageCabang />} />
                <Route path="karyawan" element={<KaryawanPageCabang />} />
                <Route path="produk" element={<ProdukPage />} />
                <Route path="settings" element={<Settingspage />} />
                <Route path="help" element={<HelpPageCabang />} />\
                <Route path="pemesanan" element={<PemesananPage />} />
                
                {/* ✅ 404 untuk nested routes admin cabang */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>

            {/* Default Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* ✅ 404 Global - tangkap semua route yang tidak match */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;