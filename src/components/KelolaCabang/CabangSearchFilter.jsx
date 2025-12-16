import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const CabangSearchFilter = ({ searchTerm, setSearchTerm, theme }) => {
  return (
    <motion.div 
      className="bg-white rounded-2xl p-6 shadow-lg mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Cari nama cabang, alamat, atau telepon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent transition outline-none`}
        />
      </div>
    </motion.div>
  );
};

export default CabangSearchFilter;