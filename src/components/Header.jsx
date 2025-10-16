import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  LogOut,
  X,
  History,
  CheckCircle,
  XCircle,
  Menu,
  AlertTriangle, // Ikon baru untuk modal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/context/NotificationContext";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // 🟢 STATE BARU UNTUK MODAL LOGOUT
  const [isModalOpen, setIsModalOpen] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const { notifications, clearNotifications } = useNotification();

  // 🟢 FUNGSI BARU UNTUK KONFIRMASI LOGOUT
  const handleConfirmLogout = () => {
    // Lakukan proses logout yang sebenarnya
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cabang");
    navigate("/");
    setIsModalOpen(false); // Pastikan modal tertutup
  };

  // 🟢 FUNGSI LAMA DIMODIFIKASI UNTUK MEMBUKA MODAL
  const handleLogoutClick = () => {
    setIsModalOpen(true);
  };

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
        if (window.innerWidth >= 640 && !searchTerm) {
          setIsSearchOpen(false);
        }
      }
      // Logic untuk menutup Notifikasi
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchTerm]);

  const getNotifColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-400 bg-green-50/50 text-green-700';
      case 'error':
        return 'border-red-400 bg-red-50/50 text-red-700';
      case 'info':
      default:
        return 'border-blue-400 bg-blue-50/50 text-blue-700';
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-green-600 min-w-4" />;
      case 'error':
        return <XCircle size={18} className="text-red-600 min-w-4" />;
      case 'info':
      default:
        return <History size={18} className="text-blue-600 min-w-4" />;
    }
  };


    return (
    <>
      {/* CSS Kustom untuk Scrollbar */}
      <style>{`.custom-notif-scrollbar::-webkit-scrollbar{width:8px}.custom-notif-scrollbar::-webkit-scrollbar-track{background:#f0f0f0;border-radius:10px}.custom-notif-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}.custom-notif-scrollbar::-webkit-scrollbar-thumb:hover{background:#94a3b8}`}</style>

      {/* Header Utama */}
      <header className="bg-gradient-to-r from-white to-gray-50 p-4 flex flex-wrap sm:flex-nowrap justify-between items-center border-b border-gray-200 shadow-sm">

        {/* Tombol Menu untuk Mobile Sidebar */}
        <div className="flex items-center space-x-3 order-0 sm:order-none">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-full hover:bg-gray-200 lg:hidden"
            >
              <Menu size={20} className="text-gray-700" />
            </button>
        </div>


        {/* Search Section DENGAN ANIMASI KEMBALI */}
        <div className="relative w-full sm:w-1/3 order-1 sm:order-none mb-3 sm:mb-0" ref={searchRef}>
          <div className="flex items-center relative">

            {/* Input Search - Menggunakan transisi width */}
            <input
              type="text"
              placeholder="Cari halaman..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`py-2 pr-4 text-gray-700 rounded-full transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-700
                      // Selalu w-full di mobile
                      w-full pl-10 bg-white shadow-lg opacity-100

                      // LOGIKA DESKTOP UNTUK ANIMASI:
                      sm:w-64 sm:focus:w-full
                      ${!isSearchOpen && window.innerWidth >= 640 && !searchTerm
                        ? "sm:w-10 sm:p-0 sm:opacity-0 sm:pointer-events-none" // Menyembunyikan dan menyempit di desktop jika tidak terbuka
                        : "sm:w-64 sm:pl-10 sm:opacity-100" // Lebar normal di desktop
                      }
                      `}
              onFocus={() => setIsSearchOpen(true)}
            />

            {/* Tombol/Ikon Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`absolute inset-y-0 flex items-center transition-all duration-500 ease-in-out
                      left-0 ml-3 text-gray-500

                      // LOGIKA DESKTOP UNTUK IKON/TOMBOL:
                      ${isSearchOpen || searchTerm
                          ? "sm:text-gray-500"
                          : "sm:ml-0 sm:bg-green-700 sm:p-2 sm:rounded-full sm:text-white sm:hover:bg-green-800 sm:left-0 sm:opacity-100 sm:w-10 sm:h-10 sm:justify-center hidden sm:flex"
                      }
                      `}
              style={{ zIndex: 10 }}
            >
              <Search size={20} />
            </button>

          </div>

          {/* Dropdown hasil pencarian */}
          {isSearchOpen && searchTerm && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 mt-2 w-full sm:w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-30 overflow-hidden"
            >
              {filteredPages.length > 0 ? (
                filteredPages.map((page, index) => (
                  <motion.li
                    key={index}
                    className="px-4 py-2 hover:bg-green-50 cursor-pointer text-gray-700 text-sm"
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
                <li className="px-4 py-2 text-gray-400 text-sm">Halaman tidak ditemukan</li>
              )}
            </motion.ul>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 sm:space-x-4 order-2 sm:order-none">

          {/* Notification Button and Dropdown */}
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
              <Bell size={24} className="text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white">
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

                  // FIX POSISI NOTIFIKASI
                  className="absolute mt-3
                             left-0 sm:left-auto sm:right-0
                             w-64 max-w-[90vw] sm:w-96
                             bg-white border border-gray-200 rounded-xl shadow-2xl z-40 overflow-hidden"
                >
                  {/* Header Dropdown (Konten tetap sama) */}
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

                  {/* List Notifikasi */}
                  <ul className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-gray-100 custom-notif-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <motion.li
                          key={notif.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`p-3 border-l-4 ${getNotifColor(notif.type)} transition-colors duration-200 hover:bg-gray-100/70`}
                        >
                          <div className="flex items-start gap-2">
                            {getNotifIcon(notif.type)}
                            <div className="flex-grow">
                              <p className="text-sm font-medium leading-snug">{notif.message}</p>
                              <span className="text-xs opacity-75 mt-0.5 block">{notif.timestamp}</span>
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

          {/* Greeting (Sembunyikan di mobile) */}
          <div className="hidden sm:flex items-center">
            <span className="text-sm font-semibold text-gray-700">
              Hello, {user?.nama || "Guest"}
            </span>
          </div>

          {/* Logout */}
          <motion.div
            onClick={handleLogoutClick}
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

      {/* 🟢 MODAL LOGOUT KUSTOM DENGAN ANIMASI */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)} // Tutup saat klik di luar
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
              initial={{ y: "-100vh", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100vh", opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              onClick={(e) => e.stopPropagation()} // Cegah penutupan saat klik di dalam modal
            >
              {/* Header Modal */}
              <div className="bg-red-50 p-4 flex items-center justify-between border-b border-red-100">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={24} className="text-red-600" />
                  <h4 className="text-lg font-bold text-red-700">Konfirmasi Logout</h4>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-200"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  Anda yakin ingin keluar dari sesi {user?.role || "Admin"}? Anda akan diarahkan kembali ke halaman login.
                </p>

                {/* Footer/Aksi Modal */}
                <div className="flex justify-end space-x-3">
                  <motion.button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    Batal
                  </motion.button>
                  <motion.button
                    onClick={handleConfirmLogout}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md"
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut size={16} className="inline mr-1" /> Logout
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 🟢 END MODAL LOGOUT KUSTOM */}
    </>
  );
};

export default Header;