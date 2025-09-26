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

      <div className="h-screen w-screen flex items-center justify-center p-8 sm:p-12">
        {/* Main Card */}
        <div className="w-full max-w-5xl max-h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          {/* Left Panel: Image */}
          <div className="mobile-hidden md:w-1/2 flex items-center justify-center p-8">
            <img
              src="/images/LogoGoChickenReal.png"
              alt="GoChicken Logo"
              className="w-full max-h-[50vh] object-contain rounded-2xl"
            />
          </div>

          {/* Right Panel */}
          <div className="w-full md:w-1/2 flex items-center justify-center py-8 px-4 sm:p-10">
            <div className="w-full max-w-md flex flex-col">
              {/* Header */}
              <div className="text-center mb-1 mt-4">
                <h1
                  className="text-2xl sm:text-3xl font-semibold mb-1"
                  style={{ fontFamily: "'Fredoka', system-ui, sans-serif" }}
                >
                  <span className="text-gray-900">GoChicken</span>{" "}
                  <motion.span
                    initial={false}
                    animate={{
                      color: activePanel === "cabang" ? "var(--themered)" : "var(--themeorange)",
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    : Admin
                  </motion.span>
                </h1>
                <p
                  className="text-sm"
                  style={{
                    color: "var(--light-text-muted)",
                    fontFamily: "'Fredoka', system-ui, sans-serif",
                  }}
                >
                  Website Administrasi Cabang GoChicken
                </p>
              </div>

              {/* Panel Switcher */}
              <div className="relative bg-white rounded-lg p-1 mb-5 shadow-sm border border-gray-100">
                <motion.div
                  className="absolute top-1 bottom-1 w-1/2 rounded-md shadow-sm"
                  animate={{
                    x: activePanel === "cabang" ? "0%" : "100%",
                    backgroundColor: activePanel === "cabang" ? "#ef4444" : "#f97316",
                  }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                />
                <div className="relative grid grid-cols-2 gap-1 text-sm font-medium">
                  <button
                    onClick={() => handleSwitchPanel("cabang")}
                    className={`flex items-center justify-center py-3 px-4 rounded-md z-10 transition-colors duration-300 ${
                      activePanel === "cabang" ? "text-white" : "text-gray-700"
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Admin Cabang
                  </button>
                  <button
                    onClick={() => handleSwitchPanel("super")}
                    className={`flex items-center justify-center py-3 px-4 rounded-md z-10 transition-colors duration-300 ${
                      activePanel === "super" ? "text-white" : "text-gray-700"
                    }`}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Super Admin
                  </button>
                </div>
              </div>

              {/* Forms */}
              <div className="relative min-h-[300px] overflow-hidden">
                <AnimatePresence initial={false}>
                  {/* Admin Cabang */}
                  {activePanel === "cabang" && (
                    <motion.div
                      key="cabang"
                      initial={{ x: "-100%", opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: "-100%", opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <div className="p-6">
                        <div className="space-y-4">
                          {/* Dropdown */}
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
                                <span
                                  className={
                                    formData.cabang ? "text-gray-800" : "text-gray-500"
                                  }
                                >
                                  {formData.cabang || "Pilih cabang..."}
                                </span>
                                <ChevronDown
                                  className={`w-4 h-4 text-gray-400 transition-transform ${
                                    isDropdownOpen ? "rotate-180" : ""
                                  }`}
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
                                onChange={(e) =>
                                  handleCabangChange("passwordCabang", e.target.value)
                                }
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors pr-12 text-gray-800"
                                placeholder="Masukkan password cabang"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Password Personal
                            </label>
                            <div className="relative">
                              <input
                                type={showPersonalPassword ? "text" : "password"}
                                value={formData.personalPassword}
                                onChange={(e) =>
                                  handleCabangChange("personalPassword", e.target.value)
                                }
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors pr-12 text-gray-800"
                                placeholder="Masukkan password personal"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPersonalPassword(!showPersonalPassword)
                                }
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      </div>
                    </motion.div>
                  )}

                  {/* Super Admin */}
                  {activePanel === "super" && (
                    <motion.div
                      key="super"
                      initial={{ x: "100%", opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: "100%", opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <div className="p-6">
                        <div className="space-y-4">
                          {/* Username (Email) */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email
                            </label>
                            <input
                              type="text"
                              value={superAdminData.username}
                              onChange={(e) =>
                                handleSuperAdminChange("username", e.target.value)
                              }
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors text-gray-800"
                              placeholder="Masukkan email"
                            />
                          </div>

                          {/* Password */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                value={superAdminData.password}
                                onChange={(e) =>
                                  handleSuperAdminChange("password", e.target.value)
                                }
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors pr-12 text-gray-800"
                                placeholder="Masukkan password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit */}
              <div className="px-2 mt-4">
                <div
                  className="relative w-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl 
                                transform hover:scale-[1.02] transition-transform duration-300"
                >
                  <motion.div
                    animate={{ x: activePanel === "cabang" ? "0%" : "-50%" }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="flex w-[200%]"
                  >
                    {/* Cabang */}
                    <div className="w-1/2">
                      <button
                        type="button"
                        onClick={handleCabangLogin}
                        disabled={isLoading}
                        className="w-full py-3 px-6 flex items-center justify-center 
                                  font-medium text-white 
                                  bg-gradient-to-r from-red-500 to-red-600
                                  hover:from-red-600 hover:to-red-700
                                  rounded-l-lg rounded-r-none
                                  disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                        ) : (
                          "Masuk sebagai Admin Cabang"
                        )}
                      </button>
                    </div>

                    {/* Super */}
                    <div className="w-1/2">
                      <button
                        type="button"
                        onClick={handleSuperAdminLogin}
                        disabled={isLoading}
                        className="w-full py-3 px-6 flex items-center justify-center 
                                  font-medium text-white 
                                  bg-gradient-to-r from-orange-400 to-orange-500
                                  hover:from-orange-500 hover:to-orange-600
                                  rounded-r-lg rounded-l-none
                                  disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                        ) : (
                          "Masuk sebagai Super Admin"
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;