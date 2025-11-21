// src/pages/KasirPage.jsx
import React, { useState, useEffect, useCallback } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  User,
  Mail,
} from "lucide-react";
import axios from "axios";
import KasirTable from "../../components/kasir/KasirTable";

const API_URL = "http://localhost:8000/api";

const KasirPage = () => {
  const [kasirList, setKasirList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedKasir, setSelectedKasir] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
  });

  const token = localStorage.getItem("token");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

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
      setError("Gagal mengambil data kasir.");
      console.error("Error fetching kasir:", err);
    } finally {
      setLoading(false);
    }
  }, [token, cabangId]);

  useEffect(() => {
    fetchKasir();
  }, [fetchKasir]);

  const openModal = (kasir = null) => {
    setSelectedKasir(kasir);
    setFormData(
      kasir
        ? {
            nama: kasir.nama,
            email: kasir.email,
          }
        : {
            nama: "",
            email: "",
          }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedKasir(null);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    const apiData = {
      nama: formData.nama,
      email: formData.email,
      id_cabang: cabangId,
    };

    try {
      let res;
      if (selectedKasir) {
        res = await axios.put(
          `${API_URL}/kasir/${selectedKasir.id_user}`,
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
        fetchKasir();
        closeModal();
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        `Gagal ${selectedKasir ? "memperbarui" : "menambah"} kasir.`;
      showMessage("error", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openConfirmDelete = (kasir) => {
    setSelectedKasir(kasir);
    setIsConfirmOpen(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmOpen(false);
    setSelectedKasir(null);
  };

  const handleDelete = async () => {
    if (!selectedKasir) return;
    setIsSubmitting(true);
    try {
      const res = await axios.delete(
        `${API_URL}/kasir/${selectedKasir.id_user}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === "success") {
        showMessage("success", res.data.message);
        fetchKasir();
        closeConfirmDelete();
      }
      //eslint-disable-next-line no-unused-vars
    } catch (err) {
      showMessage("error", "Gagal menghapus kasir.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <RefreshCw className="animate-spin h-6 w-6 mr-3" />
          Memuat...
        </div>
      );

    if (error)
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertTriangle className="h-8 w-8 mb-2" />
          {error}
        </div>
      );

    return (
      <KasirTable
        kasirList={kasirList}
        onEdit={openModal}
        onDelete={openConfirmDelete}
      />
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
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Manajemen Kasir
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Kelola daftar kasir untuk cabang{" "}
              <strong>{cabang?.nama_cabang || "N/A"}</strong>
            </p>
          </div>
          <motion.button
            onClick={() => openModal()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold self-start sm:self-center"
          >
            <PlusCircle size={20} /> Tambah Kasir
          </motion.button>
        </div>

        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`fixed top-20 left-1/2 -translate-x-1/2 p-3 rounded-lg flex items-center gap-3 text-sm font-semibold shadow-lg z-50 ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message.type === "success" ? "✓" : "✗"} {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
          {renderContent()}
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            onMouseDown={closeModal}
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
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedKasir ? "Edit Kasir" : "Tambah Kasir Baru"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="inline w-4 h-4 mr-1" />
                      Nama Kasir
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 text-gray-900"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="inline w-4 h-4 mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 text-gray-900"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg hover:bg-gray-100"
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center w-36 px-6 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:bg-red-400 disabled:cursor-wait"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        {selectedKasir ? "Menyimpan..." : "Menambah..."}
                      </>
                    ) : selectedKasir ? (
                      "Simpan"
                    ) : (
                      "Tambah"
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
        {isConfirmOpen && (
          <motion.div
            onMouseDown={closeConfirmDelete}
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
              <AlertTriangle className="mx-auto text-red-500 h-12 w-12 mb-4" />
              <h2 className="text-lg font-bold text-gray-800">
                Konfirmasi Hapus
              </h2>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                Apakah Anda yakin ingin menghapus kasir <br />
                <strong>{selectedKasir?.nama}</strong>?
                <br />
                <span className="text-red-500">
                  Tindakan ini tidak dapat dibatalkan.
                </span>
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={closeConfirmDelete}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center w-28 px-6 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:bg-red-400 disabled:cursor-wait"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={16} />
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
};

export default KasirPage;
