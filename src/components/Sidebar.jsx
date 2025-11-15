import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home, BarChart2, Users, Layers, Settings,
  HelpCircle, Building2, UserCog, Wallet,
  Receipt, Package, Boxes, X, Feather, WalletCards,
  DatabaseBackup,
  ClipboardClock,
  HandCoins
} from "lucide-react";
//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const cabang = JSON.parse(localStorage.getItem("cabang"));

  let basePath = "/super-admin/dashboard";
  if (user?.role === "admin cabang" && cabang?.id_cabang) {
    basePath = `/admin-cabang/${cabang.id_cabang}/dashboard`;
  }

  const menuItems = [
    { to: "/general", label: "General", icon: <Home size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/reports", label: "Reports", icon: <BarChart2 size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/reports-daily", label: "Daily Report", icon: <BarChart2 size={18} />, roles: ["super admin"] },
    { to: "/kelola-cabang", label: "Kelola Cabang", icon: <Building2 size={18} />, roles: ["super admin"] },
    { to: "/produk", label: "Produk", icon: <Layers size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/karyawan", label: "Karyawan", icon: <Users size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/kasir", label: "Kasir", icon: <HandCoins size={18} />, roles: ["admin cabang"] },
    { to: "/branch", label: "Admin Cabang", icon: <UserCog size={18} />, roles: ["super admin"] },
    { to: "/pemesanan", label: "Pemesanan", icon: <Receipt size={18} />, roles: ["admin cabang"] },
    { to: "/pengeluaran", label: "Pengeluaran", icon: <Wallet size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/jenis-pengeluaran", label: "Jenis Pengeluaran", icon: <WalletCards size={18} />, roles: ["super admin"] },
    { to: "/transaksi", label: "Transaksi", icon: <Receipt size={18} />, roles: ["super admin"] },
    { to: "/bahan", label: "Bahan", icon: <Package size={18} />, roles: ["super admin"] },
    { to: "/bahan-baku-pakai", label: "Bahan Baku Pakai", icon: <Boxes size={18} />, roles: ["super admin"] },
  ];

  const sidebarClasses = `
    w-64 bg-white border-r border-gray-200 flex flex-col h-screen shadow-lg 
    fixed top-0 left-0 z-30 transition-transform duration-300 ease-in-out 
    lg:relative lg:translate-x-0 lg:z-auto
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <div className={sidebarClasses}>
      {/* Header Sidebar */}
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-lg">
                <Feather size={20} className="text-white" />
            </div>
            <div>
                <p className="font-bold text-lg text-gray-800">GoChicken</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || "Guest"}</p>
            </div>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-gray-500 hover:text-gray-800">
            <X size={24}/>
        </button>
      </div>

      {/* Main Menu Items */}
      <div className="flex-grow px-4 py-5 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems
          .filter(item => item.roles.includes(user?.role))
          .map((item, idx) => (
            <NavLink
              key={idx}
              to={`${basePath}${item.to}`}
              onClick={() => setIsSidebarOpen(false)}
              className="relative flex items-center px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-red-100 rounded-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative flex items-center gap-3 ${
                      isActive
                        ? "text-red-600 font-semibold"
                        : "text-gray-600 hover:text-red-600"
                    }`}
                  >
                    <span className={isActive ? "text-red-600" : "text-gray-400"}>{item.icon}</span>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
      </div>

      {/* Bottom Menu Items - Conditionally shown based on role */}
      <div className="space-y-2 p-4 border-t border-gray-200">
        {/* Backup Data - Show for both super admin and admin cabang */}
        <NavLink 
          to={`${basePath}/backup`} 
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all"
        >
          <DatabaseBackup size={18} /> 
          Backup Data
        </NavLink>

        {/* Audit Log - ONLY show for super admin */}
        {user?.role === "super admin" && (
          <NavLink 
            to={`${basePath}/auditlog`} 
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all"
          >
            <ClipboardClock size={18} /> 
            Audit Log
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Sidebar;