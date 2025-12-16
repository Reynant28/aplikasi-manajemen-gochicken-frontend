// src/components/BahanBaku/BahanBakuStats.jsx
import React from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle, Filter } from "lucide-react";

// Helper function yang diimpor dari BahanPage
const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function BahanBakuStats({ totalBahan, lowStockBahan, totalValue }) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Total Bahan Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Bahan</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">
              {totalBahan}
            </p>
            <p className="text-orange-600 text-xs mt-2">Jenis bahan</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl">
            <Package className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Stok Rendah Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Stok Rendah</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">
              {lowStockBahan}
            </p>
            <p className="text-red-600 text-xs mt-2">Perlu restock</p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      {/* Total Nilai Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Nilai</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              {formatRupiah(totalValue)}
            </p>
            <p className="text-green-600 text-xs mt-2">Inventory value</p>
          </div>
          <div className="p-3 bg-green-50 rounded-xl">
            <Filter className="text-green-600" size={24} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}