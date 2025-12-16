// src/components/Pengeluaran/PengeluaranHeader.jsx
import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function PengeluaranHeader({ openModal, loading, theme }) {
    return (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-800">
                    Manajemen Pengeluaran
                </h1>
                <p className="text-gray-500 mt-1">
                    Catat arus kas keluar dan belanja operasional
                </p>
            </div>
            <button onClick={() => openModal('add')} disabled={loading} className={`flex items-center gap-2 ${theme.primaryBg} ${theme.primaryHoverBg} text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1`}>
                <Plus size={20} /> <span className="font-semibold">Tambah Pengeluaran</span>
            </button>
        </motion.div>
    );
}