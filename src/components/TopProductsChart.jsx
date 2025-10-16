// src/components/TopProductsChart.jsx
import React from 'react';
//eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

const TopProductsChart = ({ data }) => {

  // Helper to get podium colors for the rank badges
  const getRankStyle = (index) => {
    switch (index) {
      case 0: return 'bg-amber-400 text-amber-900'; // Gold
      case 1: return 'bg-slate-300 text-slate-700'; // Silver
      case 2: return 'bg-orange-300 text-orange-800'; // Bronze
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="text-amber-500" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">Produk Terlaris</h3>
      </div>

      {!data || data.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-gray-500">
          No product data available.
        </div>
      ) : (
        <div className="flex-grow flex flex-col space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {data.map((product, index) => (
            <motion.div
              key={product.nama_produk}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span 
                    className={`flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-md text-xs font-bold ${getRankStyle(index)}`}
                  >
                    {index + 1}
                  </span>
                  <p 
                    className="font-semibold text-gray-700 truncate" 
                    title={product.nama_produk}
                  >
                    {product.nama_produk}
                  </p>
                </div>
                <p className="font-bold text-gray-800 flex-shrink-0 pl-4">
                  {product.total_terjual}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopProductsChart;