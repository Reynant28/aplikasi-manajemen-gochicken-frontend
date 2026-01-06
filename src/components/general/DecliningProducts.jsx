import React from "react";
import { motion } from "framer-motion";
import { TrendingDown } from "lucide-react";

const DecliningProducts = ({ loading, data }) => {
  return (
    <motion.div 
      className="bg-gray-50 hover:shadow-lg transition-all rounded-2xl shadow-md border border-gray-100 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingDown className="text-red-600" />
        Produk yang Menurun Penjualannya
      </h2>

      {loading ? (
        <div className="text-gray-500">Memuat data produk menurun...</div>
      ) : data.length === 0 ? (
        <motion.div className="text-gray-500 text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Tidak ada produk dengan penurunan penjualan signifikan
        </motion.div>
      ) : (
        <div className="space-y-3">
          {data.map((product, index) => (
            <motion.div
              key={index}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
                  <p className="font-bold text-red-600">{product.current_sales} terjual</p>
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
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DecliningProducts;