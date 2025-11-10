// src/pages/ProdukPage.jsx
import React, { useState, useEffect, useCallback } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Package, Edit, Trash2, Plus, Eye, Loader2, Search, Filter, Save, XCircle, ListChecks, ChevronUp, ChevronDown } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const ProdukPage = () => {
    const [produk, setProduk] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    //eslint-disable-next-line no-unused-vars
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    
    // Data states
    const [editingProduk, setEditingProduk] = useState(null);
    const [deleteProduk, setDeleteProduk] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");
    
    // Form and filter states
    const [formData, setFormData] = useState({
        nama_produk: "",
        harga: "",
        kategori: "",
        deskripsi: "",
        gambar_produk: null,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    // Action loading states
    const [actionLoading, setActionLoading] = useState(null);
    //eslint-disable-next-line no-unused-vars
    const [pendingChanges, setPendingChanges] = useState({});
    //eslint-disable-next-line no-unused-vars
    const [isBarMinimized, setIsBarMinimized] = useState(false);

    const token = localStorage.getItem("token");

    // Fetch products
    const fetchProduk = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/produk`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProduk(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch produk:", err);
            setError("Terjadi kesalahan koneksi ke server.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchProduk();
    }, [token, fetchProduk]);

    // Filter products based on search and category
    const filteredProduk = produk.filter(prod => {
        const matchesSearch = prod.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            prod.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || prod.kategori === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories for filter
    const categories = [...new Set(produk.map(p => p.kategori))];

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
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
        setIsModalOpen(true);
    };

    const handleImagePreview = (imageUrl, e) => {
        e?.stopPropagation();
        setSelectedImage(imageUrl);
        setIsImageModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(editingProduk ? "editing" : "adding");

        const submitData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null) {
                submitData.append(key, value);
            }
        });

        try {
            if (editingProduk) {
                submitData.append("_method", "PUT");
                await axios.post(`${API_URL}/produk/${editingProduk.id_produk}`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage({ type: "success", text: "Produk berhasil diperbarui!" });
            } else {
                await axios.post(`${API_URL}/produk`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage({ type: "success", text: "Produk berhasil ditambahkan!" });
            }
            
            await fetchProduk();
            setIsModalOpen(false);
            setEditingProduk(null);
        } catch (err) {
            console.error("Submit error:", err);
            setMessage({ type: "error", text: "Gagal menyimpan produk" });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteProduk) return;
        
        setActionLoading("deleting");
        try {
            await axios.delete(`${API_URL}/produk/${deleteProduk.id_produk}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: "success", text: "Produk berhasil dihapus!" });
            await fetchProduk();
            setIsDeleteModalOpen(false);
            setDeleteProduk(null);
        } catch (err) {
            console.error("Delete error:", err);
            setMessage({ type: "error", text: "Gagal menghapus produk" });
        } finally {
            setActionLoading(null);
        }
    };

    const confirmDelete = (prod) => {
        setDeleteProduk(prod);
        setIsDeleteModalOpen(true);
    };

    const formatRupiah = (value) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    const renderContent = () => {
        if (loading) return (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <Loader2 className="animate-spin h-8 w-8 mb-4 text-red-500" />
                <p>Memuat data produk...</p>
            </div>
        );
        
        if (error) return (
            <div className="flex flex-col items-center justify-center h-96 text-red-700 bg-red-50 rounded-lg">
                <XCircle className="h-10 w-10 mb-4" />
                <p className="font-semibold">Terjadi Kesalahan</p>
                <p>{error}</p>
            </div>
        );

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProduk.map((prod) => (
                    <motion.div
                        key={prod.id_produk}
                        whileHover={{ y: -2 }}
                        className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                    >
                        {/* Product Image with Hover Effect */}
                        <div 
                            className="relative w-full h-48 overflow-hidden cursor-pointer group"
                            onClick={() => handleImagePreview(prod.gambar_produk_url)}
                        >
                            <img
                                src={prod.gambar_produk_url}
                                alt={prod.nama_produk}
                                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-500"
                            />
                            {/* Hover Overlay with Eye Icon */}
                            <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={24} />
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="space-y-2 flex-1">
                                <h3 className="font-semibold text-gray-900 line-clamp-2">
                                    {prod.nama_produk}
                                </h3>
                                <p className="text-red-600 font-bold text-lg">
                                    {formatRupiah(prod.harga)}
                                </p>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                        {prod.kategori}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {prod.deskripsi}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleEdit(prod)}
                                    className="flex-1 text-xs px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition font-medium flex items-center justify-center gap-1"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => confirmDelete(prod)}
                                    className="flex-1 text-xs px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition font-medium flex items-center justify-center gap-1"
                                >
                                    <Trash2 size={14} /> Hapus
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
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

            <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Kelola Produk</h1>
                        <p className="text-gray-500 text-sm sm:text-base">Kelola produk dan inventaris toko Anda</p>
                    </div>
                    <button
                        onClick={handleAddProduk}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition shadow-md font-semibold self-start sm:self-center"
                    >
                        <Plus size={18} /> Tambah Produk
                    </button>
                </div>

                {/* Message Display */}
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

                {/* Search and Filter Section */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white appearance-none"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Products Content */}
                <div>{renderContent()}</div>

                {/* Empty State */}
                {!loading && !error && filteredProduk.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="mx-auto text-gray-400" size={48} />
                        <p className="text-gray-500 mt-4">Tidak ada produk ditemukan</p>
                    </div>
                )}
            </motion.div>

            {/* Add/Edit Product Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        onMouseDown={() => setIsModalOpen(false)}
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
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                        >
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingProduk ? "Edit Produk" : "Tambah Produk Baru"}
                                </h2>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Produk
                                    </label>
                                    <input
                                        type="text"
                                        name="nama_produk"
                                        value={formData.nama_produk}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Harga
                                    </label>
                                    <input
                                        type="number"
                                        name="harga"
                                        value={formData.harga}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategori
                                    </label>
                                    <input
                                        type="text"
                                        name="kategori"
                                        value={formData.kategori}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        name="deskripsi"
                                        value={formData.deskripsi}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gambar Produk
                                    </label>
                                    <input
                                        type="file"
                                        name="gambar_produk"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                                        required={!editingProduk}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-red-400 flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            editingProduk ? "Simpan Perubahan" : "Tambah Produk"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && deleteProduk && (
                    <motion.div 
                        onMouseDown={() => setIsDeleteModalOpen(false)}
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
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                        >
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold text-gray-800">Hapus Produk</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Apakah Anda yakin ingin menghapus produk ini?
                                </p>
                            </div>
                            
                            <div className="p-6">
                                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                                    {deleteProduk.gambar_produk_url && (
                                        <img
                                            src={deleteProduk.gambar_produk_url}
                                            alt={deleteProduk.nama_produk}
                                            className="w-12 h-12 rounded-md object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-800">{deleteProduk.nama_produk}</p>
                                        <p className="text-sm text-gray-500">{formatRupiah(deleteProduk.harga)}</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={actionLoading === "deleting"}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-red-400 flex items-center justify-center gap-2"
                                    >
                                        {actionLoading === "deleting" ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} />
                                                Menghapus...
                                            </>
                                        ) : (
                                            "Hapus"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {isImageModalOpen && (
                    <motion.div 
                        onClick={() => setIsImageModalOpen(false)}
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8"
                    >
                        <motion.img 
                            initial={{ scale: 0.8 }} 
                            animate={{ scale: 1 }} 
                            exit={{ scale: 0.8 }} 
                            src={selectedImage} 
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