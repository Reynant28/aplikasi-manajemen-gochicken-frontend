// src/pages/BahanBakuPakai.jsx
import React, { useState, useEffect, useCallback } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Package,
  Loader2,
  Calendar,
  XCircle,
  Box,
  X,
} from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function BahanBakuPakai() {
  const [tanggal, setTanggal] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [pemakaianList, setPemakaianList] = useState([]);
  const [bahanList, setBahanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Data states
  const [deletePemakaian, setDeletePemakaian] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    id_bahan_baku: "",
    jumlah_pakai: "",
    catatan: "",
  });

  const token = localStorage.getItem("token");

  // Fetch daftar bahan baku untuk dropdown
  const fetchBahanList = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/bahan-baku`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBahanList(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch bahan list:", err);
    }
  }, [token]);

  // Fetch data pemakaian harian
  const fetchPemakaian = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${API_URL}/bahan-baku-pakai?tanggal=${tanggal}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPemakaianList(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch pemakaian:", err);
      setError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }, [tanggal, token]);

  useEffect(() => {
    fetchBahanList();
    fetchPemakaian();
  }, [fetchBahanList, fetchPemakaian]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddModal = () => {
    setFormData({
      id_bahan_baku: "",
      jumlah_pakai: "",
      catatan: "",
    });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  // Tambah data pemakaian
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.id_bahan_baku || !formData.jumlah_pakai) {
      setMessage({
        type: "error",
        text: "Pilih bahan baku dan isi jumlah pakai!",
      });
      return;
    }

    setActionLoading("adding");
    try {
      await axios.post(
        `${API_URL}/bahan-baku-pakai`,
        {
          tanggal,
          ...formData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage({
        type: "success",
        text: "Data pemakaian berhasil ditambahkan!",
      });
      closeAddModal();
      await fetchPemakaian();
    } catch (err) {
      console.error("Add pemakaian error:", err);
      setMessage({ type: "error", text: "Gagal menambahkan data pemakaian." });
    } finally {
      setActionLoading(null);
    }
  };

  // Hapus pemakaian
  const confirmDelete = (pemakaian) => {
    setDeletePemakaian(pemakaian);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletePemakaian) return;

    setActionLoading("deleting");
    try {
      await axios.delete(
        `${API_URL}/bahan-baku-pakai/${deletePemakaian.id_pemakaian}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ type: "success", text: "Data pemakaian berhasil dihapus!" });
      await fetchPemakaian();
      setIsDeleteModalOpen(false);
      setDeletePemakaian(null);
    } catch (err) {
      console.error("Delete pemakaian error:", err);
      setMessage({ type: "error", text: "Gagal menghapus data pemakaian." });
    } finally {
      setActionLoading(null);
    }
  };

  const totalModal = pemakaianList.reduce(
    (sum, item) => sum + (item.total_modal || 0),
    0
  );

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <Loader2 className="animate-spin h-8 w-8 mb-4 text-red-500" />
          <p>Memuat data pemakaian...</p>
        </div>
      );

    if (error)
      return (
        <div className="flex flex-col items-center justify-center h-96 text-red-700 bg-red-50 rounded-lg">
          <XCircle className="h-10 w-10 mb-4" />
          <p className="font-semibold">Terjadi Kesalahan</p>
          <p>{error}</p>
        </div>
      );

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Bahan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Satuan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Harga Satuan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah Pakai
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Modal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catatan
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pemakaianList.length > 0 ? (
              pemakaianList.map((item) => (
                <motion.tr
                  key={item.id_pemakaian}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Package className="text-red-600" size={16} />
                      </div>
                      <span className="font-medium">{item.nama_bahan}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {Number(item.satuan) % 1 === 0
                      ? Number(item.satuan)
                      : Number(item.satuan).toFixed(1)}{" "}
                    kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatRupiah(item.harga_satuan)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {Number(item.jumlah_pakai) % 1 === 0
                      ? Number(item.jumlah_pakai)
                      : Number(item.jumlah_pakai).toFixed(1)}{" "}
                    pcs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatRupiah(item.total_modal)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.catatan || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => confirmDelete(item)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors rounded-full hover:bg-red-100"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Box size={32} />
                    <p className="font-semibold">Tidak ada data pemakaian</p>
                    <p className="text-sm">
                      Belum ada data pemakaian untuk tanggal ini
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Total Summary */}
        {pemakaianList.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Total Modal Harian:
              </span>
              <span className="text-lg font-bold text-gray-900">
                {formatRupiah(totalModal)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Pemakaian Bahan Baku Harian
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Kelola dan pantau penggunaan bahan baku setiap hari
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition shadow-md font-semibold self-start sm:self-center"
          >
            <Plus size={18} /> Tambah Pemakaian
          </button>
        </div>

        {/* Message Display */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg flex items-center gap-3 text-sm font-semibold ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.type === "success" ? "✓" : "✗"} {message.text}
          </motion.div>
        )}

        {/* Date Filter Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Tanggal
              </label>
              <div className="relative max-w-xs">
                <Calendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Menampilkan data untuk tanggal:{" "}
              <span className="font-semibold text-gray-700">{tanggal}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>{renderContent()}</div>
      </motion.div>

      {/* Add Pemakaian Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            onMouseDown={closeAddModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              onMouseDown={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Tambah Pemakaian Bahan Baku
                </h2>
                <button
                  onClick={closeAddModal}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="date"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bahan Baku
                  </label>
                  <select
                    name="id_bahan_baku"
                    value={formData.id_bahan_baku}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    required
                  >
                    <option value="">Pilih Bahan Baku</option>
                    {bahanList.map((b) => (
                      <option key={b.id_bahan_baku} value={b.id_bahan_baku}>
                        {b.nama_bahan}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Pakai (pcs)
                  </label>
                  <input
                    type="number"
                    name="jumlah_pakai"
                    value={formData.jumlah_pakai}
                    onChange={handleFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan (opsional)
                  </label>
                  <textarea
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    placeholder="Masukkan catatan jika diperlukan..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-red-400 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Menyimpan...
                      </>
                    ) : (
                      "Tambah Pemakaian"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && deletePemakaian && (
          <motion.div
            onMouseDown={() => setIsDeleteModalOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              onMouseDown={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Hapus Data Pemakaian
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Apakah Anda yakin ingin menghapus data pemakaian{" "}
                <strong>"{deletePemakaian.nama_bahan}"</strong>? Tindakan ini
                tidak dapat dibatalkan.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold"
                  disabled={actionLoading === "deleting"}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading === "deleting"}
                  className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-red-400"
                >
                  {actionLoading === "deleting" ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Menghapus...
                    </>
                  ) : (
                    "Hapus"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
