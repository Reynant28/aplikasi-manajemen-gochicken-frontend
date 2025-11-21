import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  BarChart2,
  Users,
  Layers,
  Settings,
  HelpCircle,
  Building2,
  UserCog,
  Wallet,
  Receipt,
  Package,
  Boxes,
  X,
  Feather,
  WalletCards,
  DatabaseBackup,
  ClipboardClock,
  HandCoins,
  ChevronDown,
} from "lucide-react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

// --- KONFIGURASI MENU BARU ---
const menuConfig = [
  // 1. General (Tetap sebagai link tunggal)
  {
    type: "link",
    to: "/general",
    label: "General",
    icon: <Home size={18} />,
    roles: ["super admin", "admin cabang"],
  },

  // 2. Grup Laporan
  {
    type: "group",
    label: "Laporan",
    icon: <BarChart2 size={18} />,
    children: [
      {
        to: "/reports",
        label: "Reports",
        roles: ["super admin", "admin cabang"],
      },
      { to: "/reports-daily", label: "Daily Report", roles: ["super admin"] },
    ],
  },

  // 3. Grup Pengelolaan
  {
    type: "group",
    label: "Pengelolaan",
    icon: <Building2 size={18} />,
    children: [
      { to: "/kelola-cabang", label: "Kelola Cabang", roles: ["super admin"] },
      {
        to: "/produk",
        label: "Produk",
        roles: ["super admin", "admin cabang"],
      },
      {
        to: "/karyawan",
        label: "Karyawan",
        roles: ["super admin", "admin cabang"],
      },
      { to: "/kasir", label: "Kasir", roles: ["admin cabang"] },
      { to: "/branch", label: "Admin Cabang", roles: ["super admin"] },
    ],
  },

  // 4. Grup Finansial
  {
    type: "group",
    label: "Finansial",
    icon: <Wallet size={18} />,
    children: [
      {
        to: "/pengeluaran",
        label: "Pengeluaran",
        roles: ["super admin", "admin cabang"],
      },
      {
        to: "/jenis-pengeluaran",
        label: "Jenis Pengeluaran",
        roles: ["super admin"],
      },
      { to: "/transaksi", label: "Transaksi", roles: ["super admin"] },
      { to: "/pemesanan", label: "Pemesanan", roles: ["admin cabang"] },
    ],
  },

  // 5. Grup Bahan
  {
    type: "group",
    label: "Bahan",
    icon: <Package size={18} />,
    children: [
      { to: "/bahan", label: "Bahan", roles: ["super admin"] },
      {
        to: "/bahan-baku-pakai",
        label: "Bahan Baku Pakai",
        roles: ["super admin"],
      },
    ],
  },
];

// --- Komponen Sidebar Utama ---

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  // FIX: Use "cabang" instead of "cabANG"
  const cabang = JSON.parse(localStorage.getItem("cabang"));
  const location = useLocation();

  // Determine base path based on role - FIXED with proper fallback
  let basePath = "/super-admin/dashboard";
  if (user?.role === "admin cabang") {
    // Use cabang?.id_cabang with fallback to empty string if not found
    const cabangId = cabang?.id_cabang || "";
    basePath = `/admin-cabang/${cabangId}/dashboard`;
  }

  //last time benerin sidebar buat super admin & admin cabang.
  //buat admin cabang yang jenis pengeluaran masih error.
  //super admin teing luoa

  console.log("Sidebar Debug:", {
    userRole: user?.role,
    cabang,
    basePath,
    localStorageCabang: localStorage.getItem("cabang"),
  });

  // State untuk grup
  const initialOpenState = menuConfig
    .filter((item) => item.type === "group")
    .reduce((acc, item) => {
      acc[item.label] = true;
      return acc;
    }, {});

  const [openGroups, setOpenGroups] = useState(initialOpenState);

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const sidebarClasses = `
    w-64 bg-white border-r border-gray-200 flex flex-col h-screen shadow-lg 
    fixed top-0 left-0 z-30 transition-transform duration-300 ease-in-out 
    lg:relative lg:translate-x-0 lg:z-auto
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
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
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || "Guest"}
            </p>
            {user?.role === "admin cabang" && cabang?.nama_cabang && (
              <p className="text-xs text-gray-400">{cabang.nama_cabang}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden p-1 text-gray-500 hover:text-gray-800"
        >
          <X size={24} />
        </button>
      </div>

      {/* --- Main Menu Items --- */}
      <div className="flex-grow px-4 py-5 space-y-1 overflow-y-auto scrollbar-hide">
        {menuConfig.map((item) => {
          // --- 1. RENDER LINK TUNGGAL ---
          if (item.type === "link") {
            if (!item.roles.includes(user?.role)) return null;

            return (
              <NavLink
                key={item.label}
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
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span
                      className={`relative flex items-center gap-3 ${
                        isActive
                          ? "text-red-600 font-semibold"
                          : "text-gray-600 hover:text-red-600"
                      }`}
                    >
                      <span
                        className={isActive ? "text-red-600" : "text-gray-400"}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          }

          // --- 2. RENDER GRUP ---
          if (item.type === "group") {
            const visibleChildren = item.children.filter((child) =>
              child.roles.includes(user?.role)
            );

            if (visibleChildren.length === 0) return null;

            const isOpen = openGroups[item.label];
            const isGroupActive = visibleChildren.some((child) =>
              location.pathname.startsWith(`${basePath}${child.to}`)
            );

            return (
              <div key={item.label}>
                {/* Tombol Header Grup */}
                <button
                  onClick={() => toggleGroup(item.label)}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 text-gray-600 hover:text-red-600"
                >
                  <span
                    className={`relative flex items-center gap-3 font-medium text-sm ${
                      isGroupActive
                        ? "text-red-600 font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    <span
                      className={
                        isGroupActive ? "text-red-600" : "text-gray-400"
                      }
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Daftar Link Anak (Collapsible) */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      key="submenu-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                      className="pl-5 pt-1 space-y-1"
                    >
                      {visibleChildren.map((child) => (
                        <NavLink
                          key={child.label}
                          to={`${basePath}${child.to}`}
                          onClick={() => setIsSidebarOpen(false)}
                          className="relative flex items-center px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <motion.div
                                  layoutId="activeIndicator"
                                  className="absolute inset-0 bg-red-100 rounded-lg"
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                  }}
                                />
                              )}
                              <span
                                className={`relative flex items-center gap-3 ${
                                  isActive
                                    ? "text-red-600 font-semibold"
                                    : "text-gray-600 hover:text-red-600"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isActive ? "bg-red-500" : "bg-gray-400"
                                  }`}
                                ></span>
                                {child.label}
                              </span>
                            </>
                          )}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Bottom Menu Items */}
      <div className="space-y-2 p-4 border-t border-gray-200">
        <NavLink
          to={`${basePath}/backup`}
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all"
        >
          <DatabaseBackup size={18} />
          Backup Data
        </NavLink>

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
