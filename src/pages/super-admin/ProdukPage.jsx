// src/pages/ProdukPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Package, 
    Edit, 
    Trash2, 
    Plus, 
    X, 
    Search,
    Filter,
    Eye,
    Loader2,
    Image as ImageIcon,
    Tag,
    DollarSign,
    FileText
} from "lucide-react";
import { useNotification } from "../../components/context/NotificationContext";
import { SuccessPopup, ConfirmDeletePopup } from "../../components/ui";

const API_URL = "http://localhost:8000/api";

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
    const [initialLoad, setInitialLoad] = useState(true);
    const [message, setMessage] = useState("");
    const [produk, setProduk] = useState([]);
    const [filteredProduk, setFilteredProduk] = useState([]);
    const [selectedProduk, setSelectedProduk] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterKategori, setFilterKategori] = useState("");
    const { addNotification } = useNotification();
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const getThemeColors = (role) => {
        if (role === 'super admin') {
            return {
                name: 'super admin',
                bgGradient: 'from-orange-50 via-white to-orange-100',
                primaryText: 'text-orange-700',
                primaryAccent: 'text-orange-600',
                primaryBg: 'bg-orange-600',
                primaryHoverBg: 'hover:bg-orange-700',
                primaryBorder: 'border-orange-200',
                modalBorder: 'border-orange-600',
                focusRing: 'focus:ring-orange-400',
                fileInput: 'file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100',
                priceText: 'text-orange-600',
                closeButton: 'text-orange-500 hover:bg-orange-100',
                cardGradient: 'from-orange-500 to-orange-600',
                loading: {
                    bg: 'bg-orange-50/50',
                    border: 'border-orange-200',
                    icon: 'text-orange-600',
                    text: 'text-orange-700',
                }
            };
        }
        return {
            name: 'admin cabang',
            bgGradient: 'from-red-50 via-white to-red-100',
            primaryText: 'text-red-700',
            primaryAccent: 'text-red-600',
            primaryBg: 'bg-red-600',
            primaryHoverBg: 'hover:bg-red-700',
            primaryBorder: 'border-red-200',
            modalBorder: 'border-red-600',
            focusRing: 'focus:ring-red-400',
            fileInput: 'file:bg-red-50 file:text-red-600 hover:file:bg-red-100',
            priceText: 'text-red-600',
            closeButton: 'text-red-500 hover:bg-red-100',
            cardGradient: 'from-red-500 to-red-600',
            loading: {
                bg: 'bg-red-50/50',
                border: 'border-red-200',
                icon: 'text-red-600',
                text: 'text-red-700',
            }
        };
    };
    const theme = getThemeColors(user?.role);

    // Get unique categories for filter
    const categories = [...new Set(produk.map(p => p.kategori).filter(Boolean))];

    // Filter produk based on search and category
    useEffect(() => {
        let filtered = produk;
        
        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.kategori.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (filterKategori) {
            filtered = filtered.filter(p => p.kategori === filterKategori);
        }
        
        setFilteredProduk(filtered);
    }, [produk, searchTerm, filterKategori]);

    const fetchProduk = useCallback(async () => {
        setInitialLoad(true);
        try {
            const res = await fetch(`${API_URL}/produk`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            const data = await res.json();
            setProduk(data.data || []);
        } catch (err) {
            console.error("Failed to fetch produk:", err);
            setProduk([]);
            addNotification("Gagal memuat data produk dari server.", 'error');
        } finally {
            setInitialLoad(false);
        }
    }, [token, addNotification]);

    useEffect(() => {
        if (token) fetchProduk();
    }, [token, fetchProduk]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleDetail = (prod) => setSelectedProduk(prod);
    const closeDetail = () => setSelectedProduk(null);

    const handleAddProduk = () => {
        setEditingProduk(null);
        setFormData({ 
            nama_produk: "", 
            harga: "", 
            kategori: "", 
            deskripsi: "", 
            gambar_produk: null, 
        });
        setMessage('');
        setIsModalOpen(true);
    };

    const handleEdit = (prod) => {
        setEditingProduk(prod);
        setFormData({ 
            nama_produk: prod.nama_produk, 
            harga: prod.harga, 
            kategori: prod.kategori, 
            deskripsi: prod.deskripsi, 
            gambar_produk: null 
        });
        setCurrentImageUrl(prod.gambar_produk_url);
        setMessage('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduk(null);
        setMessage('');
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

        const currentProdukName = formData.nama_produk;
        const action = editingProduk ? "mengubah" : "menambah";

        let url = `${API_URL}/produk`;
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

            if (!res.ok) {
                const text = await res.text();
                let errorMsg = `Gagal ${action} produk. Coba lagi.`;
                if (text.startsWith('<!DOCTYPE')) {
                    errorMsg = "Server Error: Sesi kedaluwarsa atau Kesalahan Internal Server (500).";
                    console.error("Server returned HTML error page (Not JSON):", text);
                } else {
                    try {
                        const data = JSON.parse(text);
                        errorMsg = data.message || errorMsg;
                    } catch (e) { /* fallback */ }
                }
                const notificationMsg = `Gagal ${action} produk '${currentProdukName}': ${errorMsg}`;
                addNotification(notificationMsg, 'error');

                setMessage("❌ " + errorMsg);
                setLoading(false);
                return;
            }

            const data = await res.json();

            if (res.ok) {
                const successAction = editingProduk ? "diubah" : "ditambahkan";
                const notificationMsg = `Berhasil ${successAction} data produk: ${currentProdukName}`;
                addNotification(notificationMsg, theme.name);

                setSuccessMessage(data.message || notificationMsg);
                setShowSuccess(true);
                fetchProduk();
                handleCloseModal();
            }
        } catch (err) {
            console.error("Fetch error:", err);
            const errorMsg = "Error koneksi server atau respons tidak valid";
            setMessage("❌ " + errorMsg);
            addNotification(`Gagal ${action} Produk: ${errorMsg}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        setShowConfirm(false);
        if (!deleteId) return;

        const produkToDelete = produk.find(p => p.id_produk === deleteId);
        const produkName = produkToDelete ? produkToDelete.nama_produk : `ID ${deleteId}`;

        try {
            const res = await fetch(`${API_URL}/produk/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (res.ok) {
                const notificationMsg = `Berhasil menghapus produk: ${produkName}`;
                addNotification(notificationMsg, 'info');

                setSuccessMessage(data.message || notificationMsg);
                setShowSuccess(true);
                fetchProduk();
            } else {
                const errorMsg = data.message || "Gagal menghapus produk.";
                const failMsg = `Gagal menghapus produk '${produkName}': ${errorMsg}`;
                addNotification(failMsg, 'error');
                setMessage("❌ " + errorMsg);
            }
        } catch (err) {
            console.error("Delete error:", err);
            const errorMsg = "Error koneksi server saat menghapus.";
            const connErrorMsg = `Error koneksi saat menghapus produk '${produkName}': ${errorMsg}`;
            addNotification(connErrorMsg, 'error');
            setMessage("❌ " + errorMsg);
        } finally {
            setDeleteId(null);
        }
    };

    const resetFilters = () => {
        setSearchTerm("");
        setFilterKategori("");
    };

    const LoadingIndicator = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center p-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200"
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className={`${theme.primaryAccent} mb-4`}
            >
                <Loader2 size={48} />
            </motion.div>
            <p className={`text-xl font-semibold ${theme.primaryText} mb-2`}>
                Memuat Data Produk...
            </p>
            <p className="text-gray-500 text-center">
                Sedang mengambil data produk dari server
            </p>
        </motion.div>
    );

    return (
        <div className={`min-h-screen p-6 bg-gradient-to-br ${theme.bgGradient}`}>
            {/* 🟢 CSS CUSTOM SCROLLBAR */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 4px;
                    border: 2px solid #f1f5f9;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
            `}</style>

            {/* Header Section */}
            <motion.div 
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="mb-4 lg:mb-0">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Kelola Produk
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Kelola katalog produk dan informasi detail
                    </p>
                </div>
                
                <button
                    onClick={handleAddProduk}
                    className={`flex items-center gap-2 ${theme.primaryBg} ${theme.primaryHoverBg} text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1`}
                    disabled={initialLoad}
                >
                    <Plus size={20} /> 
                    <span className="font-semibold">Tambah Produk</span>
                </button>
            </motion.div>

            {/* Stats Cards Clean dengan Tema Orange-Merah */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {/* Total Produk Card - Orange */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Total Produk</p>
                            <p className="text-3xl font-bold text-gray-800">{produk.length}</p>
                            <div className="flex items-center mt-2">
                                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                                <p className="text-gray-500 text-xs">Semua kategori</p>
                            </div>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                            <Package className="text-orange-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Kategori Card - Merah */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Total Kategori</p>
                            <p className="text-3xl font-bold text-gray-800">{categories.length}</p>
                            <div className="flex items-center mt-2">
                                <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                                <p className="text-gray-500 text-xs">Jenis produk</p>
                            </div>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                            <Tag className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Ditampilkan Card - Orange Muda */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-amber-500 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Produk Ditampilkan</p>
                            <p className="text-3xl font-bold text-gray-800">{filteredProduk.length}</p>
                            <div className="flex items-center mt-2">
                                <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
                                <p className="text-gray-500 text-xs">
                                    {searchTerm || filterKategori ? 'Hasil filter' : 'Semua data'}
                                </p>
                            </div>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                            <Filter className="text-amber-600" size={24} />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Search and Filter Section */}
            <motion.div 
                className="bg-white rounded-2xl p-6 shadow-lg mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari produk berdasarkan nama, deskripsi, atau kategori..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 text-black bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <select
                            value={filterKategori}
                            onChange={(e) => setFilterKategori(e.target.value)}
                            className="px-4 py-3 text-black bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        
                        <button
                            onClick={resetFilters}
                            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Loading State */}
            <AnimatePresence>
                {initialLoad && (
                    <div className="flex justify-center items-center py-20">
                        <LoadingIndicator />
                    </div>
                )}
            </AnimatePresence>

            {/* Products Grid */}
            <AnimatePresence>
                {!initialLoad && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {filteredProduk.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white/80 rounded-2xl shadow-inner text-center">
                                <Package size={64} className="text-gray-300 mb-4" />
                                <p className="text-gray-600 font-semibold text-xl mb-2">
                                    {produk.length === 0 ? "Belum Ada Produk" : "Tidak Ditemukan"}
                                </p>
                                <p className="text-gray-500 max-w-md">
                                    {produk.length === 0 
                                    ? "Silakan tambahkan produk baru untuk memulai katalog produk." 
                                    : "Tidak ada produk yang sesuai dengan kriteria pencarian Anda."
                                    }
                                </p>
                                {produk.length === 0 && (
                                    <button 
                                        onClick={handleAddProduk}
                                        className={`mt-6 flex items-center gap-2 ${theme.primaryBg} ${theme.primaryHoverBg} text-white px-6 py-3 rounded-xl shadow-lg transition-all`}
                                    >
                                        <Plus size={18} /> 
                                        Tambah Produk Pertama
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProduk.map((prod, index) => (
                                    <motion.div
                                        key={prod.id_produk}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100"
                                    >
                                        {/* Product Image */}
                                        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                                            {prod.gambar_produk_url ? (
                                                <img
                                                    src={prod.gambar_produk_url}
                                                    alt={prod.nama_produk}
                                                    className="w-full h-full object-cover object-center transform hover:scale-105 transition duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                                                    <ImageIcon className="text-gray-400" size={48} />
                                                </div>
                                            )}
                                            {/* Category Badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                    {prod.kategori}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Product Content */}
                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div className="space-y-3">
                                                <h2 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
                                                    {prod.nama_produk}
                                                </h2>
                                                <p className={`text-xl font-bold ${theme.priceText}`}>
                                                    Rp {parseInt(prod.harga).toLocaleString()}
                                                </p>
                                                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                                    {prod.deskripsi}
                                                </p>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleDetail(prod)}
                                                    className="flex-1 flex items-center justify-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    <Eye size={14} />
                                                    Lihat
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(prod)}
                                                    className="flex-1 flex items-center justify-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    <Edit size={14} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(prod.id_produk)}
                                                    className="flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    <Trash2 size={14} />
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto border-t-4 ${theme.modalBorder} relative max-h-[90vh] overflow-hidden`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className={`bg-gradient-to-r ${theme.cardGradient} p-6 text-white`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {editingProduk ? <Edit size={24} /> : <Plus size={24} />}
                                        <h2 className="text-2xl font-bold">
                                            {editingProduk ? 'Edit Produk' : 'Tambah Produk Baru'}
                                        </h2>
                                    </div>
                                    <button 
                                        onClick={handleCloseModal}
                                        className="p-2 rounded-full transition bg-white/20 hover:bg-white/30"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Modal Content */}
                            {/* 🟢 APPLIED CUSTOM SCROLLBAR CLASS HERE */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Nama Produk *
                                            </label>
                                            <input
                                                type="text"
                                                name="nama_produk"
                                                placeholder="Masukkan nama produk"
                                                value={formData.nama_produk}
                                                onChange={handleChange}
                                                className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent text-gray-900 placeholder:text-gray-400 transition`}
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Harga *
                                            </label>
                                            <input
                                                type="number"
                                                name="harga"
                                                placeholder="Contoh: 50000"
                                                value={formData.harga}
                                                onChange={handleChange}
                                                className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent text-gray-900 placeholder:text-gray-400 transition`}
                                                required
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Kategori *
                                        </label>
                                        <input
                                            type="text"
                                            name="kategori"
                                            placeholder="Contoh: Minuman, Makanan, Snack"
                                            value={formData.kategori}
                                            onChange={handleChange}
                                            className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent text-gray-900 placeholder:text-gray-400 transition`}
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Deskripsi *
                                        </label>
                                        <textarea
                                            name="deskripsi"
                                            placeholder="Masukkan deskripsi produk yang lengkap"
                                            value={formData.deskripsi}
                                            onChange={handleChange}
                                            className={`w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 ${theme.focusRing} focus:border-transparent text-gray-900 placeholder:text-gray-400 h-24 resize-none transition`}
                                            required
                                        ></textarea>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Gambar Produk {!editingProduk && '*'}
                                        </label>
                                        {editingProduk && currentImageUrl && (
                                            <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
                                                <p className="text-sm text-gray-600 mb-2 font-medium">Gambar Saat Ini:</p>
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={currentImageUrl} 
                                                        alt="Current" 
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                    <span className="text-sm text-gray-500 flex-1">
                                                        {currentImageUrl.split('/').pop()}
                                                    </span>
                                                    <span className={`text-xs ${theme.primaryText} font-medium`}>
                                                        (Opsional untuk diganti)
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            name="gambar_produk"
                                            accept="image/*"
                                            onChange={handleChange}
                                            className={`w-full border border-gray-300 p-3 rounded-xl text-gray-900 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold ${theme.fileInput} cursor-pointer transition`}
                                            required={!editingProduk}
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            Format yang didukung: JPG, PNG, GIF. Maksimal 5MB.
                                        </p>
                                    </div>
                                    
                                    {message && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-3 rounded-lg text-center font-medium ${
                                                message.includes("❌") 
                                                    ? "bg-red-50 text-red-600 border border-red-200" 
                                                    : "bg-green-50 text-green-600 border border-green-200"
                                            }`}
                                        >
                                            {message}
                                        </motion.div>
                                    )}
                                    
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                        <button 
                                            type="button" 
                                            onClick={handleCloseModal}
                                            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
                                        >
                                            Batal
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl ${theme.primaryBg} ${theme.primaryHoverBg} text-white font-semibold transition disabled:bg-gray-400 min-w-[120px]`}
                                        >
                                            {loading ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                editingProduk ? 'Update Produk' : 'Tambah Produk'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Product Detail Modal */}
            <AnimatePresence>
                {selectedProduk && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDetail}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto border-t-4 ${theme.modalBorder} relative max-h-[90vh] overflow-hidden`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Detail Header */}
                            <div className={`bg-gradient-to-r ${theme.cardGradient} p-6 text-white`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Package size={24} />
                                        <h2 className="text-2xl font-bold">Detail Produk</h2>
                                    </div>
                                    <button 
                                        onClick={closeDetail}
                                        className="p-2 rounded-full transition bg-white/20 hover:bg-white/30"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Detail Content */}
                            {/* 🟢 APPLIED CUSTOM SCROLLBAR CLASS HERE */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Product Image */}
                                    <div className="flex flex-col items-center">
                                        {selectedProduk.gambar_produk_url ? (
                                            <img
                                                src={selectedProduk.gambar_produk_url}
                                                alt={selectedProduk.nama_produk}
                                                className="w-full h-64 object-cover rounded-xl shadow-md mb-4"
                                            />
                                        ) : (
                                            <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mb-4">
                                                <ImageIcon className="text-gray-400" size={64} />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Product Info */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className={`text-2xl font-bold ${theme.primaryText} mb-2`}>
                                                {selectedProduk.nama_produk}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                                    {selectedProduk.kategori}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <DollarSign className={`${theme.primaryText}`} size={20} />
                                                <div>
                                                    <p className="text-sm text-gray-500">Harga</p>
                                                    <p className={`text-2xl font-bold ${theme.priceText}`}>
                                                        Rp {parseInt(selectedProduk.harga).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-3">
                                                <FileText className={`${theme.primaryText} mt-1`} size={20} />
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">Deskripsi</p>
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {selectedProduk.deskripsi}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => handleEdit(selectedProduk)}
                                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl transition font-medium"
                                    >
                                        <Edit size={16} />
                                        Edit Produk
                                    </button>
                                    <button
                                        onClick={closeDetail}
                                        className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition font-medium"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                type={user?.role}
            />
        </div>
    );
};

export default ProdukPage;