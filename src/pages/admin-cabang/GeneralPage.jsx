import React, { useState } from 'react'; // Tambahkan 'useState' untuk me-refresh jika perlu, meskipun getThemeClasses() cukup untuk pembacaan awal
import { motion } from "framer-motion";
import { Users, Building2, Wallet, Briefcase } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { availableThemes, saveThemeToStorage, getThemeClasses } from "../../components/ui/themeUtils.js"; 

const GeneralPage = () => {
  // Ambil class tema saat komponen dimuat/di-render
  const theme = getThemeClasses();
  
  // Dummy data grafik pengeluaran per bulan
  const expenseData = [
    { month: "Jan", expense: 4000000 },
    { month: "Feb", expense: 3200000 },
    { month: "Mar", expense: 5000000 },
    { month: "Apr", expense: 2800000 },
    { month: "Mei", expense: 6000000 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Judul */}
      <motion.h1
        className="text-3xl font-bold text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Dashboard Overview
      </motion.h1>

      {/* Statistik Cards - Card 1 (Menggunakan tema utama) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className={`bg-gradient-to-r ${theme.gradient} text-white rounded-xl shadow-lg p-5 flex items-center gap-4`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Users size={36} />
          <div>
            <h2 className="text-lg font-semibold">Total Karyawan</h2>
            <p className="text-2xl font-bold">25</p>
          </div>
        </motion.div>

        {/* Card 2, 3, 4 Dibiarkan tetap dengan warna sekunder untuk variasi visual di dashboard */}
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-5 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Building2 size={36} />
          <div>
            <h2 className="text-lg font-semibold">Total Cabang</h2>
            <p className="text-2xl font-bold">5</p>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-5 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Wallet size={36} />
          <div>
            <h2 className="text-lg font-semibold">Pengeluaran Bulan Ini</h2>
            <p className="text-2xl font-bold">Rp 6.000.000</p>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl shadow-lg p-5 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Briefcase size={36} />
          <div>
            <h2 className="text-lg font-semibold">Total Gaji</h2>
            <p className="text-2xl font-bold">Rp 15.000.000</p>
          </div>
        </motion.div>
      </div>

      {/* Grafik Pengeluaran */}
      <motion.div
        className="bg-white shadow-lg rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Pengeluaran per Bulan
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={expenseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `Rp ${value.toLocaleString()}`} />
            <Line
              type="monotone"
              dataKey="expense"
              // Menggunakan stroke dari tema yang dipilih
              stroke={theme.stroke} 
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Aktivitas Terbaru (Hanya menyesuaikan warna list item pertama untuk contoh) */}
      <motion.div
        className="bg-white shadow-lg rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Aktivitas Terbaru
        </h2>
        <ul className="space-y-3 text-gray-700">
          <li className="border-b pb-2">
            <span className={theme.text}>●</span> Tambah Karyawan baru: <span className="font-semibold">Budi</span>
          </li>
          <li className="border-b pb-2">
            🔵 Cabang baru ditambahkan:{" "}
            <span className="font-semibold">Cabang Surabaya</span>
          </li>
          <li className="border-b pb-2">
            🔴 Pengeluaran Rp 2.000.000 untuk <span className="font-semibold">Bahan Produksi</span>
          </li>
          <li>
            🟡 Gaji bulan ini dibayarkan untuk{" "}
            <span className="font-semibold">10 Karyawan</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default GeneralPage;