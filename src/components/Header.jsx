import React, { useState, useRef, useEffect } from "react";
import { 
  LogOut, 
  X, 
  Menu,
  Calendar,
  Clock,
  Sparkles,
  PlusCircle,
  Package,
  Users,
  Building,
  CreditCard,
  FileText,
  ShoppingCart
} from "lucide-react"; 
//eslint-disable-next-line no-unused-vars 
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, NavLink } from "react-router-dom";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  // State for the new Quick Actions dropdown
  const [isActionsOpen, setIsActionsOpen] = useState(false); 
  const actionsRef = useRef(null);
  
  const [currentTime, setCurrentTime] = useState(new Date());

  const user = JSON.parse(localStorage.getItem("user"));
  const cabang = JSON.parse(localStorage.getItem("cabang"));

  let basePath = "/super-admin/dashboard";
  if (user?.role === "admin cabang" && cabang?.id_cabang) {
    basePath = `/admin-cabang/${cabang.id_cabang}/dashboard`;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cabang");
    navigate("/");
  };
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Closes the dropdown if you click outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quick Actions for Admin Cabang
  const adminCabangActions = [
    { 
      label: "Buat Pesanan Baru", 
      to: `${basePath}/pemesanan`, 
      icon: <PlusCircle size={16}/>, 
      action: () => navigate(`${basePath}/pemesanan`) 
    },
    { 
      label: "Tambah Pengeluaran", 
      to: `${basePath}/pengeluaran`, 
      icon: <PlusCircle size={16}/>, 
      action: () => navigate(`${basePath}/pengeluaran`) 
    },
    { 
      label: "Tambah Karyawan", 
      to: `${basePath}/karyawan`, 
      icon: <PlusCircle size={16}/>, 
      action: () => navigate(`${basePath}/karyawan`) 
    },
  ];

  // Quick Actions for Super Admin (CRUD operations for the pages we redesigned)
  const superAdminActions = [
    { 
      label: "Tambah Produk", 
      to: "/super-admin/produk", 
      icon: <Package size={16}/>, 
      action: () => navigate("/super-admin/dashboard/produk") 
    },
    { 
      label: "Tambah Karyawan", 
      to: "/super-admin/karyawan", 
      icon: <Users size={16}/>, 
      action: () => navigate("/super-admin/dashboard/karyawan") 
    },
    { 
      label: "Tambah Admin Cabang", 
      to: "/super-admin/admin-cabang", 
      icon: <Building size={16}/>, 
      action: () => navigate("/super-admin/dashboard/branch") 
    },
    { 
      label: "Tambah Pengeluaran", 
      to: "/super-admin/pengeluaran", 
      icon: <CreditCard size={16}/>, 
      action: () => navigate("/super-admin/dashboard/pengeluaran") 
    },
    { 
      label: "Tambah Jenis Pengeluaran", 
      to: "/super-admin/jenis-pengeluaran", 
      icon: <FileText size={16}/>, 
      action: () => navigate("/super-admin/dashboard/jenis-pengeluaran") 
    },
    { 
      label: "Tambah Bahan Baku Pakai", 
      to: "/super-admin/bahan-baku", 
      icon: <ShoppingCart size={16}/>, 
      action: () => navigate("/super-admin/dashboard/bahan-baku-pakai") 
    },
  ];

  // Determine which actions to show based on user role
  const quickActions = user?.role === "super admin" ? superAdminActions : adminCabangActions;

  // Determine greeting based on user role
  const userGreeting = user?.role === "super admin" ? "Hello, Super Admin" : `Hello, ${user?.nama || "Guest"}`;

  return (
    <header className="bg-gradient-to-r from-white to-gray-50 p-4 flex justify-between items-center border-b border-gray-200 shadow-sm h-16">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden text-gray-600 hover:text-gray-800">
            <Menu size={24} />
        </button>

        <div className="hidden sm:flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span className="text-sm font-medium">{format(currentTime, 'EEEE, d MMMM yyyy', { locale: id })}</span>
            </div>
            <div className="w-px h-5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
                <Clock size={16} />
                <span className="text-sm font-medium">{format(currentTime, 'HH:mm:ss')}</span>
            </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Quick Actions Button */}
        <div className="relative" ref={actionsRef}>
          <motion.button 
            className="p-2 rounded-full hover:bg-gray-100 relative bg-red-50 text-red-600"
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsActionsOpen(!isActionsOpen)}
          >
            <Sparkles size={20} />
          </motion.button>

          <AnimatePresence>
            {isActionsOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-40 overflow-hidden"
              >
                <div className="p-3 border-b bg-gray-50/50">
                  <h3 className="text-sm font-bold text-gray-800">Aksi Cepat</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {user?.role === "super admin" ? "Manajemen Sistem" : "Operasional Cabang"}
                  </p>
                </div>
                <ul className="p-1 max-h-80 overflow-y-auto">
                  {quickActions.map((action) => (
                    <li key={action.label}>
                        <a 
                            href="#" 
                            onClick={(e) => {
                                e.preventDefault();
                                action.action();
                                setIsActionsOpen(false);
                            }} 
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                        >
                            {action.icon} {action.label}
                        </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm font-semibold text-gray-700 hidden sm:block">
            {userGreeting}
          </span>
        </div>
        <motion.div onClick={handleLogout} className="relative w-10 h-10 flex items-center justify-center rounded-full cursor-pointer overflow-hidden group" whileTap={{ scale: 0.9 }}>
          <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <motion.div initial={{ x: 0 }} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <LogOut size={22} className="text-red-600" />
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;