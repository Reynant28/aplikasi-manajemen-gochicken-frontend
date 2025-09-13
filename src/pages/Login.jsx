import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Custom icon components
const Eye = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 
         9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 
         0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOff = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 
         19c-4.478 0-8.268-2.943-9.543-7a9.97 
         9.97 0 011.563-3.029m5.858.908a3 
         3 0 114.243 4.243M9.878 9.878l4.242 
         4.242M9.878 9.878L3 3m6.878 
         6.878L21 21"
    />
  </svg>
);

const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const User = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Shield = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 
         11.955 0 0112 2.944a11.955 11.955 
         0 01-8.618 3.04A12.02 12.02 0 
         003 9c0 5.591 3.824 10.29 9 
         11.622 5.176-1.332 9-6.03 
         9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const Login = () => {
  const [activePanel, setActivePanel] = useState("cabang"); // 'cabang' or 'super'
  const [prevPanel, setPrevPanel] = useState("cabang"); // track previous
  const [showPassword, setShowPassword] = useState(false);
  const [showPersonalPassword, setShowPersonalPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [formData, setCabangData] = useState({
    cabang: "",
    passwordCabang: "",
    personalPassword: "",
  });

  const [superAdminData, setSuperAdminData] = useState({
    username: "",
    password: "",
  });

  const cabangOptions = [
    "Jakarta Pusat",
    "Jakarta Selatan",
    "Jakarta Utara",
    "Bandung",
    "Surabaya",
    "Medan",
  ];

  const handleCabangChange = (field, value) => {
    setCabangData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSuperAdminChange = (field, value) => {
    setSuperAdminData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (activePanel === "cabang") {
      console.log("Admin Cabang Login:", formData);
    } else {
      console.log("Super Admin Login:", superAdminData);
    }
  };

  // compute direction: 1 = cabang -> super, -1 = super -> cabang
  const dir =
    prevPanel === "cabang" && activePanel === "super"
      ? 1
      : prevPanel === "super" && activePanel === "cabang"
      ? -1
      : 0;

  const getVariants = (d) => ({
    initial: { opacity: 0, x: d === 1 ? 100 : d === -1 ? -100 : 0, scale: 0.995 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: d === 1 ? -100 : d === -1 ? 100 : 0, scale: 0.995 },
    transition: { duration: 0.45, ease: "easeInOut" },
  });

  const handleSwitchPanel = (panel) => {
    if (panel === activePanel) return;
    setPrevPanel(activePanel);
    setActivePanel(panel);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Content */}
          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                GoChicken <span className="text-gray-800">: Admin</span>
              </h1>
              <p className="text-sm text-gray-600">Masuk ke sistem administrasi</p>
            </div>

            {/* Panel Switcher */}
            <div className="bg-white rounded-lg p-1 mb-5 shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 gap-1">
                <motion.button
                  onClick={() => handleSwitchPanel("cabang")}
                  animate={{
                    backgroundColor: activePanel === "cabang" ? "#ef4444" : "#ffffff",
                    color: activePanel === "cabang" ? "#ffffff" : "#374151",
                  }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium shadow-sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  Admin Cabang
                </motion.button>
                <motion.button
                  onClick={() => handleSwitchPanel("super")}
                  animate={{
                    backgroundColor: activePanel === "super" ? "#f97316" : "#ffffff",
                    color: activePanel === "super" ? "#ffffff" : "#374151",
                  }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium shadow-sm"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Super Admin
                </motion.button>
              </div>
            </div>

            {/* Forms */}
            <div className="relative min-h-[340px]">
              <AnimatePresence mode="wait" initial={false}>
                {activePanel === "cabang" && (
                  <motion.div
                    key="cabang"
                    variants={getVariants(dir)}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute inset-0"
                  >
                    <div className="p-6">
                      <div className="space-y-4">
                        {/* Dropdown Cabang */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pilih Cabang
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-left flex items-center justify-between hover:border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                            >
                              <span className={formData.cabang ? "text-gray-800" : "text-gray-500"}>
                                {formData.cabang || "Pilih cabang..."}
                              </span>
                              <ChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                              />
                            </button>
                            {isDropdownOpen && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                                {cabangOptions.map((cabang, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                      handleCabangChange("cabang", cabang);
                                      setIsDropdownOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-gray-800 hover:bg-red-50 hover:text-red-700 transition-colors"
                                  >
                                    {cabang}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Password Cabang */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password Cabang
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={formData.passwordCabang}
                              onChange={(e) => handleCabangChange("passwordCabang", e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors pr-12 text-gray-800"
                              placeholder="Masukkan password cabang"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        {/* Personal Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password Personal
                          </label>
                          <div className="relative">
                            <input
                              type={showPersonalPassword ? "text" : "password"}
                              value={formData.personalPassword}
                              onChange={(e) => handleCabangChange("personalPassword", e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors pr-12 text-gray-800"
                              placeholder="Masukkan password personal"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPersonalPassword(!showPersonalPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPersonalPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activePanel === "super" && (
                  <motion.div
                    key="super"
                    variants={getVariants(dir)}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute inset-0"
                  >
                    <div className="p-6">
                      <div className="space-y-4">
                        {/* Username */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                          <input
                            type="text"
                            value={superAdminData.username}
                            onChange={(e) => handleSuperAdminChange("username", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors text-gray-800"
                            placeholder="Masukkan username"
                          />
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={superAdminData.password}
                              onChange={(e) => handleSuperAdminChange("password", e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors pr-12 text-gray-800"
                              placeholder="Masukkan password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <div className="px-2 mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-300 transform hover:scale-[1.02] ${
                  activePanel === "cabang"
                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl"
                    : "bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-lg hover:shadow-xl"
                }`}
              >
                Masuk sebagai {activePanel === "cabang" ? "Admin Cabang" : "Super Admin"}
              </button>
            </div>

            {/* Footer */}
            <div className="text-center mt-5">
              <p className="text-gray-800 text-sm">© 2024 GoChicken : Admin. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
