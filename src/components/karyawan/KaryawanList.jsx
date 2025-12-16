// src/components/Karyawan/KaryawanList.jsx
import React from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash, User, Home, Phone, Building, Users, Loader2 } from "lucide-react";

export default function KaryawanList({ 
    filteredKaryawan, 
    karyawanCount, 
    loading, 
    theme, 
    setShowAddForm, 
    setEditKaryawan, 
    confirmDelete, 
    formatRupiah // Di-pass sebagai prop
}) {

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white/80 rounded-2xl shadow-lg">
        <div className="text-center">
          <Loader2 className={`w-12 h-12 ${theme.primaryAccent} animate-spin mx-auto mb-4`} />
          <p className="text-lg text-gray-600 font-medium">Memuat data karyawan...</p>
          <p className="text-sm text-gray-500 mt-2">Silakan tunggu sebentar</p>
        </div>
      </div>
    );
  }
  
  // Memastikan filteredKaryawan adalah array sebelum mengecek length
  if (!Array.isArray(filteredKaryawan) || filteredKaryawan.length === 0) { 
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex flex-col items-center justify-center p-12 bg-white/80 rounded-2xl shadow-inner text-center">
        <Users size={64} className="text-gray-300 mb-4" />
        <p className="text-gray-600 font-semibold text-xl mb-2">
          {karyawanCount === 0 ? "Belum Ada Karyawan" : "Tidak Ditemukan"}
        </p>
        <p className="text-gray-500 max-w-md">
          {karyawanCount === 0 
            ? "Silakan tambahkan karyawan baru untuk memulai pengelolaan data karyawan." 
            : "Tidak ada karyawan yang sesuai dengan kriteria pencarian Anda."
          }
        </p>
        {karyawanCount === 0 && (
          <button 
            onClick={() => setShowAddForm(true)}
            className={`mt-6 flex items-center gap-2 ${theme.primaryBg} ${theme.primaryHoverBg} text-white px-6 py-3 rounded-xl shadow-lg transition-all`}
          >
            <Plus size={18} /> 
            Tambah Karyawan Pertama
          </button>
        )}
      </motion.div>
    );
  }

  return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
        >
            {/* PASTIKAN container Grid tetap ada */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredKaryawan.map((item, index) => (
                    <motion.div 
                        key={item.id_karyawan} 
                        // 🟢 Perbaikan 1: Tambahkan h-full dan flex flex-col pada card container
                        className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 h-full flex flex-col"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        {/* Header Card (tetap) */}
                        <div className={`bg-gradient-to-r ${theme.cardGradient} p-4 text-white flex-shrink-0`}> {/* Tambah flex-shrink-0 */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-full">
                                        <User size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold truncate">{item.nama_karyawan}</h3>
                                </div>
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                    ID: {item.id_karyawan}
                                </span>
                            </div>
                        </div>
                        
                        {/* 🟢 Perbaikan 2: Bungkus konten di div yang menggunakan flex-grow */}
                        <div className="p-5 flex-grow flex flex-col justify-between">
                            
                            {/* Grup Informasi Statis (Bagian atas) */}
                            <div className="space-y-3 flex-shrink-0">
                                <div className="flex items-start gap-3">
                                    <Building size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500">Cabang</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {item.cabang?.nama_cabang || "N/A"}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3">
                                    <Phone size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500">Telepon</p>
                                        <p className="text-sm font-medium text-gray-800">{item.telepon}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3">
                                    <Home size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500">Alamat</p>
                                        {/* Gunakan min-h-10 agar alamat yang pendek tidak membuat card terlalu kecil */}
                                        <p className="text-sm text-gray-800 line-clamp-2 min-h-10">{item.alamat}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Grup Gaji & Aksi (Bagian Bawah yang didorong) */}
                            <div className="mt-4 flex-shrink-0"> 
                                <div className="pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">Gaji</p>
                                    <p className={`text-lg font-bold ${theme.primaryText}`}>
                                        {formatRupiah(item.gaji)}
                                    </p>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
                                    <button 
                                        onClick={() => setEditKaryawan(item)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        <Edit size={14} /> 
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => confirmDelete(item.id_karyawan)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        <Trash size={14} /> 
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}