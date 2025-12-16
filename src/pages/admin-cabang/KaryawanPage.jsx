// src/pages/KaryawanPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Loader2, X, AlertTriangle, RefreshCw } from "lucide-react";
import axios from 'axios';
import KaryawanTable from '../../components/karyawan/KaryawanTable';
import { useNotification } from "../../components/context/NotificationContext"; // Import notification context

const API_URL = "http://localhost:8000/api";

const KaryawanPage = () => {
  const [karyawanList, setKaryawanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Hapus state message lokal, gunakan notification context
  const { addNotification } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nama_karyawan: "",
    alamat: "",
    telepon: "",
    gaji: ""
  });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           

  const token = localStorage.getItem("token");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang;

  // Get theme colors based on user role
  const getThemeColors = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.role === 'super admin') {
      return {
        primary: 'bg-orange-600 hover:bg-orange-700',
        primaryLight: 'bg-orange-100',
        primaryText: 'text-orange-700',
        primaryBorder: 'border-orange-200',
        ring: 'focus:ring-orange-500',
        gradient: 'from-orange-50 to-white'
      };
    }
    return {
      primary: 'bg-red-600 hover:bg-red-700',
      primaryLight: 'bg-red-100',
      primaryText: 'text-red-700',
      primaryBorder: 'border-red-200',
      ring: 'focus:ring-red-500',
      gradient: 'from-red-50 to-white'
    };
  };

  const theme = getThemeColors();

  // --- Data Fetching ---
  const fetchKaryawan = useCallback(async () => {
    if (!cabangId) { 
      setError("Data cabang tidak ditemukan."); 
      setLoading(false); 
      return; 
    }
    setLoading(true); 
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/cabang/${cabangId}/karyawan`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.data.status === 'success') {
        setKaryawanList(res.data.data || []);
      }
    } catch (err) {
      const errorMsg = "Gagal mengambil data karyawan.";
      setError(errorMsg);
      addNotification(
        errorMsg,
        "error",
        "Karyawan",
        "fetch"
      );
    } finally {
      setLoading(false);
    }
  }, [token, cabangId, addNotification]);

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
    setIsSubmitting(true); 
    const apiData = { ...formData, id_cabang: cabangId };

    try {
      let res;
      if (selectedKaryawan) {
        res = await axios.put(`${API_URL}/karyawan/${selectedKaryawan.id_karyawan}`, apiData, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      } else {
        res = await axios.post(`${API_URL}/karyawan`, apiData, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      }
      if (res.data.status === 'success') {
        // Gunakan notification context untuk success message
        addNotification(
          res.data.message || `Berhasil ${selectedKaryawan ? 'memperbarui' : 'menambah'} karyawan.`,
          "success",
          "Karyawan",
          selectedKaryawan ? "update" : "create"
        );
        fetchKaryawan();
        closeModal();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || `Gagal ${selectedKaryawan ? 'memperbarui' : 'menambah'} karyawan.`;
      // Gunakan notification context untuk error message
      addNotification(
        errorMsg,
        "error",
        "Karyawan",
        selectedKaryawan ? "update" : "create"
      );
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
      const res = await axios.delete(`${API_URL}/karyawan/${selectedKaryawan.id_karyawan}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.data.status === 'success') {
        // Gunakan notification context untuk success message
        addNotification(
          res.data.message || `Berhasil menghapus karyawan ${selectedKaryawan.nama_karyawan}.`,
          "info",
          "Karyawan",
          "delete"
        );
        fetchKaryawan();
        closeConfirmDelete();
      }
    } catch (err) {
      // Gunakan notification context untuk error message
      addNotification(
        "Gagal menghapus karyawan.",
        "error",
        "Karyawan",
        "delete"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <RefreshCw className="h-8 w-8" />
          </motion.div>
          <p className="text-lg font-medium">Memuat data karyawan...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 p-6 rounded-xl border border-red-200">
          <AlertTriangle className="h-12 w-12 mb-3" />
          <p className="text-lg font-semibold mb-2">Terjadi Kesalahan</p>
          <p className="text-center text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchKaryawan}
            className={`px-4 py-2 ${theme.primary} text-white rounded-lg flex items-center gap-2`}
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      );
    }
    
    return (
      <KaryawanTable 
        karyawanList={karyawanList} 
        onEdit={openModal} 
        onDelete={openConfirmDelete} 
        theme={theme}
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
        className={`p-6 min-h-screen bg-gradient-to-br ${theme.gradient}`}
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section - Simplified like other pages */}
          <motion.div 
            className="flex flex-col md:flex-row justify-between md:items-center gap-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Manajemen Karyawan</h1>
              <p className="text-gray-600 mt-1">
                Kelola daftar karyawan untuk <span className={`font-semibold ${theme.primaryText}`}>{cabang?.nama_cabang || 'N/A'}</span>
              </p>
            </div>
            
            <motion.button 
              onClick={() => openModal()} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center gap-2 ${theme.primary} text-white px-5 py-2.5 rounded-lg shadow hover:shadow-md transition-all duration-300 font-semibold`}
            >
              <PlusCircle size={20} />
              Tambah Karyawan
            </motion.button>
          </motion.div>

          {/* HAPUS Message Alert lokal karena sudah menggunakan notification context */}

          {/* Main Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {renderContent()}
          </motion.div>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedKaryawan ? "Edit Karyawan" : "Tambah Karyawan Baru"}
                  </h2>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Karyawan
                    </label>
                    <input 
                      type="text" 
                      name="nama_karyawan" 
                      value={formData.nama_karyawan} 
                      onChange={handleChange} 
                      className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:outline-none text-gray-900 ${theme.ring} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      required 
                      disabled={isSubmitting} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telepon
                    </label>
                    <input 
                      type="text" 
                      name="telepon" 
                      value={formData.telepon} 
                      onChange={handleChange} 
                      className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:outline-none text-gray-900 ${theme.ring} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      required 
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <textarea 
                    name="alamat" 
                    value={formData.alamat} 
                    onChange={handleChange} 
                    rows="3" 
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:outline-none text-gray-900 ${theme.ring} disabled:bg-gray-100 disabled:cursor-not-allowed resize-none`}
                    required 
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gaji (Rp)
                  </label>
                  <input 
                    type="number" 
                    name="gaji" 
                    value={formData.gaji} 
                    onChange={handleChange} 
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:outline-none text-gray-900 ${theme.ring} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    required 
                    disabled={isSubmitting}
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition ${theme.primary} disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={16}/>
                        {selectedKaryawan ? 'Menyimpan...' : 'Menambah...'}
                      </>
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
          <motion.div 
            onClick={closeConfirmDelete}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              
              <h2 className="text-lg font-bold text-gray-800 mb-2">Hapus Karyawan</h2>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus <strong>{selectedKaryawan?.nama_karyawan}</strong>? 
              </p>
              
              <div className="flex justify-center gap-3">
                <button 
                  onClick={closeConfirmDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:bg-red-400 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={16}/>
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

export default KaryawanPage;