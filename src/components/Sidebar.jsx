import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home, BarChart2, Users, Layers, Settings,
  HelpCircle, Building2, UserCog, Wallet,
  Receipt, Package, ChevronDown, ChevronLeft, Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// === Komponen Pembantu: SidebarLink ===
const SidebarLink = ({ to, label, icon, basePath, collapsed, onClick }) => {
  return (
    <NavLink
      to={`${basePath}${to}`}
      className="relative flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all duration-300 group"
      onClick={onClick}
    >
      {({ isActive }) => (
        <>
          {/* Background aktif */}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute inset-0 bg-green-100 rounded-xl"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}

          {/* Garis aktif di kiri */}
          {isActive && (
            <div className="absolute left-0 top-1 bottom-1 w-1 bg-green-600 rounded-r-lg" />
          )}

          <span
            className={`relative flex items-center gap-3 z-10 
              ${isActive ? "text-green-800 font-bold" : "text-gray-600 group-hover:text-green-600"}
              ${collapsed ? "justify-center w-full" : ""}`}
          >
            <span
              className={`min-w-[18px] ${isActive ? "text-green-600" : "text-gray-500 group-hover:text-green-600"}`}
            >
              {icon}
            </span>
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </span>

          {/* Tooltip saat collapsed */}
          {collapsed && (
            <span className="absolute left-full ml-4 whitespace-nowrap px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl">
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

// === Komponen Utama: Sidebar ===
const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const cabang = JSON.parse(localStorage.getItem("cabang"));

  let basePath = "/super-admin/dashboard";
  if (user?.role === "admin cabang" && cabang?.id_cabang) {
    basePath = `/admin-cabang/${cabang.id_cabang}/dashboard`;
  }

  const menuItems = [
    { to: "/general", label: "General", icon: <Home size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/reports", label: "Reports", icon: <BarChart2 size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/kelola-cabang", label: "Kelola Cabang", icon: <Building2 size={18} />, roles: ["super admin"] },
    { to: "/produk", label: "Produk", icon: <Layers size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/karyawan", label: "Karyawan", icon: <Users size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/branch", label: "Admin Cabang", icon: <UserCog size={18} />, roles: ["super admin"] },
    { to: "/pengeluaran", label: "Pengeluaran", icon: <Wallet size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/transaksi", label: "Transaksi", icon: <Receipt size={18} />, roles: ["super admin"] },
    { to: "/bahan", label: "Bahan", icon: <Package size={18} />, roles: ["super admin"] },
  ];

  // Tutup sidebar saat klik menu di mobile
  const handleLinkClick = () => {
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Tombol buka sidebar di mobile */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 bg-green-600 text-white p-2 rounded-lg shadow-md"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Overlay untuk mode mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar utama */}
      <motion.div
        animate={{ width: collapsed ? 80 : 288 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed lg:static top-0 left-0 h-screen z-40 bg-white border-r border-gray-200 flex flex-col shadow-xl 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
          transition-transform duration-300`}
      >
        {/* Header */}
        <div className="relative p-5 border-b border-gray-200 bg-gradient-to-r from-green-700 to-green-800 text-white">
          {!collapsed ? (
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold tracking-tight">GoChicken</h1>
                <span className="px-2 py-1 text-xs font-semibold bg-white/25 text-white rounded-full backdrop-blur-sm shadow-inner">
                  {user?.role || "Guest"}
                </span>
              </div>
              <p className="text-sm mt-1 font-light text-white/80">
                {cabang?.nama_cabang || "Pusat"}
              </p>
            </div>
          ) : (
            <h1 className="text-center text-xl font-extrabold">GC</h1>
          )}

          {/* Tombol collapse (desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 bg-green-700 hover:bg-green-800 text-white p-2 rounded-full shadow-xl transition border-4 border-white"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft size={16} />
            </motion.div>
          </button>

          {/* Tombol close di mobile */}
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-2 right-2 p-1 text-white hover:bg-white/20 rounded-full lg:hidden"
            >
              ✕
            </button>
          )}
        </div>

        {/* Menu */}
        <div className="flex-grow px-3 py-5 space-y-4 overflow-y-auto custom-scrollbar">
          <div
            onClick={() => setOpenDropdown(!openDropdown)}
            className={`px-3 py-2 rounded-xl border-2 border-gray-200 flex justify-between items-center cursor-pointer 
              ${collapsed ? "justify-center" : ""} 
              bg-gray-50 hover:bg-green-50 transition-all shadow-sm`}
          >
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-green-600" />
              {!collapsed && <span className="font-semibold text-gray-800 whitespace-nowrap">All Sites</span>}
            </div>
            <ChevronDown
              size={18}
              className={`text-gray-500 transition-transform duration-300 ${openDropdown ? "rotate-180" : ""} ${collapsed ? "hidden" : ""}`}
            />
          </div>

          <AnimatePresence>
            {openDropdown && (
              <motion.div
                className={`mt-2 space-y-1 ${collapsed ? "flex flex-col items-center" : "ml-2"}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {menuItems
                  .filter((item) => item.roles.includes(user?.role))
                  .map((item, idx) => (
                    <SidebarLink
                      key={idx}
                      to={item.to}
                      label={item.label}
                      icon={item.icon}
                      basePath={basePath}
                      collapsed={collapsed}
                      onClick={handleLinkClick}
                    />
                  ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-t border-gray-200 pt-4 mt-4" />
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t border-gray-200 bg-white shadow-inner ${
            collapsed ? "flex flex-col items-center space-y-2" : "space-y-1"
          }`}
        >
          <SidebarLink
            to="/help"
            label="Help Center"
            icon={<HelpCircle size={20} />}
            basePath={basePath}
            collapsed={collapsed}
            onClick={handleLinkClick}
          />
          <SidebarLink
            to="/settings"
            label="Settings"
            icon={<Settings size={20} />}
            basePath={basePath}
            collapsed={collapsed}
            onClick={handleLinkClick}
          />
        </div>
      </motion.div>

      {/* CSS scrollbar custom */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
};

export default Sidebar;