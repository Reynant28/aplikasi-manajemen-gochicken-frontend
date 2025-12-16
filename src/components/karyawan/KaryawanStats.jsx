// src/components/Karyawan/KaryawanStats.jsx
import React from "react";
import { motion } from "framer-motion";
import { Users, Building, Filter } from "lucide-react";

export default function KaryawanStats({ karyawanCount, cabangCount, filteredCount, searchTerm, filterCabang, theme }) {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Total Karyawan Card - Orange */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Karyawan</p>
            <p className="text-3xl font-bold text-gray-800">{karyawanCount}</p>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
              <p className="text-gray-500 text-xs">Semua cabang</p>
            </div>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
            <Users className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Total Cabang Card - Merah */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Cabang</p>
            <p className="text-3xl font-bold text-gray-800">{cabangCount}</p>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
              <p className="text-gray-500 text-xs">Aktif</p>
            </div>
          </div>
          <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
            <Building className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      {/* Karyawan Ditampilkan Card - Amber */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-amber-500 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Karyawan Ditampilkan</p>
            <p className="text-3xl font-bold text-gray-800">{filteredCount}</p>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
              <p className="text-gray-500 text-xs">
                {searchTerm || filterCabang ? 'Hasil filter' : 'Semua data'}
              </p>
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
            <Filter className="text-amber-600" size={24} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}