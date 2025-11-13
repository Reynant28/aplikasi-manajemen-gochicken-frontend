import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Home, BarChart2, Users, Layers, ChartColumn,
  HelpCircle, Building2, UserCog, Wallet, ChevronDown,
  Receipt, Package, Boxes, WalletCards, FileChartColumnIncreasing, PackagePlus,
  DatabaseBackup,
  X // ✅ Added close icon for mobile
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const token = localStorage.getItem("token");

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const cabang = JSON.parse(localStorage.getItem("cabang"));
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleBackup = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/backup/export", {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = "database_backup.sql";
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Backup failed:", error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          alert("Unauthorized: Please login again.");
        } else if (status === 403) {
          alert("Access denied: Only Super Admin can backup database.");
        } else if (status === 500) {
          alert("Server error: " + (data.message || "Failed to create backup."));
        } else {
          alert(data.message || "Failed to create backup.");
        }
      } else if (error.request) {
        alert("Network error: Cannot connect to server.");
      } else {
        alert("Error: " + error.message);
      }
    }
  };

  let basePath = "/super-admin/dashboard";
  if (user?.role === "admin cabang" && cabang?.id_cabang) {
    basePath = `/admin-cabang/${cabang.id_cabang}/dashboard`;
  }

  const groupedMenus = [
    {
      label: "Dashboard",
      key: "general",
      dropdown: false,
      icon: <Home size={18} />,
      items: [
        { to: "/general", label: "General", icon: <Home size={18} />, roles: ["super admin", "admin cabang"] },
      ],
    },
    {
      label: "Laporan",
      key: "reports",
      dropdown: true,
      icon: <BarChart2 size={18} className="text-gray-200" />,
      items: [
        { to: "/reports", label: "Laporan Master", icon: <ChartColumn size={18} />, roles: ["super admin", "admin cabang"] },
        { to: "/daily-reports", label: "Laporan Harian", icon: <FileChartColumnIncreasing size={18} />, roles: ["super admin", "admin cabang"] },
        { to: "/audit-log", label: "Audit Log", icon: <Receipt size={18} />, roles: ["super admin"] },
      ],
    },
    {
      label: "Manajemen",
      key: "management",
      dropdown: true,
      icon: <Users size={18} className="text-gray-200" />,
      items: [
        { to: "/produk", label: "Produk", icon: <Layers size={18} />, roles: ["super admin", "admin cabang"] },
        { to: "/karyawan", label: "Karyawan", icon: <Users size={18} />, roles: ["super admin", "admin cabang"] },
        { to: "/branch", label: "Admin Cabang", icon: <UserCog size={18} />, roles: ["super admin"] },
        { to: "/kelola-cabang", label: "Kelola Cabang", icon: <Building2 size={18} />, roles: ["super admin"] },
      ],
    },
    {
      label: "Keuangan",
      key: "finance",
      dropdown: true,
      icon: <Wallet size={18} className="text-gray-200" />,
      items: [
        { to: "/pemesanan", label: "Pemesanan", icon: <PackagePlus size={18} />, roles: ["super admin", "admin cabang"] },
        { to: "/pengeluaran", label: "Pengeluaran", icon: <Wallet size={18} />, roles: ["super admin", "admin cabang"] },
        { to: "/jenis-pengeluaran", label: "Jenis Pengeluaran", icon: <WalletCards size={18} />, roles: ["super admin"] },
        { to: "/transaksi", label: "Transaksi", icon: <Receipt size={18} />, roles: ["super admin", "admin cabang"] },
        { to: "/bahan", label: "Bahan", icon: <Package size={18} />, roles: ["super admin"] },
        { to: "/bahan-baku-pakai", label: "Bahan Baku Pakai", icon: <Boxes size={18} />, roles: ["super admin"] },
      ],
    },
  ];

  const [openDropdown, setOpenDropdown] = useState(() =>
    Object.fromEntries(groupedMenus.filter((m) => m.dropdown).map((m) => [m.key, true]))
  );

  const superAdminMenus = groupedMenus;
  const adminCabangMenus = groupedMenus.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes("admin cabang")),
  })).filter((group) => group.items.length > 0);

  const visibleMenus = user?.role === "super admin" ? superAdminMenus : adminCabangMenus;

  // ✅ Close sidebar when clicking on a link in mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Background overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          x: isSidebarOpen || !isMobile ? 0 : -300,
          opacity: isSidebarOpen || !isMobile ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed md:relative inset-y-0 left-0 z-40 w-64 bg-white 
                   border-r border-gray-200 flex flex-col h-screen 
                   shadow-lg transform md:translate-x-0 md:flex transition-all duration-300
                   ${isMobile ? 'fixed' : 'static'}`}
      >
        {/* Header */}
        <div className="relative flex flex-col items-center md:items-start gap-2 p-5 pl-0 sm:p-5 bg-gradient-to-r from-gray-700 to-gray-900 shadow-md">
          {/* ✅ Mobile Close Button */}
          {isMobile && (
            <button
              className="absolute top-4 right-4 z-50 p-1 bg-white/20 hover:bg-white/30 text-white rounded-md md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          )}

          {/* Logo */}
          <div className="flex items-center gap-3 mt-2 md:mt-0">
            <img src="/images/LogoGoChickenReal.png" alt="GoChicken Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-lg font-bold leading-tight text-white">GoChicken</h1>
              <p className="text-xs text-gray-300">{cabang?.nama_cabang || "Pusat"}</p>
            </div>
          </div>

          {/* Role Badge */}
          <span className="px-2 py-1 mt-2 text-xs font-semibold bg-white/25 text-white rounded-md backdrop-blur-sm">
            {user?.role || "Guest"}
          </span>
        </div>

        {/* Menu */}
        <div className="flex-grow px-4 py-5 space-y-3 overflow-y-auto scrollbar-hide">
          {visibleMenus
            .map((group) => ({
              ...group,
              items: group.items.filter((item) => !item.roles || item.roles.includes(user?.role)),
            }))
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <div key={group.key}>
                {group.dropdown ? (
                  <>
                    <div
                      onClick={() =>
                        setOpenDropdown((prev) => ({ ...prev, [group.key]: !prev[group.key] }))
                      }
                      className="px-3 py-2 rounded-xl flex justify-between items-center cursor-pointer bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-all"
                    >
                      <div className="flex items-center gap-3 text-gray-100 font-semibold">
                        {group.icon}
                        {group.label}
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-100 transition-transform duration-300 ${
                          openDropdown[group.key] ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    <AnimatePresence>
                      {openDropdown[group.key] && (
                        <motion.div
                          className="ml-2 mt-2 space-y-1"
                          initial={{ opacity: 0, y: -10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -10, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {group.items.map((item, idx) => (
                            <NavLink
                              key={idx}
                              to={`${basePath}${item.to}`}
                              className={({ isActive }) =>
                                `relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                                 ${isActive
                                   ? "bg-gray-700 text-gray-100 font-semibold"
                                   : "text-gray-500 hover:bg-gray-700 hover:text-white"}`
                              }
                              onClick={handleLinkClick}
                            >
                              {item.icon}
                              {item.label}
                            </NavLink>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  group.items.map((item, idx) => (
                    <NavLink
                      key={idx}
                      to={`${basePath}${item.to}`}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium border transition-all
                         ${isActive
                           ? "bg-gray-700 border-gray-600 text-white"
                           : "border-gray-700 text-gray-500 hover:bg-gray-700 hover:text-white"}`
                      }
                      onClick={handleLinkClick}
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  ))
                )}
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <NavLink
            to={`${basePath}/help`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-700 hover:text-white transition-all"
            onClick={handleLinkClick}
          >
            <HelpCircle size={18} /> Help Center
          </NavLink>
          <button
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-700 hover:text-white transition-all text-left"
            onClick={() => {
              handleLinkClick();
              handleBackup();
            }}
          >
            <DatabaseBackup size={18} /> Backup Database
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;