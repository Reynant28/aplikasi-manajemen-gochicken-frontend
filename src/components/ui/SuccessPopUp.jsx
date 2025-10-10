import React, { useEffect } from "react";
import { X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SuccessPopUp = ({ isOpen, onClose, title, message, duration = 3000 }) => {
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key="popup"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 w-96"
        >
          <div className="relative bg-green-500 rounded-lg shadow-lg text-white flex items-center justify-between px-4 py-3 overflow-hidden">
            {/* Konten */}
            <div className="flex items-center gap-2">
              <CheckCircle size={22} className="text-white" />
              <p className="font-medium">{message}</p>
            </div>

            {/* Tombol close */}
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition"
            >
              <X size={18} />
            </button>

            {/* Progress Bar pakai animasi */}
            <motion.div
              key="progress"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 4, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-green-300"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessPopUp;
