// src/pages/PemesananPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Loader2, X, AlertTriangle, RefreshCw, Eye, Edit, Trash2 } from "lucide-react";
import axios from 'axios';

import { SuccessPopup, ConfirmDeletePopup } from "../../components/ui";
import DataTable from "../../components/ui/DataTable"; // Import the DataTable
import PemesananFilter from "../../components/pemesanan/PemesananFilter";
import PemesananForm from "../../components/pemesanan/PemesananForm";
import PemesananChangeStatus from "../../components/pemesanan/PemesananChangeStatus";
import PemesananDetail from "../../components/pemesanan/PemesananDetail";

import Pagination from '../../components/reports/Pagination';
import { format } from 'date-fns';

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { 
  style: "currency", 
  currency: "IDR", 
  maximumFractionDigits: 0 
}).format(value);

const getStatusBadge = (status) => {
  const statusConfig = {
    'OnLoan': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
    'Selesai': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Selesai' },
    'dibatalkan': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Dibatalkan' }
  };
  
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
};

const PemesananPage = () => {
  const [pemesananData, setPemesananData] = useState(null);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditStatusModalOpen, setIsEditStatusModalOpen] = useState(false);
  const [selectedPemesanan, setSelectedPemesanan] = useState(null);

  // Popup states
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [filter, setFilter] = useState({ time: 'bulan', status: 'semua' });
  const [customDate, setCustomDate] = useState([null, null]);
  
  const token = localStorage.getItem("token");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang;

  const fetchData = useCallback(async (page = 1) => {
    if (!cabangId) { 
      setError("Data cabang tidak ditemukan."); 
      setLoading(false); 
      return; 
    }
    
    setLoading(true); 
    setError(null);
    
    let params = { page, status: filter.status };
    const [startDate, endDate] = customDate;
    
    if (filter.time === 'custom' && startDate && endDate) {
      params.start_date = format(new Date(startDate), 'yyyy-MM-dd');
      params.end_date = format(new Date(endDate), 'yyyy-MM-dd');
    } else if (filter.time !== 'custom') {
      params.filter = filter.time;
    }

    try {
      const [resPemesanan, resProduk] = await Promise.all([
        axios.get(`${API_URL}/cabang/${cabangId}/pemesanan`, { 
          headers: { Authorization: `Bearer ${token}` }, 
          params 
        }),
        axios.get(`${API_URL}/cabang/${cabangId}/produk`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
      ]);
      setPemesananData(resPemesanan.data);
      setProdukList(resProduk.data.data || []);
    } catch (err) { 
      setError("Gagal mengambil data."); 
    } finally { 
      setLoading(false); 
    }
  }, [token, cabangId, filter, customDate]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // Modal handlers
  const handleAddPemesanan = () => {
    setIsAddModalOpen(true);
  };

  const handleViewDetail = (pemesanan) => {
    setSelectedPemesanan(pemesanan);
    setIsDetailModalOpen(true);
  };

  const handleEditStatus = (pemesanan) => {
    setSelectedPemesanan(pemesanan);
    setIsEditStatusModalOpen(true);
  };

  const confirmDelete = (pemesanan) => {
    setDeleteId(pemesanan.id_transaksi);
    setSelectedPemesanan(pemesanan);
    setShowConfirm(true);
  };

  const closeAllModals = () => {
    setIsAddModalOpen(false);
    setIsDetailModalOpen(false);
    setIsEditStatusModalOpen(false);
    setSelectedPemesanan(null);
  };

  // Action handlers
  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/pemesanan`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setSuccessMessage(res.data.message || "Pesanan berhasil dibuat!");
      setShowSuccess(true);
      fetchData(pemesananData?.current_page || 1);
      closeAllModals();
    } catch(err) {
      setSuccessMessage(err.response?.data?.message || "Gagal membuat pesanan.");
      setShowSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    setIsSubmitting(true);
    try {
      const res = await axios.put(
        `${API_URL}/pemesanan/${selectedPemesanan.id_transaksi}`, 
        { status_transaksi: status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(res.data.message || "Status berhasil diupdate!");
      setShowSuccess(true);
      fetchData(pemesananData?.current_page || 1);
      closeAllModals();
    } catch(err) {
      setSuccessMessage('Gagal mengupdate status.');
      setShowSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setShowConfirm(false);
    if (!deleteId) return;

    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL}/pemesanan/${deleteId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setSuccessMessage('Pemesanan berhasil dihapus.');
      setShowSuccess(true);
      fetchData(pemesananData?.current_page || 1);
    } catch(err) {
      setSuccessMessage('Gagal menghapus pesanan.');
      setShowSuccess(true);
    } finally {
      setIsSubmitting(false);
      setDeleteId(null);
      setSelectedPemesanan(null);
    }
  };

  // Define columns for DataTable
  const columns = [
    {
      key: 'kode_transaksi',
      header: 'Kode Transaksi',
      bold: true,
      width: '15%'
    },
    {
      key: 'nama_pelanggan',
      header: 'Pelanggan',
      width: '20%'
    },
    {
      key: 'total_harga',
      header: 'Total Harga',
      align: 'right',
      width: '15%',
      render: (item) => formatRupiah(item.total_harga)
    },
    {
      key: 'tanggal_waktu',
      header: 'Tanggal',
      width: '15%',
      render: (item) => new Date(item.tanggal_waktu).toLocaleDateString('id-ID')
    },
    {
      key: 'status_transaksi',
      header: 'Status',
      align: 'center',
      width: '15%',
      render: (item) => getStatusBadge(item.status_transaksi)
    }
  ];

  // Action buttons for each row
  const renderRowActions = (item) => (
    <div className="flex items-center justify-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleViewDetail(item)}
        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        title="Lihat Detail"
      >
        <Eye size={16} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleEditStatus(item)}
        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
        title="Ubah Status"
      >
        <Edit size={16} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => confirmDelete(item)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Hapus Pesanan"
      >
        <Trash2 size={16} />
      </motion.button>
    </div>
  );

  const renderContent = () => {
    if (loading) return (
      <DataTable 
        loading={true}
        columns={columns}
        showActions={true}
        onRowAction={renderRowActions}
      />
    );
    
    if (error) return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
        <AlertTriangle className="h-8 w-8 mb-2" />
        {error}
      </div>
    );
    
    return (
      <DataTable 
        data={pemesananData?.data || []}
        columns={columns}
        showActions={true}
        onRowAction={renderRowActions}
        emptyMessage="Belum ada pemesanan"
        emptyDescription="Tidak ada data pemesanan untuk ditampilkan"
      />
    );
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar{width:6px}
        .custom-scrollbar::-webkit-scrollbar-track{background:#f8fafc;border-radius:10px}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}
        .custom-scrollbar::-webkit-scrollbar-thumb:hover{background:#94a3b8}
      `}</style>
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Pemesanan</h1>
            <p className="text-gray-500 mt-1">
              Kelola pesanan pelanggan khusus untuk cabang{" "}
              <strong className="text-gray-800">{cabang?.nama_cabang || 'N/A'}</strong>
            </p>
          </motion.div>
          
          <motion.button 
            onClick={handleAddPemesanan}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 bg-gray-700 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-md font-semibold self-start md:self-center"
          >
            <PlusCircle size={20} /> 
            Buat Pesanan Baru
          </motion.button>
        </div>

        {/* Filter Section */}
        <PemesananFilter 
          filter={filter}
          setFilter={setFilter}
          customDate={customDate}
          setCustomDate={setCustomDate}
        />

        {/* Table Section */}
        {renderContent()}


        {/* Pagination */}
        {pemesananData && pemesananData.total > pemesananData.per_page && (
          <Pagination 
            currentPage={pemesananData.current_page} 
            totalPages={pemesananData.last_page} 
            onPageChange={fetchData} 
          />
        )}
      </div>

      {/* Modal Components */}
      <PemesananForm 
        isOpen={isAddModalOpen} 
        onClose={closeAllModals} 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        produkList={produkList} 
        cabangId={cabangId} 
      />
      
      <PemesananDetail 
        isOpen={isDetailModalOpen} 
        onClose={closeAllModals} 
        data={selectedPemesanan} 
      />
      
      <PemesananChangeStatus 
        isOpen={isEditStatusModalOpen} 
        onClose={closeAllModals} 
        onConfirm={handleUpdateStatus} 
        data={selectedPemesanan} 
        isSubmitting={isSubmitting} 
      />

      {/* Delete Confirmation Popup */}
      <ConfirmDeletePopup
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setDeleteId(null);
          setSelectedPemesanan(null);
        }}
        onConfirm={handleDelete}
        title="Hapus Pemesanan?"
        message={
          selectedPemesanan ? 
          `Yakin ingin menghapus pesanan "${selectedPemesanan.kode_transaksi}"? Stok produk akan dikembalikan.` 
          : "Yakin ingin menghapus pesanan ini?"
        }
      />

      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Berhasil! 🎉"
        message={successMessage}
      />
    </>
  );
};

export default PemesananPage;