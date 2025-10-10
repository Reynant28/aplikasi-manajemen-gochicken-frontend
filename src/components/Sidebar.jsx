import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home, BarChart2, Users, Layers, Settings,
  HelpCircle, Building2, UserCog, Wallet, ChevronDown,
  Receipt, Package, Boxes
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(true);

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
    { to: "/bahan-baku-pakai", label: "Bahan Baku Pakai", icon: <Boxes size={18} />, roles: ["super admin"] },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col h-screen shadow-lg relative">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide drop-shadow-sm">GoChicken</h1>
          <span className="px-2 py-1 text-xs font-semibold bg-white/25 text-white rounded-md backdrop-blur-sm">
            {user?.role || "Guest"}
          </span>
        </div>
        <p className="text-xs mt-1 text-white/80">{cabang?.nama_cabang || "Pusat"}</p>
      </div>

      {/* Menu Utama */}
      <div className="flex-grow px-4 py-5 space-y-3 overflow-y-auto scrollbar-hide">
        <div
          onClick={() => setOpenDropdown(!openDropdown)}
          className="px-3 py-2 rounded-xl border border-gray-200 flex justify-between items-center cursor-pointer bg-white hover:bg-green-50 transition-all"
        >
          <span className="font-semibold text-gray-800">All Sites</span>
          <ChevronDown
            size={18}
            className={`text-gray-500 transition-transform duration-300 ${openDropdown ? "rotate-180" : ""}`}
          />
        </div>

        <AnimatePresence>
          {openDropdown && (
            <motion.div
              className="ml-2 mt-3 space-y-2"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.35 }}
            >
              {menuItems
                .filter(item => item.roles.includes(user?.role))
                .map((item, idx) => (
                  <NavLink
                    key={idx}
                    to={`${basePath}${item.to}`}
                    className="relative flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-300"
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute inset-0 bg-green-100 rounded-lg"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}

                        <span
                          className={`relative flex items-center gap-3 ${
                            isActive
                              ? "text-green-700 font-semibold"
                              : "text-gray-600 hover:text-green-600"
                          }`}
                        >
                          <span className="text-green-600">{item.icon}</span>
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-green-50 to-white">
        <NavLink
          to={`${basePath}/help`}
          className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition-all"
        >
          <HelpCircle size={20} /> Help Center
        </NavLink>
        <NavLink
          to={`${basePath}/settings`}
          className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition-all"
        >
          <Settings size={20} /> Settings
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;