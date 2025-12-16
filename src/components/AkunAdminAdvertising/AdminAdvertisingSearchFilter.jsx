import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function AdminAdvertisingSearchFilter({ 
    searchTerm, 
    setSearchTerm, 
    // filterCabang,    // Opsional: Jika nanti ingin filter by cabang
    // setFilterCabang, // Opsional
    // cabangList,      // Opsional: List semua cabang untuk dropdown
    // resetFilters,    // Opsional
    theme 
}) {
  return (
    <motion.div 
      className="bg-white rounded-2xl p-6 shadow-lg mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* Input Pencarian */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari admin berdasarkan nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent transition outline-none`}
          />
        </div>
        
        {/* Bagian Filter (Opsional, jika ingin menambah filter cabang di masa depan) */}
        {/* <div className="flex gap-3">
          <select
            value={filterCabang}
            onChange={(e) => setFilterCabang(e.target.value)}
            className={`px-4 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent transition outline-none`}
          >
            <option value="">Semua Cabang</option>
            {(cabangList || []).map((cab) => (
              <option key={cab.id_cabang} value={cab.id_cabang}>
                {cab.nama_cabang}
              </option>
            ))}
          </select>
          
          <button
            onClick={resetFilters}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            Reset
          </button>
        </div> 
        */}
      </div>
    </motion.div>
  );
}