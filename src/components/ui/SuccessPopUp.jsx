import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

const SuccessPopup = ({ isOpen, onClose, title, message }) => {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (isOpen) {
      setCountdown(4);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border-t-4 border-green-500"
            initial={{ y: -50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 stroke-2" />
              <h3 className="text-xl font-semibold text-gray-800 text-center">
                {title}
              </h3>
            </div>

            <div className="mt-4 mb-6">
              <p className="text-sm text-gray-600 text-center">{message}</p>
              <p className="text-xs text-gray-500 font-bold text-center mt-2">
                (Otomatis tertutup dalam {countdown} detik)
              </p>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 text-sm font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessPopup;
