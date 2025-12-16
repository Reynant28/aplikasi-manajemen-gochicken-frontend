// components/UI/BackupPopup.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Download, AlertCircle, X } from 'lucide-react';

const BackupPopup = ({ isOpen, type, title, message, filename, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      default:
        return <Download className="w-6 h-6 text-blue-500" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-sm w-full rounded-xl shadow-2xl border-l-4 p-4 pr-10 bg-white";
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500`;
      case 'error':
        return `${baseStyles} border-red-500`;
      case 'warning':
        return `${baseStyles} border-yellow-500`;
      default:
        return `${baseStyles} border-blue-500`;
    }
  };

  const getProgressBarColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={getStyles()}
      >
        {/* Progress Bar */}
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 4, ease: "linear" }}
          className={`absolute top-0 left-0 h-1 ${getProgressBarColor()} rounded-t-xl`}
        />
        
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm mb-1 flex items-center gap-2">
              {title}
              {type === 'success' && (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  Berhasil
                </span>
              )}
              {type === 'error' && (
                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                  Gagal
                </span>
              )}
            </h4>
            
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
              {message}
            </p>
            
            {filename && type === 'success' && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-lg">
                <Download className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-700 font-medium truncate">
                  {filename}
                </span>
              </div>
            )}
            
            {type === 'error' && (
              <button
                onClick={onClose}
                className="mt-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors font-medium"
              >
                Coba Lagi
              </button>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors absolute top-2 right-2"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BackupPopup;