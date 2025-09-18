import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home, BarChart2, Users, Layers, Map, Settings,
  HelpCircle, Building2, UserCog, Wallet, ChevronDown,
  Receipt, Package, Boxes
} from "lucide-react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(false);

  const linkClass = ({ isActive }) =>
    isActive
      ? "flex items-center p-2 bg-green-100 text-green-700 font-semibold rounded-lg"
      : "flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg";

 // Ambil user & cabang dari localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const cabang = JSON.parse(localStorage.getItem("cabang"));


  // Tentukan basePath berdasarkan role
  let basePath = "/super-admin/dashboard";
  if (user?.role === "admin cabang" && cabang?.id_cabang) {
    basePath = `/admin-cabang/${cabang.id_cabang}/dashboard`;
  }

  // Daftar menu berdasarkan role
  const menuItems = [
    { to: "/general", label: "General", icon: <Home size={18} className="mr-2" />, roles: ["super admin", "admin cabang"] },
    { to: "/reports", label: "Reports", icon: <BarChart2 size={18} className="mr-2" />, roles: ["super admin", "admin cabang"] },
    { to: "/kelola-cabang", label: "Kelola Cabang", icon: <Building2 size={18} className="mr-2" />, roles: ["super admin"] },
    { to: "/karyawan", label: "Karyawan", icon: <Users size={18} className="mr-2" />, roles: ["super admin", "admin cabang"] },
    { to: "/branch", label: "Admin Cabang", icon: <UserCog size={18} className="mr-2" />, roles: ["super admin"] },
    { to: "/pengeluaran", label: "Pengeluaran", icon: <Wallet size={18} className="mr-2" />, roles: ["super admin", "admin cabang"] },
    { to: "/transaksi", label: "Transaksi", icon: <Receipt size={18} className="mr-2" />, roles: ["super admin"] },
    { to: "/bahan", label: "Bahan", icon: <Package size={18} className="mr-2" />, roles: ["super admin"] },
    { to: "/stok", label: "Stok", icon: <Boxes size={18} className="mr-2" />, roles: ["super admin"] },
  ];


  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Management</h1>
      </div>

      {/* Isi Sidebar Scrollable */}
      <div className="flex-grow p-4 space-y-2 overflow-y-auto scrollbar-hide">
        {/* Dropdown All Sites */}
        <div
          onClick={() => setOpenDropdown(!openDropdown)}
          className="p-2 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        >
          <span className="font-semibold text-gray-800">All sites</span>
          <ChevronDown
            size={18}
            className={`text-gray-500 transition-transform ${openDropdown ? "rotate-180" : ""}`}
          />
        </div>

        {/* Isi Dropdown dengan Animasi (ke bawah) */}
        <AnimatePresence>
        {openDropdown && (
          <motion.div
            className="ml-3 mt-2 space-y-1"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {menuItems
              .filter(item => item.roles.includes(user?.role))
              .map((item, idx) => (
                <NavLink
                  key={idx}
                  to={`${basePath}${item.to}`}
                  className={linkClass}
                >
                  {item.icon} {item.label}
                </NavLink>
              ))}
          </motion.div>
        )}
      </AnimatePresence>


        {/* Menu utama lain */}
        <nav className="space-y-1 mt-4">
          <a href="#" className="flex items-center p-2 text-gray-400 cursor-not-allowed">
            <Map size={20} className="mr-3" /> Heatmap
          </a>
          <a href="#" className="flex items-center p-2 text-gray-400 cursor-not-allowed">
            <Home size={20} className="mr-3" /> Domain
          </a>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <HelpCircle size={20} className="mr-3" /> Help Center
        </a>
        <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Settings size={20} className="mr-3" /> Settings
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
