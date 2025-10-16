// src/components/Header.jsx
import { useState, useRef, useEffect } from "react";
import { 
  Search, 
  Bell, 
  LogOut, 
  X, 
  History,
  CheckCircle, // ✅ Ikon untuk Sukses
  XCircle, // ✅ Ikon untuk Error/Delete
} from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/context/NotificationContext";

const Header = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");
  
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem("user"));
  const { notifications, clearNotifications } = useNotification();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cabang");
    navigate("/");
  };

  // 🔹 List halaman berdasarkan role (TIDAK BERUBAH)
  const superAdminPages = [
    { name: "General", path: "/super-admin/dashboard/general" },
    { name: "Reports", path: "/super-admin/dashboard/reports" },
    { name: "Kelola Cabang", path: "/super-admin/dashboard/kelola-cabang" },
    { name: "Produk", path: "/super-admin/dashboard/produk" },
    { name: "Admin Cabang", path: "/super-admin/dashboard/branch" },
    { name: "Pengeluaran", path: "/super-admin/dashboard/pengeluaran" },
    { name: "Karyawan", path: "/super-admin/dashboard/karyawan" },
    { name: "Transaksi", path: "/super-admin/dashboard/transaksi" },
    { name: "Bahan", path: "/super-admin/dashboard/bahan" },
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Logic untuk menutup Search
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      // ✅ Logic untuk menutup Notifikasi
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper untuk menentukan warna notifikasi (DIPERBAIKI)
  const getNotifColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-400 bg-green-50 text-green-700';
      case 'error':
        return 'border-red-400 bg-red-50 text-red-700';
      case 'info':
      default:
        return 'border-red-400 bg-red-50 text-red-700';
    }
  };
  
  // Helper baru untuk menentukan ikon notifikasi
  const getNotifIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600 min-w-4" />;
      case 'error':
        return <XCircle size={16} className="text-red-600 min-w-4" />;
      case 'info':
      default:
        return <History size={16} className="text-red-600 min-w-4" />;
    }
  };


  return (
    <header className="bg-gradient-to-r from-white to-gray-50 p-4 flex justify-between items-center border-b border-gray-200 shadow-sm">
      {/* Search Section */}
      <div className="relative w-1/3 ml-4" ref={searchRef}>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search page..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`py-2 pr-4 text-gray-700 rounded-full transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-700 ${
              isSearchOpen
                ? "w-64 pl-10 bg-white shadow-lg opacity-100"
                : "w-10 pl-10 bg-gray-200 shadow-none opacity-0 pointer-events-none"
            }`}
            onFocus={() => setIsSearchOpen(true)}
          />
          <button
            onClick={() => setIsSearchOpen(true)}
            className={`absolute inset-y-0 flex items-center transition-all duration-500 ease-in-out ${
              isSearchOpen
                ? "left-0 ml-3 text-gray-500"
                : "left-0 ml-0 bg-green-700 p-2 rounded-full text-white hover:bg-green-800"
            }`}
            style={isSearchOpen ? { zIndex: 10 } : { zIndex: 20 }}
          >
            <Search size={20} />
          </button>
        </div>

        {/* 🔍 Dropdown hasil pencarian (TIDAK BERUBAH) */}
        {isSearchOpen && searchTerm && (
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
                  className="px-4 py-2 hover:bg-green-50 cursor-pointer text-gray-700"
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
              <li className="px-4 py-2 text-gray-400">No page found</li>
            )}
          </motion.ul>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* ✅ Notification Button and Dropdown */}
        <div className="relative" ref={notifRef}>
          <motion.button
            className="p-2 rounded-full hover:bg-gray-100 relative"
            whileTap={{ scale: 0.9 }}
            whileHover={{
              rotate: [0, -10, 10, -10, 0],
              transition: { duration: 0.4 },
            }}
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            <Bell size={20} className="text-gray-600" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-40 overflow-hidden"
              >
                {/* 🌟 Header Dropdown yang Diperbarui */}
                <div className="p-4 flex justify-between items-center border-b bg-gray-50/50">
                  <h3 className="text-md font-bold text-gray-800 flex items-center gap-2">
                    <History size={18} className="text-green-600" /> Riwayat Aktivitas
                  </h3>
                  <button 
                    onClick={clearNotifications} 
                    className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1 p-1 rounded hover:bg-red-50 transition-colors"
                    title="Hapus Semua"
                  >
                    <X size={14} /> Clear
                  </button>
                </div>
                
                <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <motion.li
                        key={notif.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-3 border-l-4 ${getNotifColor(notif.type)} transition-colors duration-200 hover:bg-gray-100`}
                      >
                        {/* 🌟 Struktur notifikasi dengan Ikon */}
                        <div className="flex items-start gap-2">
                          {getNotifIcon(notif.type)}
                          <div className="flex-grow">
                            <p className="text-sm font-medium leading-snug">{notif.message}</p>
                            <span className="text-xs opacity-75 mt-1 block">{notif.timestamp}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))
                  ) : (
                    <li className="p-4 text-center text-gray-500 text-sm">
                      Belum ada aktivitas baru.
                    </li>
                  )}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* END Notification */}

        {/* Greeting */}
        <div className="flex items-center">
          <span className="text-sm font-semibold text-gray-700">
            Hello, {user?.nama || "Guest"}
          </span>
        </div>

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