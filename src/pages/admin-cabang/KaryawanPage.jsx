<<<<<<< Updated upstream
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Edit,
  Trash,
  CircleDollarSign,
  PlusCircle,
  User,
} from "lucide-react";

const KaryawanPage = () => {
  const [formData, setFormData] = useState({ nama: "", gaji: "" });
  const [karyawan, setKaryawan] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
=======
// src/pages/KaryawanPage.jsx
import React, { useState, useEffect, useCallback } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Loader2, X, AlertTriangle, RefreshCw } from "lucide-react";
import axios from 'axios';
import KaryawanTable from '../../components/karyawan/KaryawanTable';

const API_URL = "http://localhost:8000/api";

const KaryawanPage = () => {
  const [karyawanList, setKaryawanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
>>>>>>> Stashed changes

  const [formData, setFormData] = useState({
    nama_karyawan: "",
    alamat: "",
    telepon: "",
    gaji: ""
  });

  const token = localStorage.getItem("token");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang;

  // --- Data Fetching ---
  const fetchKaryawan = useCallback(async () => {
    if (!cabangId) { setError("Data cabang tidak ditemukan."); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${API_URL}/cabang/${cabangId}/karyawan`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 'success') {
        setKaryawanList(res.data.data || []);
      }
      //eslint-disable-next-line
    } catch (err) {
      setError("Gagal mengambil data karyawan.");
    } finally {
      setLoading(false);
    }
<<<<<<< Updated upstream
    setFormData({ nama: "", gaji: "" });
  };

  const handleEdit = (index) => {
    setFormData(karyawan[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    if (window.confirm("Yakin hapus data karyawan ini?")) {
      setKaryawan(karyawan.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Form Tambah / Edit */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-2xl overflow-hidden max-w-lg mx-auto"
      >
        {/* Header Card */}
        <div className="bg-green-600 p-4 flex items-center gap-2">
          <PlusCircle className="text-white" size={22} />
          <h2 className="text-lg font-bold text-white">
            {editingIndex !== null ? "Edit Karyawan" : "Tambah Karyawan"}
          </h2>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4">
          {/* Input Nama */}
          <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-500">
            <User className="text-gray-400 mr-2" size={18} />
            <input
              type="text"
              name="nama"
              placeholder="Nama Karyawan"
              value={formData.nama}
              onChange={handleChange}
              className="w-full outline-none text-gray-900 placeholder-gray-500"
              required
            />
          </div>

          {/* Input Gaji */}
          <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-500">
            <CircleDollarSign className="text-gray-400 mr-2" size={18} />
            <input
              type="number"
              name="gaji"
              placeholder="Masukkan Gaji"
              value={formData.gaji}
              onChange={handleChange}
              className="w-full outline-none text-gray-900 placeholder-gray-500"
              required
            />
          </div>

          {/* Tombol Submit */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition font-semibold shadow-md"
          >
            {editingIndex !== null ? "Update" : "Simpan"}
          </motion.button>
        </div>
      </motion.div>

      {/* List Karyawan */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-green-700">
          Daftar Karyawan
        </h3>
        {karyawan.length === 0 ? (
          <p className="text-gray-500 italic">Belum ada data.</p>
        ) : (
          <div className="space-y-4">
            {karyawan.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition"
              >
                {/* Info Karyawan */}
                <div>
                  <p className="text-gray-900 font-semibold">{item.nama}</p>
                  <p className="text-green-700 font-bold flex items-center gap-1">
                    <CircleDollarSign size={18} /> Rp{" "}
                    {parseInt(item.gaji).toLocaleString()}
                  </p>
                </div>

                {/* Aksi di kanan */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                  >
                    <Trash size={16} /> Hapus
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
=======
  }, [token, cabangId]);

  useEffect(() => {
    fetchKaryawan();
  }, [fetchKaryawan]);
  
  // --- Modal & Form Handlers ---
  const openModal = (karyawan = null) => {
    setSelectedKaryawan(karyawan);
    setFormData(karyawan ? {
      nama_karyawan: karyawan.nama_karyawan,
      alamat: karyawan.alamat,
      telepon: karyawan.telepon,
      gaji: karyawan.gaji,
    } : { nama_karyawan: "", alamat: "", telepon: "", gaji: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedKaryawan(null);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsSubmitting(true); 
    const apiData = { ...formData, id_cabang: cabangId };

    try {
      let res;
      if (selectedKaryawan) {
        res = await axios.put(`${API_URL}/karyawan/${selectedKaryawan.id_karyawan}`, apiData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        res = await axios.post(`${API_URL}/karyawan`, apiData, { headers: { Authorization: `Bearer ${token}` } });
      }
      if (res.data.status === 'success') {
        setMessage({ type: 'success', text: res.data.message });
        fetchKaryawan();
        closeModal();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || `Gagal ${selectedKaryawan ? 'memperbarui' : 'menambah'} karyawan.`;
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete Handlers ---
  const openConfirmDelete = (karyawan) => {
    setSelectedKaryawan(karyawan);
    setIsConfirmOpen(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmOpen(false);
    setSelectedKaryawan(null);
  };

  const handleDelete = async () => {
    if (!selectedKaryawan) return;
    setIsSubmitting(true);
    try {
      const res = await axios.delete(`${API_URL}/karyawan/${selectedKaryawan.id_karyawan}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 'success') {
        setMessage({ type: 'success', text: res.data.message });
        fetchKaryawan();
        closeConfirmDelete();
      }
      //eslint-disable-next-line  
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menghapus karyawan.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center h-64 text-gray-500"><RefreshCw className="animate-spin h-6 w-6 mr-3" /> Memuat...</div>;
    if (error) return <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 p-4 rounded-lg"><AlertTriangle className="h-8 w-8 mb-2" />{error}</div>;
    return <KaryawanTable karyawanList={karyawanList} onEdit={openModal} onDelete={openConfirmDelete} />;
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
      <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Karyawan</h1>
            <p className="text-gray-500">Kelola daftar karyawan untuk cabang <strong>{cabang?.nama_cabang || 'N/A'}</strong></p>
          </div>
          <motion.button 
            onClick={() => openModal()} 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
          >
            <PlusCircle size={20} /> Tambah Karyawan
          </motion.button>
        </div>

        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-lg flex items-center gap-3 text-sm font-semibold ${ message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800" }`}>
            {message.type === "success" ? "✓" : "✗"} {message.text}
          </motion.div>
        )}

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">{renderContent()}</div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div onClick={closeModal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">{selectedKaryawan ? "Edit Karyawan" : "Tambah Karyawan Baru"}</h2>
                <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Karyawan</label>
                        <input type="text" name="nama_karyawan" value={formData.nama_karyawan} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 text-gray-900" required disabled={isSubmitting} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                        <input type="text" name="telepon" value={formData.telepon} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 text-gray-900" required disabled={isSubmitting} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 text-gray-900" required disabled={isSubmitting}></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gaji (Rp)</label>
                    <input type="number" name="gaji" value={formData.gaji} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 text-gray-900" required disabled={isSubmitting} />
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg hover:bg-gray-100" disabled={isSubmitting}>Batal</button>
                  <button type="submit" className="flex items-center justify-center w-36 px-6 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:bg-green-400 disabled:cursor-wait" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <><Loader2 className="animate-spin mr-2" size={16}/> {selectedKaryawan ? 'Menyimpan...' : 'Menambah...'}</>
                    ) : (
                        selectedKaryawan ? "Simpan" : "Tambah"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {isConfirmOpen && (
          <motion.div onClick={closeConfirmDelete} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
              <AlertTriangle className="mx-auto text-red-500 h-12 w-12 mb-4" />
              <h2 className="text-lg font-bold text-gray-800">Konfirmasi Hapus</h2>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                Apakah Anda yakin ingin menghapus karyawan <br/><strong>{selectedKaryawan?.nama_karyawan}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={closeConfirmDelete} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg hover:bg-gray-100" disabled={isSubmitting}>Batal</button>
                <button onClick={handleDelete} className="flex items-center justify-center w-28 px-6 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:bg-red-400 disabled:cursor-wait" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : "Hapus"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
>>>>>>> Stashed changes
  );
};

export default KaryawanPage;

