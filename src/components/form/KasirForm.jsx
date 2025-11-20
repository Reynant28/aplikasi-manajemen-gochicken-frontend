// components/kasir/KasirForm.jsx
import React from "react";
import { motion } from "framer-motion";
import { X, User, Mail } from "lucide-react";

const KasirForm = ({ formData, onChange, onSubmit, loading, isEditing, cabang }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-6 w-full"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEditing ? "Edit Kasir" : "Tambah Kasir"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {isEditing 
                            ? "Update data kasir cabang Anda" 
                            : "Tambahkan kasir baru untuk cabang " + (cabang?.nama_cabang || '')
                        }
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
                {/* Nama Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User size={16} className="inline mr-2" />
                        Nama Kasir
                    </label>
                    <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all"
                        placeholder="Masukkan nama kasir"
                    />
                </div>

                {/* Email Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail size={16} className="inline mr-2" />
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all"
                        placeholder="masukkan email kasir"
                    />
                </div>

                {/* Cabang Info (Read-only) */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                        <strong>Cabang:</strong> {cabang?.nama_cabang || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Kasir akan otomatis ditambahkan ke cabang ini
                    </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => document.querySelector('button[type="button"]').closest('.modal-overlay').click()}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? "Memproses..." : (isEditing ? "Update Kasir" : "Tambah Kasir")}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default KasirForm;