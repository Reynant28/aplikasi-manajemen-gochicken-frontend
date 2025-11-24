// src/pages/KasirPage.jsx
import React, { useState, useEffect, useCallback } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Search,
  Mail,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const KasirPage = () => {
  const [kasirList, setKasirList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Data states
  const [editingKasir, setEditingKasir] = useState(null);
  const [deleteKasir, setDeleteKasir] = useState(null);

  // Form and filter states
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Action loading states
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem("token");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // Fetch kasir
  const fetchKasir = useCallback(async () => {
    if (!cabangId) {
      setError("Data cabang tidak ditemukan.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/cabang/${cabangId}/kasir`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "success") {
        setKasirList(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch kasir:", err);
      setError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }, [token, cabangId]);

  useEffect(() => {
    fetchKasir();
  }, [fetchKasir]);

  // Filter kasir based on search
  const filteredKasir = kasirList.filter((kasir) => {
    const matchesSearch =
      kasir.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kasir.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddKasir = () => {
    setEditingKasir(null);
    setFormData({
      nama: "",
      email: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (kasir) => {
    setEditingKasir(kasir);
    setFormData({
      nama: kasir.nama,
      email: kasir.email,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(editingKasir ? "editing" : "adding");

    const apiData = {
      nama: formData.nama,
      email: formData.email,
      id_cabang: cabangId,
    };

    try {
      let res;
      if (editingKasir) {
        res = await axios.put(
          `${API_URL}/kasir/${editingKasir.id_user}`,
          apiData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        res = await axios.post(`${API_URL}/kasir`, apiData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (res.data.status === "success") {
        showMessage("success", res.data.message);
        await fetchKasir();
        setIsModalOpen(false);
        setEditingKasir(null);
      }
    } catch (err) {
      console.error("Submit error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        `Gagal ${editingKasir ? "memperbarui" : "menambah"} kasir`;
      showMessage("error", errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteKasir) return;

    setActionLoading("deleting");
    try {
      const res = await axios.delete(
        `${API_URL}/kasir/${deleteKasir.id_user}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === "success") {
        showMessage("success", res.data.message);
        await fetchKasir();
        setIsDeleteModalOpen(false);
        setDeleteKasir(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      showMessage("error", "Gagal menghapus kasir");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = (kasir) => {
    setDeleteKasir(kasir);
    setIsDeleteModalOpen(true);
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <Loader2 className="animate-spin h-8 w-8 mb-4 text-red-500" />
          <p>Memuat data kasir...</p>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nama Kasir
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKasir.map((kasir) => (
                <motion.tr
                  key={kasir.id_user}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <User className="text-red-600" size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {kasir.nama}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail size={16} className="mr-2 text-gray-400" />
                      {kasir.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Aktif
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(kasir)}
                        className="text-yellow-600 bg-yellow-50 hover:bg-yellow-100 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(kasir)}
                        className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
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
              Kelola Kasir
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Kelola data kasir untuk cabang{" "}
              <strong>{cabang?.nama_cabang || "N/A"}</strong>
            </p>
          </div>
          <button
            onClick={handleAddKasir}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition shadow-md font-semibold self-start sm:self-center"
          >
            <Plus size={18} /> Tambah Kasir
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

        {/* Search Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari kasir..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Kasir Content */}
        <div>{renderContent()}</div>

        {/* Empty State */}
        {!loading && !error && filteredKasir.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <User className="mx-auto text-gray-400" size={48} />
            <p className="text-gray-500 mt-4">Tidak ada kasir ditemukan</p>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Kasir Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            onMouseDown={() => setIsModalOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
          >
            <motion.div
              onMouseDown={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingKasir ? "Edit Kasir" : "Tambah Kasir Baru"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Kasir
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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
                    ) : editingKasir ? (
                      "Simpan Perubahan"
                    ) : (
                      "Tambah Kasir"
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
        {isDeleteModalOpen && deleteKasir && (
          <motion.div
            onMouseDown={() => setIsDeleteModalOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
          >
            <motion.div
              onMouseDown={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  Hapus Kasir
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Apakah Anda yakin ingin menghapus kasir ini?
                </p>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="text-red-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {deleteKasir.nama}
                    </p>
                    <p className="text-sm text-gray-500">
                      {deleteKasir.email}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading === "deleting"}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-red-400 flex items-center justify-center gap-2"
                  >
                    {actionLoading === "deleting" ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Menghapus...
                      </>
                    ) : (
                      "Hapus"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KasirPage;