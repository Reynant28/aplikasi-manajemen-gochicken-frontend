// src/components/BahanBaku/BahanBakuList.jsx
import React from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Package, Plus } from "lucide-react";
import BahanBakuSkeletonCard from "./BahanBakuSkeletonCard";

// Helper function yang diimpor dari BahanPage
const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

// Helper function untuk format satuan tanpa .00
const formatSatuan = (value) => {
  const num = Number(value);
  return num % 1 === 0 ? num.toString() : num.toString();
};

export default function BahanBakuList({
  filteredBahan,
  bahanList,
  loading,
  openAddModal,
  openEditModal,
  confirmDelete,
  theme,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, index) => (
            <BahanBakuSkeletonCard key={index} />
          ))}
        </div>
      ) : filteredBahan.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-lg">
          <Package size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-600 font-semibold text-xl mb-2">
            {bahanList.length === 0 ? "Belum Ada Bahan Baku" : "Tidak Ditemukan"}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {bahanList.length === 0
              ? "Silakan tambahkan bahan baku pertama untuk memulai pengelolaan inventory."
              : "Tidak ada bahan baku yang sesuai dengan pencarian Anda."}
          </p>
          {bahanList.length === 0 && (
            <button
              onClick={openAddModal}
              className={`inline-flex items-center gap-2 ${theme.primaryBg} ${theme.primaryHoverBg} text-white px-6 py-3 rounded-xl shadow-lg transition-all`}
            >
              <Plus size={18} />
              Tambah Bahan Pertama
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile & Tablet View - Card Layout */}
          <div className="block lg:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredBahan.map((item, index) => (
                <motion.div
                  key={item.id_bahan_baku}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-gray-800 text-lg truncate flex-1 mr-3">
                      {item.nama_bahan}
                    </h3>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(item.id_bahan_baku)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Stok:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.jumlah_stok < 5
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {parseInt(item.jumlah_stok)} {formatSatuan(item.satuan)} kg {/* DITAMBAH kg */}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">
                        Harga Satuan:
                      </span>
                      <span className="font-semibold text-gray-800">
                        {formatRupiah(item.harga_satuan)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Total Nilai:</span>
                      <span className="font-bold text-orange-600">
                        {formatRupiah(item.harga_satuan * item.jumlah_stok)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop View - Table Layout */}
          <div className="hidden lg:block overflow-hidden bg-white shadow-lg rounded-2xl border border-gray-100">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">
                    Nama Bahan
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">Stok</th>
                  <th className="px-6 py-4 text-left font-semibold">Satuan</th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Harga Satuan
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Total Nilai
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBahan.map((item, index) => (
                  <motion.tr
                    key={item.id_bahan_baku}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50/70 border-t border-gray-100 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold">
                      {item.nama_bahan}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.jumlah_stok < 5
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {parseInt(item.jumlah_stok)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {formatSatuan(item.satuan)} kg {/* DITAMBAH kg */}
                    </td>
                    <td className="px-6 py-4">
                      {formatRupiah(item.harga_satuan)}
                    </td>
                    <td className="px-6 py-4 font-bold text-orange-600">
                      {formatRupiah(item.harga_satuan * item.jumlah_stok)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-yellow-600 hover:text-yellow-800 transition p-2 hover:bg-yellow-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(item.id_bahan_baku)}
                          className="text-red-500 hover:text-red-700 transition p-2 hover:bg-red-50 rounded-lg"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  );
}