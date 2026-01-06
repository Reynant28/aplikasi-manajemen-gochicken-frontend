import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, LoaderCircle } from "lucide-react";

const formatRupiah = (value = 0) => {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `Rp ${value}`;
  }
};

const MonthComparison = ({ loading, data }) => {
  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp className="text-green-600" />
        Perbandingan Bulan Ini dengan Bulan Lalu
      </h2>

      {loading ? (
        <div className="text-gray-500">Memuat data perbandingan...</div>
      ) : data ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all">
            <p className="text-sm text-gray-600 mb-1">Pendapatan</p>
            <p className="text-2xl font-bold text-gray-800 mb-2">
              {formatRupiah(data.current_revenue)}
            </p>
            <div className={`flex items-center gap-1 text-sm ${data.revenue_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.revenue_change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="font-semibold">{Math.abs(data.revenue_change).toFixed(1)}%</span>
              <span className="text-gray-500">vs bulan lalu</span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all">
            <p className="text-sm text-gray-600 mb-1">Transaksi</p>
            <p className="text-2xl font-bold text-gray-800 mb-2">
              {data.current_transactions}
            </p>
            <div className={`flex items-center gap-1 text-sm ${data.transaction_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.transaction_change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="font-semibold">{Math.abs(data.transaction_change).toFixed(1)}%</span>
              <span className="text-gray-500">vs bulan lalu</span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all">
            <p className="text-sm text-gray-600 mb-1">Rata-rata per Transaksi</p>
            <p className="text-2xl font-bold text-gray-800 mb-2">
              {formatRupiah(data.avg_transaction)}
            </p>
            <div className={`flex items-center gap-1 text-sm ${data.avg_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.avg_change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="font-semibold">{Math.abs(data.avg_change).toFixed(1)}%</span>
              <span className="text-gray-500">vs bulan lalu</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-gray-500">Data perbandingan tidak tersedia</div>
      )}
    </motion.div>
  );
};

export default MonthComparison;