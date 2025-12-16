import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Custom icon components (tetap sama)
const Eye = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
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
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
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

const CheckCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const XCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ExclamationCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// --- AlertPopup Component ---
const AlertPopup = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type,
  confirmText,
  cancelText,
  showCancel = true,
}) => {
  const getColors = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-emerald-500",
          confirmClass: "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-200",
        };
      case "error":
        return {
          icon: XCircle,
          iconColor: "text-red-500",
          confirmClass: "bg-red-500 hover:bg-red-600 focus:ring-red-200",
        };
      case "warning":
      case "confirmation": 
      default:
        return {
          icon: ExclamationCircle,
          iconColor: "text-amber-500",
          confirmClass: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-200",
        };
    }
  };

  const { icon: Icon, iconColor, confirmClass } = getColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={showCancel ? onClose : undefined} 
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm mx-auto border border-gray-100"
            initial={{ y: -50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Header / Icon */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className={`p-3 rounded-full ${iconColor.replace('text', 'bg')}/10`}>
                <Icon className={`w-8 h-8 ${iconColor} stroke-2`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center">{title}</h3>
            </div>

            {/* Message */}
            <div className="mt-4 mb-6">
              <p className="text-sm text-gray-600 text-center leading-relaxed">{message}</p>
            </div>

            {/* Buttons */}
            <div className={`flex ${showCancel ? "justify-between space-x-3" : "justify-center"}`}>
              {showCancel && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-gray-100 transition-all duration-200"
                >
                  {cancelText || "Batal"}
                </button>
              )}
              <button
                type="button"
                onClick={onConfirm}
                className={`w-full py-3 px-4 text-sm font-semibold rounded-xl text-white focus:ring-2 transition-all duration-200 ${confirmClass}`}
              >
                {confirmText || (type === "confirmation" ? "Hapus" : "OK")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Login Component ---
const Login = () => {
  const [activePanel, setActivePanel] = useState("cabang");
  const [isLoading, setIsLoading] = useState(false);
  const [prevPanel, setPrevPanel] = useState("cabang");
  const [showPassword, setShowPassword] = useState(false);
  const [showPersonalPassword, setShowPersonalPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cabangOptions, setCabangOptions] = useState([]);
  const [cabangMap, setCabangMap] = useState({});

  // State for the custom popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupData, setPopupData] = useState({
    title: "",
    message: "",
    type: "warning",
    confirmText: "OK",
    showCancel: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch cabang from backend
    axios
      .get("http://localhost:8000/api/cabang")
      .then((res) => {
        if (res.data.status === "success") {
          setCabangOptions(res.data.data.map((c) => c.nama_cabang));
          // Map nama_cabang to id_cabang
          const map = {};
          res.data.data.forEach((c) => {
            map[c.nama_cabang] = c.id_cabang;
          });
          setCabangMap(map);
        }
      })
      .catch(() => {
        setCabangOptions([]);
      });
  }, []);

  // Function to show the custom popup
  const showPopup = useCallback((title, message, type = "warning", confirmText = "OK") => {
    setPopupData({
      title,
      message,
      type,
      confirmText,
      showCancel: false,
    });
    setIsPopupOpen(true);
  }, []);

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
  }, []);

  const handleCabangLogin = async () => {
    const { cabang, passwordCabang, personalPassword } = formData;
    try {
      setIsLoading(true);

      const id_cabang = cabangMap[cabang];

      if (!id_cabang) {
        showPopup("Gagal Login", "Mohon pilih cabang terlebih dahulu.", "error");
        return;
      }

      const res = await axios.post("http://localhost:8000/api/admin-cabang/login", {
        id_cabang,
        password_cabang: passwordCabang,
        password_pribadi: personalPassword,
      });

      if (res.data.status === "success") {
        showPopup(
          "Login Berhasil! 🎉",
          "Selamat datang, Anda akan diarahkan ke dashboard.",
          "success",
          "Lanjut"
        );

        setTimeout(() => {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          if (res.data.cabang) {
            localStorage.setItem("cabang", JSON.stringify(res.data.cabang));
          }
          localStorage.setItem("token", res.data.token);
          navigate(`/admin-cabang/${id_cabang}/dashboard`);
        }, 1500);
      } else {
        showPopup("Gagal Login", res.data.message || "Login Admin Cabang gagal. Cek kembali kredensial Anda.", "error");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        let message = "Terjadi kesalahan saat mencoba login.";
        if (err.response.data.errors) {
          message = Object.values(err.response.data.errors).join("\n");
        } else if (err.response.data.message) {
          message = err.response.data.message;
        }
        showPopup("Gagal Login 🚨", message, "error");
      } else {
        showPopup("Error Koneksi 😟", "Terjadi error koneksi ke server. Mohon coba lagi.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuperAdminLogin = async () => {
    const { username, password } = superAdminData;
    try {
      setIsLoading(true);
      const res = await axios.post("http://localhost:8000/api/super-admin/login", {
        email: username,
        password: password,
      });

      if (res.data.status === "success") {
        showPopup(
          "Login Berhasil! 👑",
          "Selamat datang, Anda akan diarahkan ke dashboard Super Admin.",
          "success",
          "Lanjut"
        );

        setTimeout(() => {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          navigate("/super-admin/dashboard");
        }, 1500);
      } else {
        showPopup("Gagal Login", res.data.message || "Login Super Admin gagal. Cek email dan password Anda.", "error");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        let message = "Terjadi kesalahan saat mencoba login.";
        if (err.response.data.errors) {
          message = Object.values(err.response.data.errors).join("\n");
        } else if (err.response.data.message) {
          message = err.response.data.message;
        }
        showPopup("Gagal Login 🚨", message, "error");
      } else {
        showPopup("Error Koneksi 😟", "Terjadi error koneksi ke server. Mohon coba lagi.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setCabangData] = useState({
    cabang: "",
    passwordCabang: "",
    personalPassword: "",
  });

  const [superAdminData, setSuperAdminData] = useState({
    username: "",
    password: "",
  });

  const handleCabangChange = (field, value) => {
    setCabangData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSuperAdminChange = (field, value) => {
    setSuperAdminData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSwitchPanel = (panel) => {
    if (panel === activePanel) return;
    setPrevPanel(activePanel);
    setActivePanel(panel);
    if (panel === "cabang") {
      setCabangData({
        cabang: "",
        passwordCabang: "",
        personalPassword: "",
      });
      setShowPassword(false);
      setShowPersonalPassword(false);
    } else {
      setSuperAdminData({
        username: "",
        password: "",
      });
      setShowPassword(false);
    }
  };

  return (
    <>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

        :root {
          --themered: #ef4444;
          --themeorange: #f97316;
          --light-text-muted: #6b7280;
        }

        body {
          background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%);
          font-family: 'Inter', sans-serif;
          /* Baris overflow: hidden; sudah dihapus */
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        body::-webkit-scrollbar {
          display: none;
        }

        /* Custom scrollbar for dropdown */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        `}
      </style>

      <AlertPopup
        isOpen={isPopupOpen}
        onClose={closePopup}
        onConfirm={closePopup}
        title={popupData.title}
        message={popupData.message}
        type={popupData.type}
        confirmText={popupData.confirmText}
        showCancel={popupData.showCancel}
      />

      <div className="min-h-screen w-full flex items-start md:items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
        {/* Background decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20"
        >
          {/* Left Panel: Enhanced with better styling */}
          <div className="hidden md:flex md:w-1/2 items-center justify-center p-12 bg-gradient-to-br from-red-500 to-orange-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-6 left-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                <div className="w-3 h-3 bg-amber-300 rounded-full"></div>
                <div className="w-3 h-3 bg-emerald-300 rounded-full"></div>
              </div>
            </div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative z-10 text-center"
            >
              <img
                src="/images/LogoGoChickenReal.png"
                alt="GoChicken Logo"
                className="w-full max-w-xs mx-auto drop-shadow-2xl"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-8 text-white"
              >
                <h2 className="text-2xl font-bold font-['Fredoka'] mb-2">GoChicken Admin</h2>
                <p className="text-red-100 font-medium">Sistem Manajemen Cabang Terintegrasi</p>
              </motion.div>
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/10 to-transparent"></div>
          </div>

          {/* Right Panel */}
          <div className="w-full md:w-1/2 flex items-center justify-center py-2 px-6 sm:px-12">
            <div className="w-full max-w-md">
              {/* Enhanced Header */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-lg mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-['Fredoka']">
                  GoChicken <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Admin</span>
                </h1>
                <p className="text-gray-600 font-medium">Website Administrasi Cabang GoChicken</p>
              </motion.div>

              {/* Enhanced Panel Switcher */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative bg-gray-100 rounded-2xl p-1.5 mb-8 shadow-inner"
              >
                <motion.div
                  className="absolute top-1.5 bottom-1.5 w-1/2 rounded-xl shadow-lg"
                  animate={{
                    x: activePanel === "cabang" ? "0%" : "100%",
                    backgroundColor: activePanel === "cabang" ? "#ef4444" : "#f97316",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <div className="relative grid grid-cols-2 gap-1.5 text-sm font-semibold">
                  <button
                    onClick={() => handleSwitchPanel("cabang")}
                    className={`flex items-center justify-center py-3.5 px-4 rounded-xl z-10 transition-all duration-300 ${
                      activePanel === "cabang" 
                        ? "text-white shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <User className="w-5 h-5 mr-2.5" />
                    Admin Cabang
                  </button>
                  <button
                    onClick={() => handleSwitchPanel("super")}
                    className={`flex items-center justify-center py-3.5 px-4 rounded-xl z-10 transition-all duration-300 ${
                      activePanel === "super" 
                        ? "text-white shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Shield className="w-5 h-5 mr-2.5" />
                    Super Admin
                  </button>
                </div>
              </motion.div>

              {/* Forms Container */}
              <div className="relative min-h-[320px] overflow-hidden">
                <AnimatePresence initial={false} mode="wait">
                  {/* Admin Cabang Form */}
                  {activePanel === "cabang" && (
                    <motion.div
                      key="cabang"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 50, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <div className="space-y-6">
                        {/* Dropdown */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Pilih Cabang
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-left flex items-center justify-between hover:border-red-400 focus:border-red-500 focus:ring-3 focus:ring-red-100 transition-all duration-200 shadow-sm"
                            >
                              <span className={formData.cabang ? "text-gray-900 font-medium" : "text-gray-500"}>
                                {formData.cabang || "Pilih cabang..."}
                              </span>
                              <ChevronDown
                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                  isDropdownOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            <AnimatePresence>
                              {isDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto custom-scrollbar"
                                >
                                  {cabangOptions.map((cabang, index) => (
                                    <button
                                      key={index}
                                      type="button"
                                      onClick={() => {
                                        handleCabangChange("cabang", cabang);
                                        setIsDropdownOpen(false);
                                      }}
                                      className="w-full px-4 py-3.5 text-left text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                                    >
                                      {cabang}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Password Cabang */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Password Cabang
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={formData.passwordCabang}
                              onChange={(e) => handleCabangChange("passwordCabang", e.target.value)}
                              // 👇 Pastikan ada 'pr-12' di sini
                              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:border-red-500 focus:ring-3 focus:ring-red-100 transition-all duration-200 pr-12 text-gray-900 placeholder-gray-500 shadow-sm"
                              placeholder="Masukkan password cabang"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Personal Password */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Password Personal
                          </label>
                          <div className="relative">
                            <input
                              type={showPersonalPassword ? "text" : "password"}
                              value={formData.personalPassword}
                              onChange={(e) => handleCabangChange("personalPassword", e.target.value)}
                              // 👇 Pastikan ada 'pr-12' di sini
                              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:border-red-500 focus:ring-3 focus:ring-red-100 transition-all duration-200 pr-12 text-gray-900 placeholder-gray-500 shadow-sm"
                              placeholder="Masukkan password personal"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPersonalPassword(!showPersonalPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                            >
                              {showPersonalPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Super Admin Form */}
                  {activePanel === "super" && (
                    <motion.div
                      key="super"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -50, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <div className="space-y-6">
                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Email
                          </label>
                          <input
                            type="text"
                            value={superAdminData.username}
                            onChange={(e) => handleSuperAdminChange("username", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-3 focus:ring-orange-100 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm text-base"
                            placeholder="Masukkan email"
                          />
                        </div>
                        {/* Password */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={superAdminData.password}
                              onChange={(e) => handleSuperAdminChange("password", e.target.value)}
                              // 👇 Pastikan ada 'pr-12' di sini
                              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-3 focus:ring-orange-100 transition-all duration-200 pr-12 text-gray-900 placeholder-gray-500 shadow-sm"
                              placeholder="Masukkan password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Enhanced Submit Button */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8"
              >
                <div className="relative w-full overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <motion.div
                    animate={{ x: activePanel === "cabang" ? "0%" : "-50%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex w-[200%]"
                  >
                    {/* Admin Cabang Button */}
                    <div className="w-1/2">
                      <button
                        type="button"
                        onClick={handleCabangLogin}
                        disabled={isLoading}
                        className="w-full py-4 px-6 flex items-center justify-center font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-300 disabled:to-red-400 rounded-2xl rounded-r-none transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            <span>Memproses...</span>
                          </div>
                        ) : (
                          "Masuk sebagai Admin Cabang"
                        )}
                      </button>
                    </div>

                    {/* Super Admin Button */}
                    <div className="w-1/2">
                      <button
                        type="button"
                        onClick={handleSuperAdminLogin}
                        disabled={isLoading}
                        className="w-full py-4 px-6 flex items-center justify-center font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-300 disabled:to-orange-400 rounded-2xl rounded-l-none transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            <span>Memproses...</span>
                          </div>
                        ) : (
                          "Masuk sebagai Super Admin"
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Footer */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-center"
              >
                <p className="text-xs text-gray-500">
                  © 2025 GoChicken Admin System. All rights reserved.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;