// src/components/Header.jsx
import { useState, useRef, useEffect } from "react";
import { 
  Search, 
  Bell, 
  LogOut, 
  X, 
  Menu,
  History,
  CheckCircle, // ✅ Ikon untuk Sukses
  XCircle, // ✅ Ikon untuk Error/Delete
} from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const searchRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cabang");
    navigate("/");
  };

  // 🔹 List halaman berdasarkan role (TIDAK BERUBAH)
  const superAdminPages = [
    { name: "General", path: "/super-admin/dashboard/general" },
    { name: "Laporan Master", path: "/super-admin/dashboard/reports" },
    { name: "Laporan Harian", path: "/super-admin/dashboard/daily-reports" },
    { name: "Audit Log", path: "/super-admin/dashboard/audit-log" },
    { name: "Kelola Cabang", path: "/super-admin/dashboard/kelola-cabang" },
    { name: "Produk", path: "/super-admin/dashboard/produk" },
    { name: "Admin Cabang", path: "/super-admin/dashboard/branch" },
    { name: "Pengeluaran", path: "/super-admin/dashboard/pengeluaran" },
    { name: "Karyawan", path: "/super-admin/dashboard/karyawan" },
    { name: "Transaksi", path: "/super-admin/dashboard/transaksi" },
    { name: "Bahan Baku", path: "/super-admin/dashboard/bahan" },
    { name: "Jenis Pengeluaran", path: "/super-admin/dashboard/jenis-pengeluaran" },
    { name: "Bahan Baku Pakai", path: "/super-admin/dashboard/bahan-baku-pakai" },
  ];

  const adminCabangPages = [
    { name: "General", path: `/admin-cabang/${user?.id_cabang}/dashboard/general` },
    { name: "Reports", path: `/admin-cabang/${user?.id_cabang}/dashboard/reports` },
    { name: "Pengeluaran", path: `/admin-cabang/${user?.id_cabang}/dashboard/pengeluaran` },
    { name: "Karyawan", path: `/admin-cabang/${user?.id_cabang}/dashboard/karyawan` },
    { name: "Produk", path: `/admin-cabang/${user?.id_cabang}/dashboard/produk` },
  ];

  const pages =
    user?.role === "super admin" ? superAdminPages : adminCabangPages;

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <header className="bg-gradient-to-r from-white to-gray-50 p-4 flex justify-between items-center border-b border-gray-200 shadow-sm">
      {/* Left Section - Sidebar Toggle and Search */}
      <div className="flex items-center gap-4">
        {/* ✅ Sidebar Toggle Button */}
        <motion.button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 md:hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isSidebarOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
        >
          <Menu size={20} className="text-gray-600" />
        </motion.button>

        {/* Search Section */}
        <div className="relative w-64" ref={searchRef}>
          <div className="relative">
            {/* Search Icon */}
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            {/* Input */}
            <input
              type="text"
              placeholder="Search page..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          {/* 🔍 Dropdown hasil pencarian */}
          {searchTerm && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-30 overflow-hidden"
            >
              {filteredPages.length > 0 ? (
                filteredPages.map((page, index) => (
                  <motion.li
                    key={index}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 border-b border-gray-100 last:border-b-0"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      navigate(page.path);
                      setSearchTerm("");
                      setIsSearchOpen(false);
                    }}
                  >
                    {page.name}
                  </motion.li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-400 text-center">No page found</li>
              )}
            </motion.ul>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-6">
        {/* Greeting */}
        <span className="text-sm font-semibold text-gray-700 cursor-pointer">
          Hello, {user?.nama || "Guest"}
        </span>

        {/* Logout */}
        <motion.div
          onClick={handleLogout}
          className="relative w-10 h-10 flex items-center justify-center rounded-full cursor-pointer overflow-hidden group"
          whileTap={{ scale: 0.9 }}
        >
          <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <LogOut size={22} className="text-red-600" />
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;