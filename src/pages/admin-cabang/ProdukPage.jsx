// src/pages/ProdukPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  XCircle, 
  Loader2, 
  ListChecks,
  ArrowUp,
  ArrowDown,
  Eye
} from "lucide-react";
import axios from "axios";
import ProdukStokTable from '../../components/produk/ProdukStokTable';

const API_URL = "http://localhost:8000/api";

const ProdukPage = () => {
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [pendingChanges, setPendingChanges] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const token = localStorage.getItem("token");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang;

  // Tema merah sesuai sidebar GoChicken
  const theme = {
    bgGradient: 'from-red-50 via-white to-red-100',
    primary: 'text-red-700',
    primaryBg: 'bg-red-600',
    primaryHover: 'hover:bg-red-700',
    primaryLight: 'bg-red-50',
    primaryBorder: 'border-red-200',
    accent: 'text-red-600',
    success: 'text-green-600',
    error: 'text-red-600'
  };

  const fetchProdukStok = useCallback(async () => {
    if (!cabangId) { 
      setError("Data cabang tidak ditemukan."); 
      setLoading(false); 
      return; 
    }
    setLoading(true); 
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/cabang/${cabangId}/produk`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.data.status === "success") setProdukList(res.data.data || []);
      else setError("Gagal mengambil data produk.");
    } catch (err) { 
      setError("Terjadi kesalahan koneksi ke server."); 
    } finally { 
      setLoading(false); 
    }
  }, [token, cabangId]);

  useEffect(() => {
    if (token) fetchProdukStok(); 
    else { 
      setError("Otentikasi gagal."); 
      setLoading(false); 
    }
  }, [token, fetchProdukStok]);

  const handleStageChange = (id_stock_cabang, amount) => {
    setMessage({ type: "", text: "" });
    setPendingChanges(prev => {
      const currentChange = prev[id_stock_cabang] || 0;
      const newChange = currentChange + amount;
      const newChanges = { ...prev, [id_stock_cabang]: newChange };
      if (newChange === 0) { 
        delete newChanges[id_stock_cabang]; 
      }
      return newChanges;
    });
  };

  const handleDiscardChanges = () => { 
    setPendingChanges({}); 
    setMessage({ type: "", text: "" });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    const changesToSubmit = Object.entries(pendingChanges);
    const promises = changesToSubmit.map(([id, jumlah]) => 
      axios.put(`${API_URL}/stok-cabang/${id}`, { jumlah }, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
    );
    try {
      await Promise.all(promises);
      setMessage({ type: "success", text: "Semua perubahan stok berhasil disimpan!" });
      setPendingChanges({});
      setIsReviewModalOpen(false);
      await fetchProdukStok();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal menyimpan satu atau lebih perubahan.";
      setMessage({ type: "error", text: errorMsg });
    } finally { 
      setIsSaving(false); 
    }
  };

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <RefreshCw className="animate-spin h-8 w-8 mb-4 text-red-600" />
        <p>Memuat data stok produk...</p>
      </div>
    );
    
    if (error) return (
      <div className="flex flex-col items-center justify-center h-96 text-red-700 bg-red-50 rounded-lg p-6">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p className="font-semibold text-lg mb-2">Terjadi Kesalahan</p>
        <p className="text-center">{error}</p>
        <button 
          onClick={fetchProdukStok}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>
      </div>
    );
    
    return (
      <ProdukStokTable 
        produkList={produkList} 
        pendingChanges={pendingChanges} 
        onStageChange={handleStageChange} 
        onImageClick={setSelectedImageUrl} 
        theme={theme}
      />
    );
  };

  const changedItems = Object.keys(pendingChanges).map(id => {
    const product = produkList.find(p => p.id_stock_cabang === parseInt(id));
    return { ...product, change: pendingChanges[id] };
  }).filter(Boolean);

  const totalChanges = Object.values(pendingChanges).reduce((sum, change) => sum + Math.abs(change), 0);

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fef2f2; /* bg-red-50 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fecaca; /* bg-red-200 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f87171; /* bg-red-400 */
        }
      `}</style>

      <div className={`min-h-screen p-6 space-y-6 bg-gradient-to-br ${theme.bgGradient}`}>
        {/* Header Section */}
          <motion.div 
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900">Manajemen Stok</h1>
              <p className="text-gray-600 text-lg">
                Kelola stok produk untuk <span className="font-semibold text-red-600">{cabang?.nama_cabang || 'Cabang'}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Card Cabang - SIZE FIXED */}
              <div className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg border border-red-400">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-100">Cabang Aktif</p>
                    <p className="text-sm font-semibold text-white">{cabang?.nama_cabang || 'Cabang Tidak Dikenal'}</p>
                  </div>
                </div>
              </div>
              
              {/* Tombol Refresh - SIZE FIXED */}
              <button
                onClick={fetchProdukStok}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50 transition disabled:opacity-50 group"
              >
                <RefreshCw 
                  size={16} 
                  className={`text-red-600 ${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform"}`} 
                />
                <span className="text-sm font-medium text-red-700">Refresh</span>
              </button>
            </div>
          </motion.div>

        {/* Status Message */}
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold ${
              message.type === "success" 
                ? "bg-green-100 text-green-800 border border-green-200" 
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? "✓" : "✗"} {message.text}
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div 
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">Daftar Stok Produk</h2>
              <p className="text-gray-600">Kelola dan pantau stok produk di cabang Anda</p>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-r from-red-100 to-red-200">
              <Package size={20} className="text-red-600" />
            </div>
          </div>
          
          {renderContent()}
        </motion.div>

        {/* Floating Action Button for Changes */}
        <AnimatePresence>
          {hasPendingChanges && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-4xl bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between z-50 border border-red-500"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/20">
                  <Package size={20} />
                </div>
                <div>
                  <p className="font-semibold">
                    <span className="bg-white text-red-600 rounded-full px-2 py-1 text-sm font-bold mr-2">
                      {Object.keys(pendingChanges).length}
                    </span>
                    Perubahan stok menunggu disimpan
                  </p>
                  <p className="text-red-100 text-sm">
                    Total penyesuaian: {totalChanges} item
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsReviewModalOpen(true)} 
                  disabled={isSaving}
                  className="flex items-center gap-2 text-sm font-semibold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  <ListChecks size={16} /> 
                  Tinjau Perubahan
                </button>
                
                <button 
                  onClick={handleDiscardChanges} 
                  disabled={isSaving}
                  className="text-sm text-red-200 hover:text-white transition disabled:opacity-50"
                >
                  Batalkan
                </button>
                
                <button 
                  onClick={handleSaveChanges} 
                  disabled={isSaving}
                  className="flex items-center gap-2 text-sm font-semibold bg-white text-red-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition disabled:bg-gray-300"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={16}/>
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving ? "Menyimpan..." : "Simpan Semua"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Review Changes Modal */}
        <AnimatePresence>
          {isReviewModalOpen && (
            <motion.div 
              onClick={() => setIsReviewModalOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div 
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-600 text-white">
                      <ListChecks size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Tinjau Perubahan Stok</h2>
                      <p className="text-sm text-gray-600">Konfirmasi perubahan stok sebelum menyimpan</p>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
                  {changedItems.map(item => (
                    <div 
                      key={item.id_stock_cabang} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={item.gambar_url} 
                            alt={item.nama_produk} 
                            className="w-14 h-14 rounded-lg object-cover border border-gray-300"
                          />
                          <button
                            onClick={() => setSelectedImageUrl(item.gambar_url)}
                            className="absolute inset-0 bg-black/0 hover:bg-black/20 rounded-lg transition flex items-center justify-center"
                          >
                            <Eye size={16} className="text-white opacity-0 hover:opacity-100" />
                          </button>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.nama_produk}</p>
                          <p className="text-sm text-gray-500">
                            Stok saat ini: <span className="font-medium">{item.jumlah_stok}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {item.change > 0 ? (
                            <ArrowUp size={16} className="text-green-600" />
                          ) : (
                            <ArrowDown size={16} className="text-red-600" />
                          )}
                          <p className={`font-bold text-lg ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.change > 0 ? `+${item.change}` : item.change}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          Stok baru: <span className="font-medium">{item.jumlah_stok + item.change}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{changedItems.length}</span> produk akan diupdate
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsReviewModalOpen(false)}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                      Tutup
                    </button>
                    <button 
                      onClick={handleSaveChanges} 
                      disabled={isSaving}
                      className="flex items-center gap-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition disabled:bg-red-400"
                    >
                      {isSaving ? (
                        <Loader2 className="animate-spin" size={16}/>
                      ) : (
                        <Save size={16} />
                      )}
                      {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Preview Modal */}
        <AnimatePresence>
          {selectedImageUrl && (
            <motion.div 
              onClick={() => setSelectedImageUrl(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-8"
            >
              <motion.img 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                src={selectedImageUrl} 
                alt="Product Preview" 
                className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
              />
              <button
                onClick={() => setSelectedImageUrl(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              >
                <XCircle size={24} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ProdukPage;