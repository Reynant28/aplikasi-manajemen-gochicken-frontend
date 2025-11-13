import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Loader2, X, AlertTriangle, RefreshCw, Eye, Tag, Calendar, FileText, Plus, DollarSign } from "lucide-react";
import axios from 'axios';
import PengeluaranTable from '../../components/pengeluaran/PengeluaranTable'; // Reuse super admin table
import PengeluaranForm from '../../components/ui/Form/PengeluaranForm'; // Reuse super admin form
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const PengeluaranPage = () => {
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [bahanBakuList, setBahanBakuList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [modalState, setModalState] = useState({ type: null, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ details: [] });
  
  const token = localStorage.getItem("token");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const fetchData = useCallback(async () => {
    if (!cabangId) { 
      setError("Data cabang tidak ditemukan."); 
      setLoading(false); 
      return; 
    }
    
    setLoading(true); 
    setError(null);
    try {
      const [resPengeluaran, resJenis, resBahan, resCabang] = await Promise.all([
        axios.get(`${API_URL}/cabang/${cabangId}/pengeluaran`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/jenis-pengeluaran`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/bahan-baku`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/cabang`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      setPengeluaranList(resPengeluaran.data.data || []);
      setJenisList(resJenis.data.data || []);
      setBahanBakuList(resBahan.data.data || []);
      setCabangList(resCabang.data.data || []);
    } catch (err) { 
      console.error("Fetch error:", err);
      setError("Gagal mengambil data esensial."); 
    } finally { 
      setLoading(false); 
    }
  }, [token, cabangId]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const openModal = (type, data = null) => {
    setModalState({ type, data });
    if (type === 'add' || type === 'edit') {
      const initialDetails = data?.details?.map(d => ({
        id_bahan_baku: d.id_bahan_baku,
        jumlah_item: d.jumlah_item,
        harga_satuan: d.harga_satuan,
      })) || [];

      setFormData({
        id_jenis: data?.id_jenis || "",
        tanggal: data ? format(new Date(data.tanggal), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        keterangan: data?.keterangan || "",
        details: initialDetails,
        jumlah: data?.jumlah || 0,
      });
    }
  };

  const closeModal = () => setModalState({ type: null, data: null });

  const handleAddJenis = async (jenisPengeluaran) => {
    try {
      const res = await axios.post(`${API_URL}/jenis-pengeluaran`, { jenis_pengeluaran: jenisPengeluaran }, { headers: { Authorization: `Bearer ${token}` } });
      setJenisList(prev => [...prev, res.data.data]);
      setFormData(prev => ({...prev, id_jenis: res.data.data.id_jenis}));
      showMessage('success', 'Jenis pengeluaran baru berhasil ditambahkan!');
      return true;
    } catch (err) {
      showMessage('error', err.response?.data?.errors?.jenis_pengeluaran[0] || 'Gagal menambah jenis baru.');
      return false;
    }
  };

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      
      const finalPayload = {
        ...payload,
        id_cabang: cabangId // Ensure cabang ID is always set to current admin's cabang
      };

      const res = modalState.type === 'edit'
        ? await axios.put(`${API_URL}/pengeluaran/${modalState.data.id_pengeluaran}`, finalPayload, { headers: { Authorization: `Bearer ${token}` } })
        : await axios.post(`${API_URL}/pengeluaran`, finalPayload, { headers: { Authorization: `Bearer ${token}` } });
      
      showMessage('success', res.data.message);
      fetchData();
      closeModal();
    } catch (err) { 
      showMessage('error', err.response?.data?.message || "Terjadi kesalahan.");
    } finally { 
      setIsSubmitting(false); 
    }
  };
  
  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL}/pengeluaran/${modalState.data.id_pengeluaran}`, { headers: { Authorization: `Bearer ${token}` } });
      showMessage('success', 'Pengeluaran berhasil dihapus.');
      fetchData();
      closeModal();
    } catch(err) { 
      showMessage('error', 'Gagal menghapus data.');
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // Calculate total pengeluaran bulan ini
  const totalPengeluaran = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return pengeluaranList.reduce((sum, item) => {
      const itemDate = new Date(item.tanggal);
      if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
        return sum + (Number(item.jumlah) || 0);
      }
      return sum;
    }, 0);
  }, [pengeluaranList]);

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-md border border-gray-100">
        <RefreshCw className="animate-spin text-gray-400 mb-4" size={32} />
        <p className="text-gray-500">Memuat data pengeluaran...</p>
      </div>
    );
    
    if (error) return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
        <AlertTriangle className="h-8 w-8 mb-2" />
        {error}
      </div>
    );
    
    return (
      <PengeluaranTable 
        pengeluaranList={pengeluaranList} 
        onEdit={(d) => openModal('edit', d)} 
        onDelete={(d) => openModal('delete', d)} 
        onView={(d) => openModal('view', d)} 
      />
    );
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar{width:6px}
        .custom-scrollbar::-webkit-scrollbar-track{background:#f1f5f9;border-radius:10px}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}
        .custom-scrollbar::-webkit-scrollbar-thumb:hover{background:#94a3b8}
        .date-input-container input::-webkit-calendar-picker-indicator { opacity: 0; cursor: pointer; }
      `}</style>
      
      <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengeluaran</h1>
            <p className="text-gray-600">
              Kelola dan pantau semua pengeluaran untuk cabang <strong>{cabang?.nama_cabang || 'N/A'}</strong>
            </p>
          </div>
          
          {/* Add Button */}
          <motion.button 
            onClick={() => openModal('add')} 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 font-semibold"
          >
            <PlusCircle size={20} />
            Tambah Pengeluaran
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pengeluaran Bulan Ini</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{formatRupiah(totalPengeluaran)}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <DollarSign className="text-gray-700" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jumlah Transaksi</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{pengeluaranList.length}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <FileText className="text-gray-700" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jenis Pengeluaran</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{jenisList.length}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Tag className="text-gray-700" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        <AnimatePresence>
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: -20, scale: 0.9 }} 
              className={`fixed top-6 left-1/2 -translate-x-1/2 p-4 rounded-lg flex items-center gap-3 text-sm font-semibold shadow-lg z-50 ${
                message.type === "success" 
                  ? "bg-green-100 text-green-800 border border-green-200" 
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? "✓" : "✗"} {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          {renderContent()}
        </div>
      </motion.div>

      {/* Form Modal - Using Reusable PengeluaranForm Component */}
      <AnimatePresence>
        {(modalState.type === 'add' || modalState.type === 'edit') && (
          <motion.div 
            onMouseDown={closeModal}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              onMouseDown={e => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <PengeluaranForm 
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                loading={isSubmitting}
                isEditing={modalState.type === 'edit'}
                jenisList={jenisList}
                bahanBakuList={bahanBakuList}
                onAddJenis={handleAddJenis}
                onClose={closeModal}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <DetailModal 
        isOpen={modalState.type === 'view'} 
        onClose={closeModal} 
        data={modalState.data} 
      />

      {/* Delete Modal */}
      <DeleteModal 
        isOpen={modalState.type === 'delete'} 
        onClose={closeModal} 
        onConfirm={handleDelete} 
        data={modalState.data} 
        isSubmitting={isSubmitting} 
      />
    </>
  );
};

// Keep the existing DetailModal and DeleteModal components
const DetailModal = ({ isOpen, onClose, data }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div 
                onMouseDown={onClose} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
                <motion.div 
                    onMouseDown={e => e.stopPropagation()} 
                    initial={{ scale: 0.9, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9, y: 20 }} 
                    className="bg-white rounded-xl shadow-2xl w-full max-w-2xl"
                >
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Detail Pengeluaran</h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Tag size={14}/>
                                Jenis: <strong className="text-gray-800">{data?.jenis_pengeluaran?.jenis_pengeluaran}</strong>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar size={14}/>
                                Tanggal: <strong className="text-gray-800">
                                    {data?.tanggal ? format(new Date(data.tanggal), 'd MMMM yyyy', { locale: id }) : 'N/A'}
                                </strong>
                            </div>
                        </div>
                        <div>
                            <p className="flex items-center gap-2 text-sm text-gray-500">
                                <FileText size={14}/> Keterangan:
                            </p>
                            <p className="p-3 bg-gray-50 rounded-lg mt-1 text-gray-800">{data?.keterangan}</p>
                        </div>
                        
                        {data?.details && data.details.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-md font-semibold mb-3 text-gray-800">Rincian Pembelian Bahan Baku</h3>
                                <div className="border rounded-lg overflow-hidden bg-white">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-semibold text-gray-600">Bahan</th>
                                                <th className="px-4 py-2 text-center font-semibold text-gray-600">Jumlah</th>
                                                <th className="px-4 py-2 text-right font-semibold text-gray-600">Harga Satuan</th>
                                                <th className="px-4 py-2 text-right font-semibold text-gray-600">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.details.map(d => (
                                                <tr key={d.id_detail_pengeluaran} className="border-t border-gray-200">
                                                    <td className="px-4 py-2 text-gray-700">{d.bahan_baku?.nama_bahan || 'N/A'}</td>
                                                    <td className="px-4 py-2 text-center text-gray-700">{d.jumlah_item}</td>
                                                    <td className="px-4 py-2 text-right text-gray-700">{formatRupiah(d.harga_satuan)}</td>
                                                    <td className="px-4 py-2 text-right font-semibold text-gray-800">{formatRupiah(d.total_harga)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        
                        <div className="pt-4 text-right border-t border-gray-200">
                            <p className="text-gray-600">Total Pengeluaran</p>
                            <p className="text-3xl font-bold text-gray-700">{formatRupiah(data?.jumlah)}</p>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        >
                            Tutup
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const DeleteModal = ({ isOpen, onClose, onConfirm, data, isSubmitting }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div 
                onMouseDown={onClose} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
                <motion.div 
                    onMouseDown={e => e.stopPropagation()} 
                    initial={{ scale: 0.9, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9, y: 20 }} 
                    className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center"
                >
                    <AlertTriangle className="mx-auto text-red-500 h-12 w-12 mb-4" />
                    <h2 className="text-lg font-bold text-gray-800">Konfirmasi Hapus</h2>
                    <p className="text-sm text-gray-500 mt-2 mb-6">
                        Yakin ingin menghapus pengeluaran <strong>"{data?.keterangan}"</strong> senilai <strong>{formatRupiah(data?.jumlah)}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            disabled={isSubmitting}
                        >
                            Batal
                        </button>
                        <button 
                            onClick={onConfirm}
                            className="flex items-center justify-center min-w-[100px] px-6 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:bg-red-400 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : "Hapus"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default PengeluaranPage;