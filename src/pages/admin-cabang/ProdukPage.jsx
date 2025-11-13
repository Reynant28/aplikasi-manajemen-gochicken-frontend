import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Minus, Save, X, RefreshCw, AlertCircle, ShoppingBag, ListChecks, Loader2 } from "lucide-react";
import axios from "axios";

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

  const fetchProdukStok = useCallback(async () => {
    if (!cabangId) { setError("Data cabang tidak ditemukan."); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${API_URL}/cabang/${cabangId}/produk`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === "success") setProdukList(res.data.data || []);
      else setError("Gagal mengambil data produk.");
    } catch (err) { setError("Terjadi kesalahan koneksi ke server."); } 
    finally { setLoading(false); }
  }, [token, cabangId]);

  useEffect(() => {
    if (token) fetchProdukStok(); else { setError("Otentikasi gagal."); setLoading(false); }
  }, [token, fetchProdukStok]);

  const handleStockChange = (id_stock_cabang, amount) => {
    setMessage({ type: "", text: "" });
    setPendingChanges(prev => {
      const currentChange = prev[id_stock_cabang] || 0;
      const newChange = currentChange + amount;
      const newChanges = { ...prev, [id_stock_cabang]: newChange };
      if (newChange === 0) { delete newChanges[id_stock_cabang]; }
      return newChanges;
    });
  };

  const handleDiscardChanges = () => { setPendingChanges({}); };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    const changesToSubmit = Object.entries(pendingChanges);
    const promises = changesToSubmit.map(([id, jumlah]) => 
      axios.put(`${API_URL}/produk/stok/${id}`, { jumlah }, { headers: { Authorization: `Bearer ${token}` } })
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
    } finally { setIsSaving(false); }
  };

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  // Calculate stats
  const totalProduk = produkList.length;
  const stokRendah = produkList.filter(item => item.jumlah_stok < 5).length;
  const totalPerubahan = Object.keys(pendingChanges).length;

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <RefreshCw className="animate-spin h-8 w-8 mb-4" />
        <p>Memuat data stok produk...</p>
      </div>
    );
    
    if (error) return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-700 bg-gray-50 rounded-xl">
        <AlertCircle className="h-10 w-10 mb-4 text-gray-500" />
        <p className="font-semibold text-gray-800">Terjadi Kesalahan</p>
        <p className="text-gray-600">{error}</p>
      </div>
    );

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {produkList.map((produk, index) => (
          <ProductCard
            key={produk.id_stock_cabang}
            product={produk}
            index={index}
            pendingChange={pendingChanges[produk.id_stock_cabang] || 0}
            onStockChange={handleStockChange}
            onImageClick={setSelectedImageUrl}
          />
        ))}
      </div>
    );
  };

  const changedItems = Object.keys(pendingChanges).map(id => {
    const product = produkList.find(p => p.id_stock_cabang === parseInt(id));
    return { ...product, change: pendingChanges[id] };
  }).filter(Boolean);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Stok Cabang</h1>
            <p className="text-gray-600">
              Kelola stok produk untuk: <strong className="text-gray-800">{cabang?.nama_cabang || 'N/A'}</strong>
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Produk</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{totalProduk}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Package className="text-gray-700" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stok Rendah</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stokRendah}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <AlertCircle className="text-gray-700" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Perubahan</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{totalPerubahan}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <ListChecks className="text-gray-700" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className={`p-4 rounded-lg flex items-center gap-3 text-sm font-semibold ${
              message.type === "success" 
                ? "bg-green-100 text-green-800 border border-green-200" 
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? "✓" : "✗"} {message.text}
          </motion.div>
        )}

        {/* Product Grid Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          {produkList.length === 0 && !loading ? (
            <motion.div
              className="flex flex-col items-center justify-center h-96"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">Belum ada produk</p>
              <p className="text-gray-400 text-sm mt-1">Tidak ada produk yang tersedia untuk cabang ini</p>
            </motion.div>
          ) : (
            renderContent()
          )}
        </div>
      </motion.div>

      {/* Floating Save Button */}
      <AnimatePresence>
        {hasPendingChanges && (
          <motion.div 
            initial={{ y: 100 }} 
            animate={{ y: 0 }} 
            exit={{ y: 100 }} 
            transition={{ type: "spring", stiffness: 300, damping: 30 }} 
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-3xl bg-gray-800 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between z-50"
          >
            <p className="text-sm font-medium">
              <span className="font-bold bg-gray-600 text-white rounded-full px-2 py-0.5 mr-2">
                {totalPerubahan}
              </span>
              Perubahan stok siap disimpan.
            </p>
            <div className="flex items-center gap-3">
              <motion.button 
                onClick={() => setIsReviewModalOpen(true)} 
                disabled={isSaving}
                className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ListChecks size={16} /> Tinjau Perubahan
              </motion.button>
              <motion.button 
                onClick={handleDiscardChanges} 
                disabled={isSaving}
                className="text-sm text-gray-400 hover:text-white transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Batal
              </motion.button>
              <motion.button 
                onClick={handleSaveChanges} 
                disabled={isSaving}
                className="flex items-center gap-2 text-sm font-semibold bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition disabled:bg-gray-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                {isSaving ? "Menyimpan..." : "Simpan"}
              </motion.button>
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
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              onClick={e => e.stopPropagation()} 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Tinjau Perubahan Stok</h2>
                <p className="text-sm text-gray-500">Anda akan menyimpan perubahan berikut:</p>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                {changedItems.map((item, index) => (
                  <motion.div 
                    key={item.id_stock_cabang}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={item.gambar_url} 
                        alt={item.nama_produk} 
                        className="w-12 h-12 rounded-md object-cover border border-gray-300" 
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{item.nama_produk}</p>
                        <p className="text-sm text-gray-500">Stok Awal: {item.jumlah_stok}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${item.change > 0 ? 'text-gray-700' : 'text-gray-700'}`}>
                        {item.change > 0 ? `+${item.change}` : item.change}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stok Baru: {item.jumlah_stok + item.change}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end gap-4 border-t border-gray-200">
                <motion.button 
                  onClick={() => setIsReviewModalOpen(false)} 
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Tutup
                </motion.button>
                <motion.button 
                  onClick={handleSaveChanges} 
                  disabled={isSaving}
                  className="flex items-center gap-2 text-sm font-semibold bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition disabled:bg-gray-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </motion.button>
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
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-8"
          >
            <motion.img 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.8 }} 
              src={selectedImageUrl} 
              alt="Product Preview" 
              className="max-w-full max-h-full rounded-lg shadow-2xl border-2 border-gray-300" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, index, pendingChange, onStockChange, onImageClick }) => {
  const getStokStatus = (stok) => {
    if (stok < 5) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (stok < 10) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  };

  const stokStatus = getStokStatus(product.jumlah_stok);
  const newStok = product.jumlah_stok + pendingChange;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-200"
    >
      {/* Product Image */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden group cursor-pointer">
        {product.gambar_url ? (
          <img
            src={product.gambar_url}
            alt={product.nama_produk}
            className="w-full h-full object-cover object-center transform group-hover:scale-110 transition duration-500"
            onClick={() => onImageClick(product.gambar_url)}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            onClick={() => onImageClick(null)}
          >
            <Package size={48} className="text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-gray-800 bg-opacity-90 text-white text-xs font-semibold rounded-full border border-gray-700">
            {product.kategori}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800 line-clamp-2">
            {product.nama_produk}
          </h2>
          <p className="text-gray-700 font-bold text-xl">
            Rp {parseInt(product.harga).toLocaleString()}
          </p>
          
          {/* Stock Information */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Stok Saat Ini:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${stokStatus.bg} ${stokStatus.color} ${stokStatus.border}`}>
                {product.jumlah_stok}
              </span>
            </div>
            
            {pendingChange !== 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Stok Baru:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  newStok < 5 ? 'bg-red-50 text-red-600 border-red-200' : 
                  newStok < 10 ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 
                  'bg-green-50 text-green-600 border-green-200'
                }`}>
                  {newStok}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stock Controls */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Kelola Stok:</span>
            {pendingChange !== 0 && (
              <span className={`text-sm font-bold ${pendingChange > 0 ? 'text-gray-700' : 'text-gray-700'}`}>
                {pendingChange > 0 ? `+${pendingChange}` : pendingChange}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStockChange(product.id_stock_cabang, -1)}
              disabled={newStok <= 0}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-xs font-medium"
            >
              <Minus size={14} /> Kurang
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStockChange(product.id_stock_cabang, 1)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition text-xs font-medium"
            >
              <Plus size={14} /> Tambah
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProdukPage;