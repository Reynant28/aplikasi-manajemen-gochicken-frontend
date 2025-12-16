import React from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Phone } from "lucide-react";

const CabangStats = ({ totalCabang, theme }) => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Card 1: Total Cabang */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Cabang</p>
            <p className="text-3xl font-bold text-gray-800">{totalCabang}</p>
            <div className="flex items-center mt-2 gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
              <p className="text-gray-500 text-xs">Beroperasi</p>
            </div>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
            <Building2 className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Card 2: Wilayah (Visual Placeholder) */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Wilayah Terdaftar</p>
            <p className="text-3xl font-bold text-gray-800">{totalCabang}</p>
            <div className="flex items-center mt-2 gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
              <p className="text-gray-500 text-xs">Lokasi fisik</p>
            </div>
          </div>
          <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
            <MapPin className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      {/* Card 3: Kontak Terhubung (Visual Placeholder) */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-amber-500 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Kontak Aktif</p>
            <p className="text-3xl font-bold text-gray-800">{totalCabang}</p>
            <div className="flex items-center mt-2 gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
              <p className="text-gray-500 text-xs">Telepon terdaftar</p>
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
            <Phone className="text-amber-600" size={24} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CabangStats;