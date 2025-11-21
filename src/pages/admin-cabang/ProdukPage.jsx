import React, { useState, useEffect, useCallback } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  AlertCircle,
  RefreshCw,
  Save,
  XCircle,
  Loader2,
  ListChecks,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import ProdukStokTable from "../../components/produk/ProdukStokTable";

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

  // ✨ NEW: State to control the save bar's minimized state
  const [isBarMinimized, setIsBarMinimized] = useState(false);

  const token = localStorage.getItem("token");
  const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
  const cabangId = cabang?.id_cabang;

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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") setProdukList(res.data.data || []);
      else setError("Gagal mengambil data produk.");
      //eslint-disable-next-line no-unused-vars
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
    setPendingChanges((prev) => {
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
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    const changesToSubmit = Object.entries(pendingChanges);
    const promises = changesToSubmit.map(([id, jumlah]) =>
      axios.put(
        `${API_URL}/stok-cabang/${id}`,
        { jumlah },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    );
    try {
      await Promise.all(promises);
      setMessage({
        type: "success",
        text: "Semua perubahan stok berhasil disimpan!",
      });
      setPendingChanges({});
      setIsReviewModalOpen(false);
      await fetchProdukStok();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Gagal menyimpan satu atau lebih perubahan.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <RefreshCw className="animate-spin h-8 w-8 mb-4 text-red-500" />
          <p>Memuat data stok produk...</p>
        </div>
      );
    if (error)
      return (
        <div className="flex flex-col items-center justify-center h-96 text-red-700 bg-red-50 rounded-lg">
          <AlertCircle className="h-10 w-10 mb-4" />
          <p className="font-semibold">Terjadi Kesalahan</p>
          <p>{error}</p>
        </div>
      );
    return (
      <ProdukStokTable
        produkList={produkList}
        pendingChanges={pendingChanges}
        onStageChange={handleStageChange}
        onImageClick={setSelectedImageUrl}
      />
    );
  };

  const changedItems = Object.keys(pendingChanges)
    .map((id) => {
      const product = produkList.find(
        (p) => p.id_stock_cabang === parseInt(id)
      );
      return { ...product, change: pendingChanges[id] };
    })
    .filter(Boolean);

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
              Manajemen Stok
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Sesuaikan jumlah stok untuk cabang:{" "}
              <strong>{cabang?.nama_cabang || "N/A"}</strong>
            </p>
          </div>
        </div>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg flex items-center gap-3 text-sm font-semibold ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.type === "success" ? "✓" : "✗"} {message.text}
          </motion.div>
        )}
        <div>{renderContent()}</div>
      </motion.div>

      <AnimatePresence>
        {hasPendingChanges && (
          // ✨ REVISED: Changed position to bottom-right and structure for minimizing
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div
              className={`bg-gray-800 text-white rounded-xl shadow-2xl flex items-center gap-4 transition-all duration-300 ease-in-out ${
                isBarMinimized ? "p-2" : "p-3 sm:p-4"
              }`}
            >
              <div className="flex items-center">
                <span className="font-bold bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs mr-2">
                  {Object.keys(pendingChanges).length}
                </span>
                <AnimatePresence>
                  {!isBarMinimized && (
                    <motion.p
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap hidden sm:block"
                    >
                      Perubahan stok siap disimpan.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {!isBarMinimized && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex items-center gap-3 overflow-hidden"
                  >
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      disabled={isSaving}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition"
                    >
                      <ListChecks size={16} />{" "}
                      <span className="hidden sm:inline">Tinjau</span>
                    </button>
                    <button
                      onClick={handleDiscardChanges}
                      disabled={isSaving}
                      className="text-sm text-gray-400 hover:text-white transition"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="flex items-center gap-2 text-sm font-semibold bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition disabled:bg-red-400"
                    >
                      {isSaving ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      {isSaving ? "Menyimpan..." : "Simpan"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setIsBarMinimized(!isBarMinimized)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                {isBarMinimized ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ... (Modal code remains unchanged) ... */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div
            onMouseDown={() => setIsReviewModalOpen(false)}
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
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl"
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  Tinjau Perubahan Stok
                </h2>
                <p className="text-sm text-gray-500">
                  Anda akan menyimpan perubahan berikut:
                </p>
              </div>
              <div className="p-3 sm:p-6 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar">
                {changedItems.map((item) => (
                  <div
                    key={item.id_stock_cabang}
                    className="flex flex-col sm:flex-row items-center justify-between p-3 bg-gray-50 rounded-lg gap-2"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <img
                        src={item.gambar_url}
                        alt={item.nama_produk}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.nama_produk}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stok Awal: {item.jumlah_stok}
                        </p>
                      </div>
                    </div>
                    <div className="text-right w-full sm:w-auto flex-shrink-0">
                      <p
                        className={`font-bold text-lg ${
                          item.change > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {item.change > 0 ? `+${item.change}` : item.change}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stok Baru: {item.jumlah_stok + item.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 sm:p-6 bg-gray-50 rounded-b-xl flex justify-end gap-4">
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg hover:bg-gray-100"
                >
                  Tutup
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="flex items-center gap-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition disabled:bg-red-400"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving ? "Simpan" : "Simpan Perubahan"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedImageUrl && (
          <motion.div
            onClick={() => setSelectedImageUrl(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8"
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={selectedImageUrl}
              alt="Product Preview"
              className="max-w-full max-h-full rounded-lg shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProdukPage;
