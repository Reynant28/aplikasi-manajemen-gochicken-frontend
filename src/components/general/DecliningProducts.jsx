import React from "react";
import { motion } from "framer-motion";
import { TrendingDown } from "lucide-react";

const DecliningProducts = ({ loading, data }) => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-100 to-gray-200 hover:shadow-lg transition-all rounded-2xl shadow-md border border-gray-100 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingDown className="text-orange-600" />
        Produk yang Menurun Penjualannya
      </h2>

      {loading ? (
        <div className="text-gray-500">Memuat data produk menurun...</div>
      ) : data.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          Tidak ada produk dengan penurunan penjualan signifikan
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((product, index) => (
            <div
              key={index}
              className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{product.nama_produk}</h3>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                  #{index + 1}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Bulan Ini</p>
                  <p className="font-bold text-orange-600">{product.current_sales} terjual</p>
                </div>
                <div>
                  <p className="text-gray-500">Bulan Lalu</p>
                  <p className="font-bold text-gray-600">{product.previous_sales} terjual</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-red-600">
                <TrendingDown size={16} />
                <span className="font-semibold">{Math.abs(product.decline_percentage).toFixed(1)}% penurunan</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DecliningProducts;