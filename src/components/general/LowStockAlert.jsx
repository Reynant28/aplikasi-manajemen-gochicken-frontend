import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const LowStockAlert = ({ loading, data }) => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-100 to-gray-200 hover:shadow-lg transition-all rounded-2xl shadow-md border border-gray-100 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <AlertTriangle className="text-red-600" />
        Stok Bahan Hampir Habis
      </h2>

      {loading ? (
        <div className="text-gray-500">Memuat data stok rendah...</div>
      ) : data.length === 0 ? (
        <div className="text-gray-700 text-center py-8 flex flex-col items-center gap-2">
          <p className="font-semibold">Semua stok aman! 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((product, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                product.jumlah_stok === 0
                  ? "bg-red-50 border-red-200"
                  : product.jumlah_stok <= 2
                  ? "bg-orange-50 border-orange-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{product.nama_produk}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    product.jumlah_stok === 0
                      ? "bg-red-100 text-red-700"
                      : product.jumlah_stok <= 2
                      ? "bg-orange-100 text-orange-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  Stok: {product.jumlah_stok}
                </span>
              </div>
              {product.nama_cabang && (
                <p className="text-sm text-gray-600 mb-2">
                  📍 {product.nama_cabang}
                </p>
              )}
              <div className="flex items-center gap-2">
                <AlertTriangle
                  size={16}
                  className={
                    product.jumlah_stok === 0
                      ? "text-red-600"
                      : product.jumlah_stok <= 2
                      ? "text-orange-600"
                      : "text-yellow-600"
                  }
                />
                <span className="text-sm font-medium text-gray-700">
                  {product.jumlah_stok === 0
                    ? "Habis! Segera restock"
                    : "Perlu restock segera"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default LowStockAlert;