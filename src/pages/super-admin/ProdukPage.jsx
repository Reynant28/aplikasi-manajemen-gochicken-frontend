// src/pages/ProdukPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Edit, Trash2, Plus, AlertTriangle, CheckCircle, X, ShoppingBag } from "lucide-react";

import { SuccessPopup, ConfirmDeletePopup } from "../../components/ui";
import Modal from "../../components/ui/Modal.jsx";
import ProductCard from "../../components/ui/Card/ProductCard";
import ProductForm from "../../components/ui/Form/ProductForm.jsx";

const API_URL = "http://localhost:8000/api";

// --- ProdukPage Component (Gray Theme) ---
const ProdukPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduk, setEditingProduk] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [formData, setFormData] = useState({
    nama_produk: "",
    harga: "",
    kategori: "",
    deskripsi: "",
    gambar_produk: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [produk, setProduk] = useState([]);
  const [selectedProduk, setSelectedProduk] = useState(null);

  // Popup
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const token = localStorage.getItem("token");

  // --- Fetch Produk ---
  const fetchProduk = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/produk`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProduk(data.data || []);
    } catch (err) {
      console.error("Failed to fetch produk:", err);
      setProduk([]);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchProduk();
  }, [token, fetchProduk]);

  // --- Form Handling ---
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData({ ...formData, [name]: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  const handleAddProduk = () => {
    setEditingProduk(null);
    setFormData({
      nama_produk: "",
      harga: "",
      kategori: "",
      deskripsi: "",
      gambar_produk: null,
    });
    setMessage("");
    setIsModalOpen(true);
  };

  const handleEdit = (prod) => {
    setEditingProduk(prod);
    setFormData({
      nama_produk: prod.nama_produk,
      harga: prod.harga,
      kategori: prod.kategori,
      deskripsi: prod.deskripsi,
      gambar_produk: null,
    });
    setCurrentImageUrl(prod.gambar_produk_url);
    setMessage("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduk(null);
    setMessage("");
    setCurrentImageUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) form.append(key, value);
    });

    let url = `${API_URL}/produk`;
    const currentProdukName = formData.nama_produk;
    const action = editingProduk ? "mengubah" : "menambah";

    if (editingProduk) {
      url = `${API_URL}/produk/${editingProduk.id_produk}`;
      form.append("_method", "PUT");
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || `Berhasil ${action} produk: ${currentProdukName}`);
        setShowSuccess(true);
        fetchProduk();
        handleCloseModal();
      } else {
        setMessage("❌ " + (data.message || `Gagal ${action} produk.`));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("❌ Error koneksi server atau respons tidak valid");
    } finally {
      setLoading(false);
    }
  };

  // --- Detail & Delete ---
  const handleDetail = (prod) => setSelectedProduk(prod);
  const closeDetail = () => setSelectedProduk(null);

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    setShowConfirm(false);
    if (!deleteId) return;

    const produkToDelete = produk.find((p) => p.id_produk === deleteId);
    const produkName = produkToDelete ? produkToDelete.nama_produk : `ID ${deleteId}`;

    try {
      const res = await fetch(`${API_URL}/produk/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || `Berhasil menghapus produk: ${produkName}`);
        setShowSuccess(true);
        fetchProduk();
      } else {
        setMessage("❌ " + (data.message || "Gagal menghapus produk."));
      }
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("❌ Error koneksi server saat menghapus.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-800">Kelola Produk</h1>
          <p className="text-gray-500 mt-1">Manajemen produk dan katalog</p>
        </motion.div>

        <motion.button
          onClick={handleAddProduk}
          className="flex items-center gap-2 bg-gray-700 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Plus size={20} /> Tambah Produk
        </motion.button>
      </div>

      {/* Product Grid */}
      {produk.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-md border border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ShoppingBag size={64} className="text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">Belum ada produk</p>
          <p className="text-gray-400 text-sm mt-1">Klik "Tambah Produk" untuk memulai</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {produk.map((prod, index) => (
            <ProductCard
              key={prod.id_produk}
              product={prod}
              index={index}
              onDetail={handleDetail}
              onEdit={handleEdit}
              onDelete={confirmDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Tambah/Edit Produk */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={editingProduk ? "max-w-3xl" : "max-w-md"}
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
          <div className="p-1.5 bg-gray-100 rounded-lg">
            <Package className="text-gray-700" size={20} />
          </div>
          {editingProduk ? "Edit Produk" : "Tambah Produk"}
        </h2>

        <ProductForm
          editingProduk={editingProduk}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          currentImageUrl={currentImageUrl}
          message={message}
        />
      </Modal>

      {/* Modal Detail Produk */}
      <AnimatePresence>
        {selectedProduk && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetail}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white shadow-xl rounded-xl p-5 w-full max-w-md mx-auto border border-gray-200 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeDetail}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                Detail Produk
              </h2>

              {selectedProduk.gambar_produk_url ? (
                <img
                  src={selectedProduk.gambar_produk_url}
                  alt={selectedProduk.nama_produk}
                  className="w-full h-48 object-cover rounded-xl mb-4 shadow-md"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                  <Package size={64} className="text-gray-300" />
                </div>
              )}

              <div className="space-y-3 text-gray-800">
                <div className="pb-3 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedProduk.nama_produk}
                  </h3>
                  <p className="text-2xl font-bold text-gray-700 mt-2">
                    Rp {parseInt(selectedProduk.harga).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600">Kategori</p>
                  <p className="text-base text-gray-800">{selectedProduk.kategori}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Deskripsi</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedProduk.deskripsi}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={closeDetail}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    closeDetail();
                    handleEdit(selectedProduk);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium flex items-center justify-center gap-2"
                >
                  <Edit size={16} /> Edit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popups */}
      <ConfirmDeletePopup
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />
      <SuccessPopup
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Aksi Berhasil! 🎉"
        message={successMessage}
      />
    </div>
  );
};

export default ProdukPage;