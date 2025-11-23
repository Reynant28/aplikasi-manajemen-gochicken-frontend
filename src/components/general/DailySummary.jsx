import React from "react";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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

const DailySummary = ({ loading, error, data }) => {
  return (
    <motion.div 
      className="bg-gray-50 hover:shadow-lg transition-all rounded-2xl shadow-lg border border-gray-100 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-50 rounded-xl">
            <Calendar className="text-gray-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Laporan Harian</h2>
            <p className="text-gray-600 mt-1">Ringkasan performa bisnis hari ini</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Tanggal</p>
          <p className="text-lg font-semibold text-gray-800">
            {format(new Date(), 'dd MMMM yyyy', { locale: id })}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            Memuat data harian...
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 bg-red-100 rounded-full mb-3">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <p className="text-red-600 font-medium mb-2">Gagal memuat data</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Revenue Card */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                PENDAPATAN
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">Total Penjualan</p>
            <p className="text-2xl font-bold text-gray-800 mb-4">
              {formatRupiah(data.penjualan_harian || 0)}
            </p>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Modal Bahan Baku</p>
              <p className="text-lg font-semibold text-gray-700">
                {formatRupiah(data.modal_bahan_baku || 0)}
              </p>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <TrendingDown className="text-red-600" size={20} />
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                PENGELUARAN
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">Pengeluaran Harian</p>
            <p className="text-2xl font-bold text-gray-800 mb-4">
              {formatRupiah(data.pengeluaran_harian || 0)}
            </p>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Termasuk operasional</p>
              <p className="text-sm text-gray-600">Semua jenis pengeluaran</p>
            </div>
          </div>

          {/* Profit Card */}
          <div className={`rounded-xl p-5 shadow-md border hover:shadow-lg transition-all ${
            (data.laba_harian || 0) >= 0 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100' 
              : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${
                (data.laba_harian || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {(data.laba_harian || 0) >= 0 ? (
                  <TrendingUp className="text-green-500" size={20} />
                ) : (
                  <TrendingDown className="text-red-500" size={20} />
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                (data.laba_harian || 0) >= 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {(data.laba_harian || 0) >= 0 ? 'UNTUNG' : 'RUGI'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">Laba Harian</p>
            <p className={`text-3xl font-bold mb-2 ${
              (data.laba_harian || 0) >= 0 ? 'text-green-600' : 'text-red-500'
            }`}>
              {formatRupiah(data.laba_harian || 0)}
            </p>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">Net Income</p>
              <p className={`text-lg font-semibold ${
                (data.nett_income || 0) >= 0 ? 'text-green-600' : 'text-red-500'
              }`}>
                {formatRupiah(data.nett_income || 0)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <Calendar className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-500 font-medium mb-2">Belum ada data hari ini</p>
          <p className="text-gray-400 text-sm">Data laporan akan muncul setelah ada transaksi</p>
        </div>
      )}
    </motion.div>
  );
};

export default DailySummary;