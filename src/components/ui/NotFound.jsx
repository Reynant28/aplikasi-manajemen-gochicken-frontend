// src/components/UI/NotFound.jsx
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  // Ambil data user dan cabang dari localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const cabang = JSON.parse(localStorage.getItem("cabang"));
  
  // Tentukan path help center berdasarkan role
  const getHelpCenterPath = () => {
    if (user?.role === "super admin") {
      return "/super-admin/dashboard/help";
    } else if (user?.role === "admin cabang" && cabang?.id_cabang) {
      return `/admin-cabang/${cabang.id_cabang}/dashboard/help`;
    } else {
      return "/"; // Fallback ke login
    }
  };

  const helpCenterPath = getHelpCenterPath();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg"
        >
          <AlertTriangle className="w-16 h-16 text-red-500" />
        </motion.div>

        {/* Text Content */}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-8xl font-black text-gray-900 mb-2"
        >
          404
        </motion.h1>
        
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-gray-800 mb-4"
        >
          Halaman Tidak Ditemukan
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600 mb-8 text-lg"
        >
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>
          
          <Link 
            to={helpCenterPath}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
          >
            <HelpCircle size={20} />
            Ke Help Center
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;