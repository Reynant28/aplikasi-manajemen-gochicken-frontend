// src/components/ui/SuccessPopUp.jsx (atau di mana pun file Anda berada)
import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SuccessPopUp = ({
  isOpen,
  onClose,
  message,
  type = "success", // Tipe: 'success', 'error', 'warning', 'super admin', 'admin cabang'
  duration = 3000,
}) => {
  
  // Timer untuk menutup otomatis
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [isOpen, onClose, duration]);

  // --- LOGIKA TEMA BARU (Sesuai PengeluaranPage) ---
  const getTheme = () => {
    switch (type) {
      case "error":
        return {
          styleClass: "bg-red-100 text-red-800",
          icon: "✗",
        };
      case "warning":
        return {
          styleClass: "bg-yellow-100 text-yellow-800",
          icon: "!", // Anda bisa ganti dengan ikon lucide jika mau
        };
      case "super admin": // Samakan 'super admin' dengan 'success' (orange)
      case "success":
      default:
        // Di PengeluaranPage, 'success' memakai tema orange
        return {
          styleClass: "bg-orange-100 text-orange-800", 
          icon: "✓",
        };
    }
  };

  const { styleClass, icon } = getTheme();

  return (
    <AnimatePresence>
      {isOpen && message && (
        <motion.div
          key="popup"
          // --- PERUBAHAN ANIMASI & POSISI ---
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }} // y: 20 agar lebih natural saat hilang
          transition={{ type: "spring", stiffness: 500, damping: 30 }} // Transisi spring lembut
          
          // --- PERUBAHAN DESAIN & CLASSNAME ---
          className={`fixed top-6 left-1/2 -translate-x-1/2 p-3 rounded-lg flex items-center gap-3 text-sm font-semibold shadow-lg z-[100] ${styleClass}`}
        >
          {/* Konten (Ikon Teks + Pesan) */}
          <span>{icon}</span>
          <span>{message}</span>

          {/* Tombol close (opsional, tapi bagus untuk UX) */}
          <button
            onClick={onClose}
            // Styling tombol close agar menyatu dengan tema
            className="ml-2 -mr-1 p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X size={16} />
          </button>
          
          {/* Progress bar dihilangkan agar sesuai target */}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessPopUp;