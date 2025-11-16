import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Loader2, Eye, Tag, Calendar, FileText, Plus, DollarSign } from "lucide-react";
import axios from 'axios';
import PengeluaranTable from '../../components/pengeluaran/PengeluaranTable.jsx';
import PengeluaranForm from '../../components/pengeluaran/PengeluaranForm.jsx';
import {
 ConfirmDeletePopup,
 SuccessPopup,
} from "../../components/ui";
import { format } from 'date-fns';
import DetailModal from '../../components/pengeluaran/PengeluaranDetail.jsx';

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const PengeluaranPage = () => {
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [bahanBakuList, setBahanBakuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [cabangList, setCabangList] = useState([]);

  const [modalState, setModalState] = useState({ type: null, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ details: [] });
  
  const token = localStorage.getItem("token");

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPengeluaran, resJenis, resBahan, resCabang] = await Promise.all([
        axios.get(`${API_URL}/pengeluaran`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/jenis-pengeluaran`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/bahan-baku`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/cabang`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setPengeluaranList(resPengeluaran.data.data || []);
      setJenisList(resJenis.data.data || []);
      setBahanBakuList(resBahan.data.data || []);
      setCabangList(resCabang.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data esensial.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
        id_cabang: data?.id_cabang || "",
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
      const res = modalState.type === 'edit'
        ? await axios.put(`${API_URL}/pengeluaran/${modalState.data.id_pengeluaran}`, payload, { headers: { Authorization: `Bearer ${token}` } })
        : await axios.post(`${API_URL}/pengeluaran`, payload, { headers: { Authorization: `Bearer ${token}` } });
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

  return (
    <>
      <motion.div className="p-6 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengeluaran</h1>
            <p className="text-gray-600">Kelola dan pantau semua pengeluaran cabang</p>
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

        {/* Error State */}
        {error && (
          <motion.div 
            className="p-5 bg-red-50 text-red-700 rounded-2xl border-2 border-red-200 flex items-start gap-3 shadow-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg mb-1">Terjadi Kesalahan</p>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-2xl">
              <div className="flex items-center text-gray-500">
                <Loader2 className="animate-spin h-6 w-6 mr-3" /> 
                Memuat...
              </div>
            </div>
          ) : (
            <PengeluaranTable 
              pengeluaranList={pengeluaranList} 
              onEdit={(d) => openModal('edit', d)} 
              onDelete={(d) => openModal('delete', d)} 
              onView={(d) => openModal('view', d)} 
            />
          )}
        </div>
      </motion.div>

      {/* Form Modal */}
      <AnimatePresence>
        {modalState.type === 'add' || modalState.type === 'edit' ? (
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
                cabangList={cabangList}
                onAddJenis={handleAddJenis}
                onClose={closeModal}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Detail Modal */}
      <DetailModal 
        isOpen={modalState.type === 'view'} 
        onClose={closeModal} 
        data={modalState.data} 
      />

      {/* Delete Modal */}
      <ConfirmDeletePopup
        isOpen={modalState.type === 'delete'}
        onClose={closeModal}
        onConfirm={handleDelete}
      />

      {/* Success Popup */}
      <SuccessPopup
        isOpen={!!message.text && message.type === 'success'}
        onClose={() => setMessage({ type: "", text: "" })}
        message={message.text}
      />
    </>
  );
};

export default PengeluaranPage;