// src/components/BahanBaku/BahanBakuSearchBar.jsx
import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function BahanBakuSearchBar({ searchTerm, setSearchTerm, onReset }) {
  return (
    <motion.div
      className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg mb-6 sm:mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari bahan baku berdasarkan nama atau satuan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-black bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
          />
        </div>
        <button
          onClick={onReset}
          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium whitespace-nowrap"
        >
          Reset Pencarian
        </button>
      </div>
    </motion.div>
  );
}