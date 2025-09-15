import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";
import DashboardLayout from './components/DashboardLayout.jsx';
import GeneralPage from './pages/GeneralPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import AdvertisingPage from './pages/AdvertisingPage.jsx';
import AudiencePage from './pages/AudiencePage.jsx';
import BranchAdminPage from "./pages/BranchAdminPage.jsx";

function App() {
  return (
    <div className="min-h-screen min-w-screen bg-gray-100">
      <Routes>
        {/* Halaman Login */}
        <Route path="/" element={<Login />} />

        <Route path="/" element={<DashboardLayout />}>
          {/* Rute default akan diarahkan ke /reports */}
          <Route index element={<Navigate to="/reports" replace />} />
          <Route path="/general" element={<GeneralPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/advertising" element={<AdvertisingPage />} />
          <Route path="/branch" element={<BranchAdminPage />} />
        </Route>

        {/* Halaman Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
