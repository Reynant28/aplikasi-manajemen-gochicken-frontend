import React from "react";
import { motion } from "framer-motion";
import { Users, Building, AlertTriangle } from "lucide-react";

const AdminStats = ({ adminCount, emptyCabangCount, totalCabangCount }) => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Card 1: Total Admin (Orange) */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Admin</p>
            <p className="text-3xl font-bold text-gray-800">{adminCount}</p>
            <div className="flex items-center mt-2 gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
              <p className="text-gray-500 text-xs">Akun aktif</p>
            </div>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
            <Users className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Card 2: Cabang Tanpa Admin (Red) */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Cabang Tanpa Admin</p>
            <p className="text-3xl font-bold text-gray-800">{emptyCabangCount}</p>
            <div className="flex items-center mt-2 gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
              <p className="text-gray-500 text-xs">Perlu akun baru</p>
            </div>
          </div>
          <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      {/* Card 3: Total Unit Cabang (Amber) */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-amber-500 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Unit Cabang</p>
            <p className="text-3xl font-bold text-gray-800">{totalCabangCount}</p>
            <div className="flex items-center mt-2 gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
              <p className="text-gray-500 text-xs">Seluruh unit terdaftar</p>
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
            <Building className="text-amber-600" size={24} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminStats;