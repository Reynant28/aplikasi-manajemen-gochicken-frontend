// src/components/Header.jsx
import { useState, useRef, useEffect } from "react";
import {
  Bell,
  LogOut,
  ChevronRight,
  Home,
  Menu,
  AlertTriangle,
  Trash2,
  History,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  Trash,
  Calendar,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "../components/context/NotificationContext";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const notifRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const { notifications, clearNotifications, removeNotification } = useNotification();

  // Effect untuk mendeteksi perubahan ukuran layar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fungsi untuk generate breadcrumb berdasarkan path
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [];
    
    // Tambahkan home berdasarkan role
    const homePath = user?.role === "super admin" 
      ? "/super-admin/dashboard/general" 
      : `/admin-cabang/${user?.id_cabang}/dashboard/general`;
    
    breadcrumbs.push({ 
      name: isMobile ? "" : "Dashboard", 
      path: homePath, 
      icon: <Home size={16} />,
      isLast: pathnames.length === 0
    });

    pathnames.forEach((value, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      
      // Mapping nama yang lebih user-friendly
      const nameMap = {
        'super-admin': 'Super Admin',
        'admin-cabang': 'Admin Cabang',
        'dashboard': isMobile ? '' : 'Dashboard',
        'general': 'Overview',
        'reports': 'Laporan',
        'daily': 'Laporan Harian',
        'kelola-cabang': 'Kelola Cabang',
        'produk': 'Produk',
        'branch': 'Admin Cabang',
        'pengeluaran': 'Pengeluaran',
        'karyawan': 'Karyawan',
        'transaksi': 'Transaksi',
        'bahan': 'Bahan Baku',
        'bahan-baku-pakai': 'Pemakaian Harian'
      };

      const friendlyName = nameMap[value] || value.replace(/-/g, ' ');
      const isLast = index === pathnames.length - 1;
      
      // Untuk mobile, hanya tampilkan item terakhir atau singkatkan
      let displayName = friendlyName;
      if (isMobile) {
        if (isLast) {
          // Untuk item terakhir, tampilkan singkatan jika perlu
          displayName = friendlyName.length > 12 ? friendlyName.substring(0, 10) + '...' : friendlyName;
        } else {
          // Untuk item bukan terakhir, sembunyikan atau singkatkan
          displayName = friendlyName.length > 8 ? friendlyName.substring(0, 6) + '...' : friendlyName;
        }
      }
      
      breadcrumbs.push({ 
        name: displayName, 
        originalName: friendlyName,
        path: path,
        isLast: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cabang");
    navigate("/");
    setIsModalOpen(false);
  };

  const handleLogoutClick = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fungsi untuk menentukan warna berdasarkan jenis aksi
  const getNotifColor = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('telah ditambahkan') || 
        lowerMessage.includes('telah dibuat') ||
        lowerMessage.includes('success') ||
        lowerMessage.includes('tambah') ||
        lowerMessage.includes('backup telah')) {
      return 'border-green-400 bg-green-50/80 text-green-800';
    } else if (lowerMessage.includes('telah diubah') || 
               lowerMessage.includes('telah mengubah') ||
               lowerMessage.includes('update') ||
               lowerMessage.includes('ubah')) {
      return 'border-blue-400 bg-blue-50/80 text-blue-800';
    } else if (lowerMessage.includes('telah dihapus') || 
               lowerMessage.includes('menghapus') ||
               lowerMessage.includes('delete') ||
               lowerMessage.includes('hapus')) {
      return 'border-red-400 bg-red-50/80 text-red-800';
    } else if (lowerMessage.includes('gagal') || 
               lowerMessage.includes('error') ||
               lowerMessage.includes('failed')) {
      return 'border-orange-400 bg-orange-50/80 text-orange-800';
    } else {
      return 'border-green-400 bg-green-50/80 text-green-800';
    }
  };

  // Fungsi untuk menentukan icon berdasarkan jenis aksi
  const getNotifIcon = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('telah ditambahkan') || 
        lowerMessage.includes('telah dibuat') ||
        lowerMessage.includes('success') ||
        lowerMessage.includes('tambah') ||
        lowerMessage.includes('backup telah')) {
      return <Plus size={18} className="text-green-600 min-w-4" />;
    } else if (lowerMessage.includes('telah diubah') || 
               lowerMessage.includes('telah mengubah') ||
               lowerMessage.includes('update') ||
               lowerMessage.includes('ubah')) {
      return <Edit size={18} className="text-blue-600 min-w-4" />;
    } else if (lowerMessage.includes('telah dihapus') || 
               lowerMessage.includes('menghapus') ||
               lowerMessage.includes('delete') ||
               lowerMessage.includes('hapus')) {
      return <Trash size={18} className="text-red-600 min-w-4" />;
    } else if (lowerMessage.includes('gagal') || 
               lowerMessage.includes('error') ||
               lowerMessage.includes('failed')) {
      return <AlertTriangle size={18} className="text-orange-600 min-w-4" />;
    } else {
      return <History size={18} className="text-gray-600 min-w-4" />;
    }
  };

  // Fungsi untuk format group notifications by date
  const groupNotificationsByDate = () => {
    const grouped = {};
    
    notifications.forEach(notif => {
      if (!grouped[notif.date]) {
        grouped[notif.date] = [];
      }
      grouped[notif.date].push(notif);
    });
    
    return grouped;
  };

  // Fungsi untuk mengganti kata "berhasil" menjadi "telah" di pesan notifikasi
  const formatNotificationMessage = (message) => {
    return message
      .replace(/berhasil ditambahkan/gi, 'telah ditambahkan')
      .replace(/berhasil dibuat/gi, 'telah dibuat')
      .replace(/berhasil diubah/gi, 'telah diubah')
      .replace(/berhasil mengubah/gi, 'telah mengubah')
      .replace(/berhasil dihapus/gi, 'telah dihapus')
      .replace(/berhasil menghapus/gi, 'telah menghapus')
      .replace(/backup berhasil/gi, 'backup telah');
  };

  const groupedNotifications = groupNotificationsByDate();

  // Cek apakah user adalah super admin
  const isSuperAdmin = user?.role === "super admin";

  return (
    <>
      <style>{`
        .custom-notif-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-notif-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .custom-notif-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-notif-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Responsive text sizes */
        @media (max-width: 640px) {
          .responsive-text {
            font-size: 0.75rem;
          }
          .breadcrumb-item {
            padding: 0.375rem 0.5rem;
          }
        }
      `}</style>

      {/* Header Utama - Sembunyikan di mobile */}
      {!isMobile && (
        <header className="bg-white px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b border-gray-200 shadow-sm">
          
          {/* Left Section - Menu Button & Breadcrumb */}
          <div className="flex items-center flex-1 min-w-0">
            <button
              onClick={onMenuClick}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 lg:hidden transition-colors duration-200 mr-1 sm:mr-2"
            >
              <Menu size={18} className="sm:w-5 text-gray-700" />
            </button>
            
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overflow-hidden">
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={index} className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  {index > 0 && (
                    <ChevronRight size={14} className="sm:w-4 text-gray-400 flex-shrink-0" />
                  )}
                  {breadcrumb.isLast ? (
                    <span 
                      className="text-gray-900 font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-1 sm:gap-2 breadcrumb-item"
                      title={breadcrumb.originalName}
                    >
                      {breadcrumb.icon && index === 0 && (
                        <span className="flex-shrink-0">{breadcrumb.icon}</span>
                      )}
                      <span className="truncate max-w-16 xs:max-w-20 sm:max-w-32 md:max-w-48 responsive-text">
                        {breadcrumb.name}
                      </span>
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate(breadcrumb.path)}
                      className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center gap-1 sm:gap-2 border border-transparent hover:border-gray-200 breadcrumb-item"
                      title={breadcrumb.originalName}
                    >
                      {breadcrumb.icon && index === 0 && (
                        <span className="flex-shrink-0">{breadcrumb.icon}</span>
                      )}
                      <span className="truncate max-w-16 xs:max-w-20 sm:max-w-32 md:max-w-48 responsive-text">
                        {breadcrumb.name}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4">
            
            {/* Notification - Hanya tampil untuk Super Admin */}
            {isSuperAdmin && (
              <div className="relative" ref={notifRef}>
                <motion.button
                  className="p-1.5 sm:p-2.5 rounded-xl hover:bg-gray-100 relative transition-colors duration-200"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                >
                  <Bell size={18} className="sm:w-5 md:w-6 text-gray-600" />
                  {notifications.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border border-white"
                    >
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </motion.span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute mt-2 right-0 w-72 xs:w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-40 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="p-3 sm:p-4 flex justify-between items-center border-b border-gray-100 bg-white">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <History size={16} className="sm:w-5 text-green-600" />
                          Riwayat Aktivitas
                        </h3>
                        <motion.button
                          onClick={clearNotifications}
                          className="text-xs sm:text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-red-50 transition-colors duration-150"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 size={14} className="sm:w-4" />
                          <span className="hidden xs:inline">Clear</span>
                        </motion.button>
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-64 sm:max-h-80 overflow-y-auto custom-notif-scrollbar">
                        {notifications.length > 0 ? (
                          <div className="divide-y divide-gray-100">
                            {Object.entries(groupedNotifications).map(([date, dayNotifications]) => (
                              <div key={date}>
                                {/* Date Header */}
                                <div className="sticky top-0 bg-gray-50 px-3 sm:px-4 py-2 border-b border-gray-200">
                                  <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                    <Calendar size={12} className="text-gray-400" />
                                    <span>{date}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-500">{dayNotifications.length} aktivitas</span>
                                  </div>
                                </div>
                                
                                {/* Notifications for this date */}
                                {dayNotifications.map((notif) => (
                                  <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className={`p-3 sm:p-4 border-l-4 ${getNotifColor(notif.message)} transition-colors duration-200 hover:bg-gray-50`}
                                  >
                                    <div className="flex items-start gap-2 sm:gap-3">
                                      <div className="flex-shrink-0 mt-0.5">
                                        {getNotifIcon(notif.message)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium leading-relaxed text-gray-900 break-words">
                                          {formatNotificationMessage(notif.message)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Clock size={12} className="text-gray-400" />
                                          <span className="text-xs text-gray-500">
                                            {notif.time}
                                          </span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => removeNotification(notif.id)}
                                        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors"
                                      >
                                        <XCircle size={14} className="text-gray-400" />
                                      </button>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 sm:p-8 text-center">
                            <History size={32} className="sm:w-12 mx-auto text-gray-300 mb-2 sm:mb-3" />
                            <p className="text-gray-500 text-xs sm:text-sm">Belum ada aktivitas baru</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User Greeting - Hidden on mobile */}
            <div className="hidden xs:flex items-center px-2 sm:px-3 py-1 sm:py-2">
              <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate max-w-20 sm:max-w-32">
                Hello, {user?.nama || "Guest"}
              </span>
            </div>

            {/* Logout Button */}
            <motion.button
              onClick={handleLogoutClick}
              className="p-1.5 sm:p-2.5 rounded-xl hover:bg-red-50 transition-colors duration-200 group relative"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <LogOut size={18} className="sm:w-5 md:w-6 text-red-600" />
              <div className="absolute inset-0 rounded-xl bg-red-500 opacity-0 group-hover:opacity-5 transition-opacity duration-200"></div>
            </motion.button>
          </div>
        </header>
      )}

      {/* Mobile Header Minimal - Hanya tampilkan menu button dan breadcrumb terakhir */}
      {isMobile && (
        <header className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-200 shadow-sm">
          <div className="flex items-center flex-1 min-w-0">
            <button
              onClick={onMenuClick}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 mr-2"
            >
              <Menu size={18} className="text-gray-700" />
            </button>
            
            {/* Breadcrumb terakhir saja untuk mobile */}
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center">
                {breadcrumbs.slice(-1).map((breadcrumb, index) => (
                  <div key={index} className="flex items-center">
                    {breadcrumb.isLast ? (
                      <span 
                        className="text-gray-900 font-medium px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-1 breadcrumb-item"
                        title={breadcrumb.originalName}
                      >
                        {breadcrumb.icon && (
                          <span className="flex-shrink-0">{breadcrumb.icon}</span>
                        )}
                        <span className="truncate max-w-32 responsive-text">
                          {breadcrumb.name}
                        </span>
                      </span>
                    ) : (
                      <button
                        onClick={() => navigate(breadcrumb.path)}
                        className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center gap-1 border border-transparent hover:border-gray-200 breadcrumb-item"
                        title={breadcrumb.originalName}
                      >
                        {breadcrumb.icon && (
                          <span className="flex-shrink-0">{breadcrumb.icon}</span>
                        )}
                        <span className="truncate max-w-32 responsive-text">
                          {breadcrumb.name}
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>

          {/* Right section untuk mobile - hanya notifikasi (jika super admin) dan logout */}
          <div className="flex items-center space-x-1 ml-2">
            {/* Notification untuk mobile - Hanya untuk Super Admin */}
            {isSuperAdmin && (
              <div className="relative" ref={notifRef}>
                <motion.button
                  className="p-1.5 rounded-xl hover:bg-gray-100 relative transition-colors duration-200"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                >
                  <Bell size={18} className="text-gray-600" />
                  {notifications.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border border-white"
                    >
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </motion.span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute mt-2 right-0 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-40 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="p-3 flex justify-between items-center border-b border-gray-100 bg-white">
                        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                          <History size={16} className="text-green-600" />
                          Riwayat Aktivitas
                        </h3>
                        <motion.button
                          onClick={clearNotifications}
                          className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-2 p-1.5 rounded-lg hover:bg-red-50 transition-colors duration-150"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 size={14} />
                          <span>Clear</span>
                        </motion.button>
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-64 overflow-y-auto custom-notif-scrollbar">
                        {notifications.length > 0 ? (
                          <div className="divide-y divide-gray-100">
                            {Object.entries(groupedNotifications).map(([date, dayNotifications]) => (
                              <div key={date}>
                                {/* Date Header */}
                                <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-200">
                                  <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                    <Calendar size={12} className="text-gray-400" />
                                    <span>{date}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-500">{dayNotifications.length} aktivitas</span>
                                  </div>
                                </div>
                                
                                {/* Notifications for this date */}
                                {dayNotifications.map((notif) => (
                                  <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className={`p-3 border-l-4 ${getNotifColor(notif.message)} transition-colors duration-200 hover:bg-gray-50`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <div className="flex-shrink-0 mt-0.5">
                                        {getNotifIcon(notif.message)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium leading-relaxed text-gray-900 break-words">
                                          {formatNotificationMessage(notif.message)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Clock size={12} className="text-gray-400" />
                                          <span className="text-xs text-gray-500">
                                            {notif.time}
                                          </span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => removeNotification(notif.id)}
                                        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors"
                                      >
                                        <XCircle size={14} className="text-gray-400" />
                                      </button>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <History size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-500 text-xs">Belum ada aktivitas baru</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Logout Button untuk mobile */}
            <motion.button
              onClick={handleLogoutClick}
              className="p-1.5 rounded-xl hover:bg-red-50 transition-colors duration-200"
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={18} className="text-red-600" />
            </motion.button>
          </div>
        </header>
      )}

      {/* Logout Confirmation Modal - Responsive */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xs xs:max-w-sm sm:max-w-md overflow-hidden mx-2"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-red-50 p-4 sm:p-6 flex items-center gap-3 sm:gap-4 border-b border-red-100">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg sm:rounded-xl">
                  <AlertTriangle size={20} className="sm:w-6 text-red-600" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-red-800">Konfirmasi Logout</h4>
                  <p className="text-red-600 text-xs sm:text-sm mt-1">Sesi {user?.role || "Admin"}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6">
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  Anda yakin ingin keluar? Anda akan diarahkan kembali ke halaman login.
                </p>

                {/* Actions */}
                <div className="flex justify-end space-x-2 sm:space-x-3 mt-4 sm:mt-6">
                  <motion.button
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                    whileTap={{ scale: 0.95 }}
                  >
                    Batal
                  </motion.button>
                  <motion.button
                    onClick={handleConfirmLogout}
                    className="px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 flex items-center gap-1 sm:gap-2 shadow-md"
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut size={14} className="sm:w-4" />
                    Logout
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;