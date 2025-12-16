// components/Sidebar.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home, BarChart2, Users, Layers, Settings,
  HelpCircle, Building2, UserCog, Wallet,
  Receipt, Package, ChevronDown, ChevronLeft, Menu, WalletCards,
  Database // Hanya Database icon yang diperlukan untuk navigasi
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// === Komponen Pembantu: SidebarLink ===
// Catatan: Prop isButton, onButtonClick, dan isLoading tetap ada untuk 
// reusability, tapi tidak digunakan untuk link Database yang baru.
const SidebarLink = ({ to, label, icon, basePath, collapsed, onClick, theme, isButton, onButtonClick, isLoading }) => {
  const baseClasses = `relative flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-all duration-300 group w-full text-left`;

  if (isButton) {
    // Logika untuk tombol aksi (misalnya Logout atau tombol lain di masa depan)
    return (
      <button
        onClick={onButtonClick}
        disabled={isLoading}
        className={`${baseClasses} ${isLoading ? 'opacity-50 cursor-not-allowed' : `text-gray-600 hover:${theme.hoverText} hover:${theme.activeBg}`}`}
      >
        <span
          className={`relative flex items-center gap-3 z-10 
          ${collapsed ? "justify-center w-full" : ""}`}
        >
          <span className={`min-w-[18px] ${isLoading ? 'animate-pulse' : ''}`}>
            {isLoading ? (
               // Contoh spinner sederhana
               <Database size={18} className="animate-spin" /> 
            ) : (
              icon
            )}
          </span>
          {!collapsed && (
            <span className="whitespace-nowrap">
              {isLoading ? 'Processing...' : label}
            </span>
          )}
        </span>

        {collapsed && (
          <span className="absolute left-full ml-4 whitespace-nowrap px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl">
            {isLoading ? 'Processing...' : label}
          </span>
        )}
      </button>
    );
  }

  // Logika untuk Navigasi (NavLink)
  return (
    <NavLink
      to={`${basePath}${to}`}
      className={baseClasses}
      onClick={onClick}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className={`absolute inset-0 ${theme.activeBg} rounded-xl`}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}

          {isActive && (
            <div className={`absolute left-0 top-1 bottom-1 w-1 ${theme.accentBg} rounded-r-lg`} />
          )}

          <span
            className={`relative flex items-center gap-3 z-10 
              ${isActive ? `${theme.activeText} font-bold` : `text-gray-600 ${theme.hoverText}`}
              ${collapsed ? "justify-center w-full" : ""}`}
          >
            <span
              className={`min-w-[18px] ${isActive ? theme.accentText : `text-gray-500 ${theme.hoverText}`}`}
            >
              {icon}
            </span>
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </span>

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
  
  // Semua state dan handler backup/restore dihilangkan (sesuai permintaan)
  
  const user = JSON.parse(localStorage.getItem("user"));
  const cabang = JSON.parse(localStorage.getItem("cabang"));

  const getThemeColors = (role) => {
    if (role === 'super admin') {
      return {
        activeBg: "bg-orange-100",
        accentBg: "bg-orange-600",
        accentText: "text-orange-600",
        activeText: "text-orange-800",
        hoverText: "group-hover:text-orange-600",
        headerGradient: "from-orange-600 to-orange-700",
        buttonBg: "bg-orange-700",
        buttonHoverBg: "hover:bg-orange-800",
        mobileButtonBg: "bg-orange-600",
        dropdownHoverBg: "hover:bg-orange-50",
      };
    }
    return {
      activeBg: "bg-red-100",
      accentBg: "bg-red-600",
      accentText: "text-red-600",
      activeText: "text-red-800",
      hoverText: "group-hover:text-red-600",
      headerGradient: "from-red-700 to-red-800",
      buttonBg: "bg-red-700",
      buttonHoverBg: "hover:bg-red-800",
      mobileButtonBg: "bg-red-600",
      dropdownHoverBg: "hover:bg-red-50",
    };
  };

  const theme = getThemeColors(user?.role);

  let basePath = "/super-admin/dashboard";
  if (user?.role === "admin cabang" && cabang?.id_cabang) {
    basePath = `/admin-cabang/${cabang.id_cabang}/dashboard`;
  }

  const menuItems = [
    { to: "/general", label: "General", icon: <Home size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/reports", label: "Reports", icon: <BarChart2 size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/daily", label: "Daily Report", icon: <BarChart2 size={18} />, roles: ["super admin"] },
    { to: "/kelola-cabang", label: "Kelola Cabang", icon: <Building2 size={18} />, roles: ["super admin"] },
    { to: "/produk", label: "Produk", icon: <Layers size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/karyawan", label: "Karyawan", icon: <Users size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/branch", label: "Admin Cabang", icon: <UserCog size={18} />, roles: ["super admin"] },
    { to: "/pengeluaran", label: "Pengeluaran", icon: <Wallet size={18} />, roles: ["super admin", "admin cabang"] },
    { to: "/jenis-pengeluaran", label: "Jenis Pengeluaran", icon: <WalletCards size={18} />, roles: ["super admin"] },
    { to: "/transaksi", label: "Transaksi", icon: <Receipt size={18} />, roles: ["super admin"] },
    { to: "/transaksi", label: "Transaksi", icon: <Receipt size={18} />, roles: ["admin cabang"] },
    { to: "/bahan", label: "Bahan", icon: <Package size={18} />, roles: ["super admin"] },
    { to: "/bahan-baku-pakai", label: "Bahan Baku Pakai", icon: <Package size={18} />, roles: ["super admin"] },
    { to: "/pemesanan", label: "Pemesanan", icon: <Package size={18} />, roles: ["admin cabang"] },
  ];

  const handleLinkClick = () => {
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className={`lg:hidden fixed top-4 left-4 z-40 ${theme.mobileButtonBg} text-white p-2 rounded-lg shadow-md`}
        >
          <Menu size={20} />
        </button>
      )}

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Input file hidden dan BackupPopup dihilangkan */}

      <motion.div
        animate={{ width: collapsed ? 90 : 300 }} 
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed lg:static top-0 left-0 h-screen z-40 bg-white border-r border-gray-200 flex flex-col shadow-xl overflow-x-hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
          transition-transform duration-300`}
      >
        {/* Header */}
        <div className={`relative p-6 border-b border-gray-200 bg-gradient-to-r ${theme.headerGradient} text-white`}>
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
            /* Versi collapsed */
            <h1 className="text-center text-xl font-extrabold">GC</h1>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 ${theme.buttonBg} ${theme.buttonHoverBg} text-white p-2 rounded-full shadow-xl transition border-4 border-white`}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft size={16} />
            </motion.div>
          </button>

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
        <div className="flex-grow px-4 py-5 space-y-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <div
            onClick={() => setOpenDropdown(!openDropdown)}
            className={`px-5 py-3 rounded-xl border-2 border-gray-200 flex justify-between items-center cursor-pointer 
              ${collapsed ? "justify-center" : ""} 
              bg-gray-50 ${theme.dropdownHoverBg} transition-all shadow-sm`}
          >
            <div className="flex items-center gap-2">
              <Building2 size={18} className={theme.accentText} />
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
                      theme={theme}
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
          {user?.role === 'super admin' && (
            <SidebarLink
              to="/backup-restore"
              label="Backup & Restore"
              icon={<Database size={20} />}
              basePath="/super-admin/dashboard" // Gunakan base path yang benar untuk Super Admin
              collapsed={collapsed}
              onClick={handleLinkClick}
              theme={theme}
            />
          )}

          <SidebarLink
            to="/help"
            label="Help Center"
            icon={<HelpCircle size={20} />}
            basePath={basePath}
            collapsed={collapsed}
            onClick={handleLinkClick}
            theme={theme}
          />
        </div>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
};

export default Sidebar;