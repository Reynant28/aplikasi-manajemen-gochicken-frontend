import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Custom icon components (using the existing ones)
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
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
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
          iconColor: "text-green-500",
          confirmClass: "bg-green-500 hover:bg-green-600",
        };
      case "error":
        return {
          icon: XCircle,
          iconColor: "text-red-500",
          confirmClass: "bg-red-500 hover:bg-red-600",
        };
      case "warning":
      case "confirmation": 
      default:
        return {
          icon: ExclamationCircle,
          iconColor: "text-yellow-500",
          confirmClass: "bg-red-500 hover:bg-red-600",
        };
    }
  };

  const { icon: Icon, iconColor, confirmClass } = getColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // DIUBAH DI SINI: bg-white bg-opacity-70 untuk putih transparan
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={showCancel ? onClose : undefined} 
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-sm mx-auto"
            initial={{ y: -50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Header / Icon */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <Icon className={`w-12 h-12 ${iconColor} stroke-2`} />
              <h3 className="text-xl font-semibold text-gray-800 text-center">{title}</h3>
            </div>

            {/* Message */}
            <div className="mt-4 mb-6">
              <p className="text-sm text-gray-600 text-center">{message}</p>
            </div>

            {/* Buttons */}
            <div className={`flex ${showCancel ? "justify-between space-x-3" : "justify-center"}`}>
              {showCancel && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  {cancelText || "Batal"}
                </button>
              )}
              <button
                type="button"
                onClick={onConfirm}
                className={`w-full py-3 px-4 text-sm font-medium rounded-lg text-white transition-colors ${confirmClass}`}
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
  // eslint-disable-next-line no-unused-vars
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
      showCancel: false, // Default is a simple alert/message
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
        // Success Popup
        showPopup(
          "Login Berhasil! 🎉",
          "Selamat datang, Anda akan diarahkan ke dashboard.",
          "success",
          "Lanjut"
        );

        // Store data and navigate after a brief delay for the user to see the popup
        setTimeout(() => {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          if (res.data.cabang) {
            localStorage.setItem("cabang", JSON.stringify(res.data.cabang));
          }
          localStorage.setItem("token", res.data.token);
          navigate(`/admin-cabang/${id_cabang}/dashboard`);
        }, 1500); // 1.5 seconds delay

      } else {
        // General Login Error
        showPopup("Gagal Login", res.data.message || "Login Admin Cabang gagal. Cek kembali kredensial Anda.", "error");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        let message = "Terjadi kesalahan saat mencoba login.";
        if (err.response.data.errors) {
          // Handle validation errors
          message = Object.values(err.response.data.errors).join("\n");
        } else if (err.response.data.message) {
          // Fallback for specific message errors (e.g., 'Password Cabang Salah')
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
      // Logika login Super Admin
      const res = await axios.post("http://localhost:8000/api/super-admin/login", {
        email: username,
        password: password,
      });

      if (res.data.status === "success") {
        // Success Popup
        showPopup(
          "Login Berhasil! 👑",
          "Selamat datang, Anda akan diarahkan ke dashboard Super Admin.",
          "success",
          "Lanjut"
        );

        // Store data and navigate after a brief delay
        setTimeout(() => {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          navigate("/super-admin/dashboard");
        }, 1500); // 1.5 seconds delay

      } else {
        // General Login Error
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
    // Reset form data according to the panel
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
      {/* Styles */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

        :root {
          --themered: #ef4444;
          --themeorange: #f97316;
          --light-text-muted: #8b8b8b;
        }

        body {
          background-color: #f3f4f6;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        body::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 640px) {
          .mobile-hidden {
            display: none;
          }
        }
        `}
      </style>

      {/* Custom Alert Popup */}
      <AlertPopup
        isOpen={isPopupOpen}
        onClose={closePopup}
        onConfirm={closePopup} // Simple alert: confirm is just close
        title={popupData.title}
        message={popupData.message}
        type={popupData.type}
        confirmText={popupData.confirmText}
        showCancel={popupData.showCancel}
      />

      <div className="h-screen w-screen chicken-pattern flex items-center justify-center p-4 overflow-hidden relative">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-orange-400 rounded-full opacity-20 blur-3xl"></div>
        
        {/* Main Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            
            {/* Left Side - Branding */}
            <motion.div 
              className="hidden md:flex flex-col items-center justify-center space-y-6 float-animation cursor-default"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-3xl opacity-30"></div>
                <div className="relative bg-white p-8 rounded-3xl shadow-2xl">
                  <img src="images/LogoGoChickenReal.png" alt="GoChicken Logo" className="w-64"/>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
                  GoChicken
                </h1>
                <p className="text-sm font-semibold text-gray-600 max-w-xs">
                  Portal Administrasi untuk mengelola GoChicken dengan mudah dan efisien
                </p>
              </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="glass-effect rounded-3xl shadow-2xl p-8 md:p-10"
            >
              {/* Mobile Logo */}
              <div className="md:hidden text-center mb-6">
                <h1 className="text-3xl text-gray-600 font-semibold">
                  Portal Administrasi
                </h1>
                <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
                  GoChicken
                </h1>
              </div>

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Selamat Datang! 👋
                </h2>
                <p className="text-gray-600 text-sm">Masuk ke akun admin Anda</p>
              </div>

              {/* Tab Switcher */}
              <div className="relative bg-gray-100 rounded-2xl p-1.5 mb-6">
                <motion.div
                  className="absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] rounded-xl shadow-md"
                  animate={{
                    x: activePanel === "cabang" ? "0%" : "calc(100% + 0.75rem)",
                    backgroundColor: activePanel === "cabang" ? "#EF4444" : "#F97316",
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
                <div className="relative grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleSwitchPanel("cabang")}
                    className={`flex items-center cursor-pointer justify-center py-3 px-4 rounded-xl z-10 transition-all duration-300 font-semibold text-sm ${
                      activePanel === "cabang" ? "text-white" : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Admin Cabang
                  </button>
                  <button
                    onClick={() => handleSwitchPanel("super")}
                    className={`flex items-center cursor-pointer justify-center py-3 px-4 rounded-xl z-10 transition-all duration-300 font-semibold text-sm ${
                      activePanel === "super" ? "text-white" : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Super Admin
                  </button>
                </div>
              </div>

              {/* Forms */}
              <div className="relative min-h-[340px]">
                <AnimatePresence mode="wait">
                  {/* Admin Cabang Form */}
                  {activePanel === "cabang" && (
                    <motion.div
                      key="cabang"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      {/* Dropdown Cabang */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Pilih Cabang
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-yellow-400 focus:border-yellow-500 input-glow transition-all duration-200 font-medium"
                          >
                            <span className={formData.cabang ? "text-gray-800" : "text-gray-400"}>
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
                                className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden"
                              >
                                {cabangOptions.map((cabang, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                      handleCabangChange("cabang", cabang);
                                      setIsDropdownOpen(false);
                                    }}
                                    className="w-full px-4 py-3.5 text-left text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:text-orange-700 transition-all duration-200 font-medium"
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password Cabang
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.passwordCabang}
                            onChange={(e) => handleCabangChange("passwordCabang", e.target.value)}
                            className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-yellow-500 input-glow transition-all duration-200 pr-12 text-gray-800 font-medium"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Password Personal */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password Personal
                        </label>
                        <div className="relative">
                          <input
                            type={showPersonalPassword ? "text" : "password"}
                            value={formData.personalPassword}
                            onChange={(e) => handleCabangChange("personalPassword", e.target.value)}
                            className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-yellow-500 input-glow transition-all duration-200 pr-12 text-gray-800 font-medium"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPersonalPassword(!showPersonalPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPersonalPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        type="button"
                        onClick={handleCabangLogin}
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 px-6 mt-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Memproses...
                          </div>
                        ) : (
                          "Masuk ke Dashboard"
                        )}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Super Admin Form */}
                  {activePanel === "super" && (
                    <motion.div
                      key="super"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={superAdminData.username}
                          onChange={(e) => handleSuperAdminChange("username", e.target.value)}
                          className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 input-glow transition-all duration-200 text-gray-800 font-medium"
                          placeholder="admin@gochicken.com"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={superAdminData.password}
                            onChange={(e) => handleSuperAdminChange("password", e.target.value)}
                            className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 input-glow transition-all duration-200 pr-12 text-gray-800 font-medium"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        type="button"
                        onClick={handleSuperAdminLogin}
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 px-6 mt-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Memproses...
                          </div>
                        ) : (
                          "Masuk ke Dashboard"
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;