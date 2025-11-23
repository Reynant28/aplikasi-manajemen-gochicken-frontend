import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Loader2, Tag, Calendar, FileText, DollarSign, AlertTriangle, Search, ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from "lucide-react";
import axios from 'axios';
import {
  ConfirmDeletePopup,
  SuccessPopup,
  DataTable
} from "../../components/ui";
import PengeluaranForm from '../../components/pengeluaran/PengeluaranForm.jsx';
import DetailModal from '../../components/pengeluaran/PengeluaranDetail.jsx';
import { format } from 'date-fns';
import { id } from 'date-fns/locale'; 

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
  
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const token = localStorage.getItem("token");
  const role = JSON.parse(localStorage.getItem("user"))?.role || "";

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
      if (err.code === 'ECONNABORTED') {
      setError("Request timeout. Silakan coba lagi.");
    } else {
      setError("Gagal mengambil data esensial.");
    }
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

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!pengeluaranList) return [];
    
    const filtered = pengeluaranList.filter(p =>
      p.keterangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jenis_pengeluaran?.jenis_pengeluaran?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cabang?.nama_cabang?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sorting: tanggal terbaru di atas
    return filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  }, [pengeluaranList, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(2, currentPage - Math.floor((maxPagesToShow - 3) / 2));
      const endPage = Math.min(totalPages - 1, currentPage + Math.ceil((maxPagesToShow - 3) / 2));

      pages.push(1);
      if (startPage > 2) pages.push("...");
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < totalPages - 1) pages.push("...");
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages.filter((value, index, self) => self.indexOf(value) === index);
  };

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Define columns configuration
  const pengeluaranColumns = [
    { 
      key: 'transaction', 
      header: 'Transaksi',
      render: (item) => (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="p-2 bg-gray-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {item.jenis_pengeluaran?.jenis_pengeluaran || "N/A"}
            </p>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {item.keterangan}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 lg:hidden">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {format(new Date(item.tanggal), 'd MMM yyyy', { locale: id })}
              </span>
            </div>
          </div>
        </div>
      )
    },
    ...(role === "super admin" ? [{
      key: 'cabang',
      header: 'Cabang',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-100 rounded">
            <Tag className="h-3 w-3 text-gray-600" />
          </div>
          <span className="text-sm text-gray-700 font-medium">
            {item.cabang?.nama_cabang || "-"}
          </span>
        </div>
      )
    }] : []),
    {
      key: 'tanggal',
      header: 'Tanggal',
      render: (item) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={14} />
          {format(new Date(item.tanggal), 'EEEE, d MMM yyyy', { locale: id })}
        </div>
      )
    },
    {
      key: 'jumlah',
      header: 'Jumlah',
      align: 'right',
      render: (item) => (
        <span className="text-sm font-bold text-gray-900">
          {formatRupiah(item.jumlah)}
        </span>
      )
    }
  ];

  // Define action buttons
  const renderAction = (item) => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => openModal('view', item)}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        title="Lihat Detail"
      >
        <Eye size={16} />
      </button>
      
      <button
        onClick={() => openModal('edit', item)}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        title="Edit"
      >
        <Edit size={16} />
      </button>
      
      <button
        onClick={() => openModal('delete', item)}
        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
        title="Hapus"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

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
                <p className="text-sm font-medium text-gray-600">Jumlah Pengeluaran</p>
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

        {/* Search and Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-md border border-gray-100">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pengeluaran..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition text-gray-900 placeholder:text-gray-400 text-sm"
            />
          </div>

          {/* Data Info */}
          <div className="text-sm text-gray-600">
            Menampilkan {indexOfFirst + 1}-{Math.min(indexOfLast, filteredData.length)} dari {filteredData.length} pengeluaran
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, i) => (
                  <button
                    key={i}
                    onClick={() => typeof page === "number" && changePage(page)}
                    disabled={page === "..."}
                    className={`min-w-[36px] px-3 py-2 text-sm font-medium rounded-lg transition ${
                      currentPage === page
                        ? "bg-gray-700 text-white"
                        : page === "..."
                        ? "text-gray-400 cursor-default"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Main Content - Using Reusable DataTable */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-2xl">
              <div className="flex items-center text-gray-500">
                <Loader2 className="animate-spin h-6 w-6 mr-3" /> 
                Memuat...
              </div>
            </div>
          ) : (
            <DataTable
              data={currentData}
              columns={pengeluaranColumns}
              loading={loading}
              emptyMessage="Tidak ada data pengeluaran"
              emptyDescription={searchTerm ? 'Coba ubah kata kunci pencarian' : 'Mulai dengan menambahkan pengeluaran baru'}
              onRowAction={renderAction}
              showActions={true}
              actionLabel="Aksi"
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