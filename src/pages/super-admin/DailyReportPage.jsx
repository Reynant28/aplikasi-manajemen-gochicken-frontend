import React, { useEffect, useState } from "react";
import axios from "axios";
//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { 
  Loader2, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  XCircle, 
  Info, 
  Building2, 
  Calendar, 
  Trash2, 
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  Wallet
} from "lucide-react";

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value = 0) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

  //eslint-disable-next-line no-unused-vars
const DashboardCard = ({ title, value, icon, color = "gray" }) => {
  const getIcon = () => {
    switch (icon) {
      case 'penjualan':
        return <TrendingUp className="w-6 h-6 text-red-500" />;
      case 'modal':
        return <Package className="w-6 h-6 text-blue-500" />;
      case 'pengeluaran':
        return <TrendingDown className="w-6 h-6 text-orange-500" />;
      case 'laba':
        return <DollarSign className="w-6 h-6 text-green-500" />;
      case 'nett':
        return <Wallet className="w-6 h-6 text-purple-500" />;
      default:
        return <DollarSign className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Ya, Konfirmasi", 
  cancelText = "Batal", 
  type = "confirm",
  loading = false 
}) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      onMouseDown={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <motion.div
        onMouseDown={e => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              type === 'delete' ? 'bg-red-100' : 'bg-red-100'
            }`}>
              {type === 'delete' ? (
                <Trash2 className="w-5 h-5 text-red-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
          
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-2 px-4 text-sm font-medium text-white rounded-lg transition-colors flex items-center justify-center ${
                type === 'delete' 
                  ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-400' 
                  : 'bg-red-500 hover:bg-red-600 disabled:bg-red-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <motion.div 
      onMouseDown={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <motion.div
        onMouseDown={e => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">Detail Transaksi</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-1">Kode: {order.kode_transaksi}</p>
        </div>
        
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Tanggal & Waktu</p>
              <p className="text-gray-800">{new Date(order.tanggal_waktu).toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                order.status_transaksi === 'Selesai' 
                  ? 'bg-green-100 text-green-800'
                  : order.status_transaksi === 'Onloan'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {order.status_transaksi}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Metode Pembayaran</p>
              <p className="text-gray-800">{order.metode_pembayaran}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-gray-800 font-semibold">{formatRupiah(order.total_harga)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Cabang</p>
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-gray-400" />
                <span className="text-gray-800">{order.nama_cabang}</span>
              </div>
            </div>
          </div>
          
          {order.nama_pelanggan && (
            <div>
              <p className="text-sm font-medium text-gray-500">Nama Pelanggan</p>
              <p className="text-gray-800">{order.nama_pelanggan}</p>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const KeteranganModal = ({ isOpen, onClose, keterangan, title = "Keterangan Pengeluaran" }) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      onMouseDown={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <motion.div
        onMouseDown={e => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 max-h-60 overflow-y-auto">
          <p className="text-gray-700 whitespace-pre-wrap">
            {keterangan || "Tidak ada keterangan"}
          </p>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DeleteInfoModal = ({ isOpen, onClose, onDeleteAnyway, loading = false }) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      onMouseDown={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <motion.div
        onMouseDown={e => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Pengeluaran Aktif</h3>
          </div>
          
          <p className="text-gray-600 mb-2">
            Pengeluaran ini masih aktif dan memiliki cicilan harian.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Untuk menghapus pengeluaran, status harus "Selesai" (cicilan harian = 0).
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={onDeleteAnyway}
              disabled={loading}
              className="flex-1 py-2 px-4 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Hapus Anyway"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DailyReportPage = () => {
  const [data, setData] = useState(null);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cabangList, setCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState('all');
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, order: null, action: '' });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, order: null });
  const [keteranganModal, setKeteranganModal] = useState({ isOpen: false, keterangan: '', title: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, pengeluaran: null, loading: false });
  const [deleteInfoModal, setDeleteInfoModal] = useState({ isOpen: false, pengeluaran: null, loading: false });

  const fetchReport = async (date) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }

      const [reportRes, cabangRes] = await Promise.all([
        axios.get(`${API_URL}/report/harian`, {
          params: { tanggal: date },
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }),
        axios.get(`${API_URL}/cabang`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setData(reportRes.data);
      setCabangList(cabangRes.data.data || []);
    } catch (err) {
      console.error("Error fetching report:", err);
      
      if (err.response) {
        setError(err.response.data.message || "Gagal memuat laporan harian.");
      } else if (err.request) {
        setError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
      } else {
        setError("Terjadi kesalahan: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(tanggal);
  }, [tanggal]);

  const handleRefresh = () => {
    fetchReport(tanggal);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/report/update-status/${orderId}`,
        { status_transaksi: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchReport(tanggal);
      setConfirmationModal({ isOpen: false, order: null, action: '' });
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Gagal memperbarui status transaksi.");
    }
  };

  const handleDeletePengeluaran = async (pengeluaranId) => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/pengeluaran/${pengeluaranId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchReport(tanggal);
      setDeleteModal({ isOpen: false, pengeluaran: null, loading: false });
    } catch (error) {
      console.error("Error deleting pengeluaran:", error);
      setError("Gagal menghapus pengeluaran.");
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteAnyway = async (pengeluaranId) => {
    setDeleteInfoModal(prev => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/pengeluaran/${pengeluaranId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchReport(tanggal);
      setDeleteInfoModal({ isOpen: false, pengeluaran: null, loading: false });
    } catch (error) {
      console.error("Error deleting pengeluaran:", error);
      setError("Gagal menghapus pengeluaran.");
      setDeleteInfoModal(prev => ({ ...prev, loading: false }));
    }
  };

  //eslint-disable-next-line no-unused-vars
  const openConfirmationModal = (order, action) => {
    setConfirmationModal({ isOpen: true, order, action });
  };

  //eslint-disable-next-line no-unused-vars
  const openDetailsModal = (order) => {
    setDetailsModal({ isOpen: true, order });
  };

  const openKeteranganModal = (keterangan, title = "Keterangan Pengeluaran") => {
    setKeteranganModal({ isOpen: true, keterangan, title });
  };

  const openDeleteModal = (pengeluaran) => {
    const aktif = pengeluaran.cicilan_harian > 0;
    if (aktif) {
      setDeleteInfoModal({ isOpen: true, pengeluaran, loading: false });
    } else {
      setDeleteModal({ isOpen: true, pengeluaran, loading: false });
    }
  };

  const filteredPenjualan = data?.penjualan?.detail?.filter(item => 
    selectedCabang === 'all' || item.nama_cabang === selectedCabang
  ) || [];

  const filteredPengeluaran = data?.pengeluaran?.detail?.filter(item => 
    selectedCabang === 'all' || item.nama_cabang === selectedCabang
  ) || [];

  return (
    <>
      {/* Modals - Rendered outside main container */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, order: null, action: '' })}
        onConfirm={() => handleStatusUpdate(confirmationModal.order.id_transaksi, confirmationModal.action)}
        title="Konfirmasi Perubahan Status"
        message={`Apakah Anda yakin ingin mengubah status transaksi ${confirmationModal.order?.kode_transaksi} menjadi "${confirmationModal.action}"?`}
        confirmText="Ya, Ubah Status"
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, pengeluaran: null, loading: false })}
        onConfirm={() => handleDeletePengeluaran(deleteModal.pengeluaran?.id_pengeluaran)}
        title="Hapus Pengeluaran"
        message={`Apakah Anda yakin ingin menghapus pengeluaran "${deleteModal.pengeluaran?.jenis}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        type="delete"
        loading={deleteModal.loading}
      />

      <DeleteInfoModal
        isOpen={deleteInfoModal.isOpen}
        onClose={() => setDeleteInfoModal({ isOpen: false, pengeluaran: null, loading: false })}
        onDeleteAnyway={() => handleDeleteAnyway(deleteInfoModal.pengeluaran?.id_pengeluaran)}
        loading={deleteInfoModal.loading}
      />

      <OrderDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, order: null })}
        order={detailsModal.order}
      />

      <KeteranganModal
        isOpen={keteranganModal.isOpen}
        onClose={() => setKeteranganModal({ isOpen: false, keterangan: '', title: '' })}
        keterangan={keteranganModal.keterangan}
        title={keteranganModal.title}
      />

      {/* Main Content */}
      <motion.div
        className="space-y-6 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Laporan Harian</h1>
          <p className="text-gray-500 text-sm sm:text-base">Ringkasan penjualan, bahan baku, dan pengeluaran harian.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 self-start md:self-center">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="pl-10 border border-gray-300 text-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            />
          </div>
          
          <div className="relative w-full sm:w-48">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select 
                value={selectedCabang} 
                onChange={(e) => setSelectedCabang(e.target.value)}
                className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 appearance-none bg-white pr-10"
              >
                <option value="all">Semua Cabang</option>
                {cabangList.map((cabang) => (
                  <option key={cabang.id_cabang} value={cabang.nama_cabang}>
                    {cabang.nama_cabang}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          <p className="ml-3 text-gray-600">Memuat laporan harian...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Terjadi Kesalahan</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-6">
          {data.peringatan && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{data.peringatan}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <DashboardCard title="Total Penjualan" value={formatRupiah(data.penjualan_harian)} icon="penjualan" />
            <DashboardCard title="Modal Bahan Baku" value={formatRupiah(data.modal_bahan_baku)} icon="modal" />
            <DashboardCard title="Pengeluaran Harian" value={formatRupiah(data.pengeluaran_harian)} icon="pengeluaran" />
            <DashboardCard title="Laba Harian" value={formatRupiah(data.laba_harian)} icon="laba" />
            <DashboardCard title="Nett Income" value={formatRupiah(data.nett_income)} icon="nett" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700">Penjualan Produk</h2>
              <p className="text-gray-500 text-sm">
                Total: {formatRupiah(data.penjualan?.total_penjualan || 0)}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Produk</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider">Jumlah</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Harga Rata-rata</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Cabang</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPenjualan.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <Info className="w-8 h-8" />
                          <p className="font-semibold">Tidak ada penjualan pada tanggal ini</p>
                          <p className="text-sm">Coba pilih tanggal lain atau ubah filter cabang</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPenjualan.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.produk}</td>
                        <td className="px-6 py-4 text-center text-gray-500">{item.jumlah_produk}</td>
                        <td className="px-6 py-4 text-right text-gray-500">{formatRupiah(item.harga_item)}</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-800">
                          {formatRupiah(item.total_penjualan_produk)}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-gray-400" />
                            {item.nama_cabang}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {item.tanggal_waktu ? new Date(item.tanggal_waktu).toLocaleDateString('id-ID') : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700">Pengeluaran</h2>
              <p className="text-gray-500 text-sm">
                Total Cicilan Harian Aktif: {formatRupiah(data.pengeluaran_harian || 0)}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Keterangan</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Cabang</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Jumlah</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Cicilan Harian</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPengeluaran.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <Info className="w-8 h-8" />
                          <p className="font-semibold">Tidak ada pengeluaran pada tanggal ini</p>
                          <p className="text-sm">Coba pilih tanggal lain atau ubah filter cabang</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPengeluaran.map((item, i) => {
                      const aktif = item.cicilan_harian > 0;
                      
                      return (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{item.jenis}</span>
                              {item.keterangan && (
                                <button
                                  onClick={() => openKeteranganModal(item.keterangan, `Keterangan: ${item.jenis}`)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                  title="Lihat keterangan"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            <div className="flex items-center gap-2">
                              <Building2 size={14} className="text-gray-400" />
                              {item.nama_cabang}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(item.tanggal).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-500">{formatRupiah(item.jumlah)}</td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-800">
                            {formatRupiah(item.cicilan_harian)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              aktif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {aktif ? 'Aktif' : 'Selesai'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => openDeleteModal(item)}
                              className={`transition-colors ${
                                aktif 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-red-400 hover:text-red-600'
                              }`}
                              title={aktif ? "Hanya pengeluaran selesai yang dapat dihapus" : "Hapus pengeluaran"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
    </>
  );
};

export default DailyReportPage;