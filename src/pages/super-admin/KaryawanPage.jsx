// src/pages/KaryawanPage.jsx
import React, { useState, useEffect, useCallback } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { User, Edit, Trash2, Plus, Loader2, Search, Filter, Building, MapPin, Phone, DollarSign, XCircle } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const KaryawanPage = () => {
    const [karyawan, setKaryawan] = useState([]);
    const [cabang, setCabang] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Data states
    const [editingKaryawan, setEditingKaryawan] = useState(null);
    const [deleteKaryawan, setDeleteKaryawan] = useState(null);
    
    // Form and filter states
    const [formData, setFormData] = useState({
        id_cabang: "",
        nama_karyawan: "",
        alamat: "",
        telepon: "",
        gaji: ""
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [cabangFilter, setCabangFilter] = useState("");

    // Action loading states
    const [actionLoading, setActionLoading] = useState(null);

    const token = localStorage.getItem("token");

    // Fetch karyawan
    const fetchKaryawan = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/karyawan`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setKaryawan(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch karyawan:", err);
            setError("Terjadi kesalahan koneksi ke server.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Fetch cabang
    const fetchCabang = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/cabang`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCabang(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch cabang:", err);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchKaryawan();
            fetchCabang();
        }
    }, [token, fetchKaryawan, fetchCabang]);

    // Filter karyawan based on search and cabang
    const filteredKaryawan = karyawan.filter(karyawan => {
        const matchesSearch = karyawan.nama_karyawan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            karyawan.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            karyawan.telepon.includes(searchTerm);
        const matchesCabang = !cabangFilter || karyawan.id_cabang === parseInt(cabangFilter);
        return matchesSearch && matchesCabang;
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddKaryawan = () => {
        setEditingKaryawan(null);
        setFormData({
            id_cabang: "",
            nama_karyawan: "",
            alamat: "",
            telepon: "",
            gaji: ""
        });
        setIsModalOpen(true);
    };

    const handleEdit = (karyawan) => {
        setEditingKaryawan(karyawan);
        setFormData({
            id_cabang: karyawan.id_cabang,
            nama_karyawan: karyawan.nama_karyawan,
            alamat: karyawan.alamat,
            telepon: karyawan.telepon,
            gaji: karyawan.gaji
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(editingKaryawan ? "editing" : "adding");

        try {
            if (editingKaryawan) {
                await axios.put(`${API_URL}/karyawan/${editingKaryawan.id_karyawan}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage({ type: "success", text: "Karyawan berhasil diperbarui!" });
            } else {
                await axios.post(`${API_URL}/karyawan`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage({ type: "success", text: "Karyawan berhasil ditambahkan!" });
            }
            
            await fetchKaryawan();
            setIsModalOpen(false);
            setEditingKaryawan(null);
        } catch (err) {
            console.error("Submit error:", err);
            setMessage({ type: "error", text: "Gagal menyimpan karyawan" });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteKaryawan) return;
        
        setActionLoading("deleting");
        try {
            await axios.delete(`${API_URL}/karyawan/${deleteKaryawan.id_karyawan}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: "success", text: "Karyawan berhasil dihapus!" });
            await fetchKaryawan();
            setIsDeleteModalOpen(false);
            setDeleteKaryawan(null);
        } catch (err) {
            console.error("Delete error:", err);
            setMessage({ type: "error", text: "Gagal menghapus karyawan" });
        } finally {
            setActionLoading(null);
        }
    };

    const confirmDelete = (karyawan) => {
        setDeleteKaryawan(karyawan);
        setIsDeleteModalOpen(true);
    };

    const formatRupiah = (value) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getCabangName = (idCabang) => {
        const cabangData = cabang.find(c => c.id_cabang === idCabang);
        return cabangData?.nama_cabang || "Tidak Diketahui";
    };

    const renderContent = () => {
        if (loading) return (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <Loader2 className="animate-spin h-8 w-8 mb-4 text-red-500" />
                <p>Memuat data karyawan...</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredKaryawan.map((karyawan) => (
                    <motion.div
                        key={karyawan.id_karyawan}
                        whileHover={{ y: -2 }}
                        className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                    >
                        <div className="p-6 flex-1 flex flex-col">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <User className="text-red-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">
                                            {karyawan.nama_karyawan}
                                        </h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <Building size={14} />
                                            {getCabangName(karyawan.id_cabang)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span className="line-clamp-1">{karyawan.alamat}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone size={16} className="text-gray-400" />
                                    <span>{karyawan.telepon}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <DollarSign size={16} className="text-green-500" />
                                    <span className="font-semibold text-green-600">
                                        {formatRupiah(karyawan.gaji)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={() => handleEdit(karyawan)}
                                    className="flex-1 text-xs px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition font-medium flex items-center justify-center gap-1"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => confirmDelete(karyawan)}
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
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Kelola Karyawan</h1>
                        <p className="text-gray-500 text-sm sm:text-base">Kelola data karyawan dan penempatan cabang</p>
                    </div>
                    <button
                        onClick={handleAddKaryawan}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition shadow-md font-semibold self-start sm:self-center"
                    >
                        <Plus size={18} /> Tambah Karyawan
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
                            placeholder="Cari karyawan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            value={cabangFilter}
                            onChange={(e) => setCabangFilter(e.target.value)}
                            className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white appearance-none"
                        >
                            <option value="">Semua Cabang</option>
                            {cabang.map(cab => (
                                <option key={cab.id_cabang} value={cab.id_cabang}>{cab.nama_cabang}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Karyawan Content */}
                <div>{renderContent()}</div>

                {/* Empty State */}
                {!loading && !error && filteredKaryawan.length === 0 && (
                    <div className="text-center py-12">
                        <User className="mx-auto text-gray-400" size={48} />
                        <p className="text-gray-500 mt-4">Tidak ada karyawan ditemukan</p>
                    </div>
                )}
            </motion.div>

            {/* Add/Edit Karyawan Modal */}
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
                                    {editingKaryawan ? "Edit Karyawan" : "Tambah Karyawan Baru"}
                                </h2>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Karyawan
                                    </label>
                                    <input
                                        type="text"
                                        name="nama_karyawan"
                                        value={formData.nama_karyawan}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Alamat
                                    </label>
                                    <input
                                        type="text"
                                        name="alamat"
                                        value={formData.alamat}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Telepon
                                    </label>
                                    <input
                                        type="text"
                                        name="telepon"
                                        value={formData.telepon}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gaji
                                    </label>
                                    <input
                                        type="number"
                                        name="gaji"
                                        value={formData.gaji}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cabang
                                    </label>
                                    <select
                                        name="id_cabang"
                                        value={formData.id_cabang}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
                                        required
                                        disabled={cabang.length === 0}
                                    >
                                        <option value="">
                                            {cabang.length === 0 ? "Tidak ada cabang tersedia" : "Pilih Cabang"}
                                        </option>
                                        {cabang.map((cab) => (
                                            <option key={cab.id_cabang} value={cab.id_cabang}>
                                                {cab.nama_cabang}
                                            </option>
                                        ))}
                                    </select>
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
                                            editingKaryawan ? "Simpan Perubahan" : "Tambah Karyawan"
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
                {isDeleteModalOpen && deleteKaryawan && (
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
                                <h2 className="text-xl font-bold text-gray-800">Hapus Karyawan</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Apakah Anda yakin ingin menghapus karyawan ini?
                                </p>
                            </div>
                            
                            <div className="p-6">
                                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <User className="text-red-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{deleteKaryawan.nama_karyawan}</p>
                                        <p className="text-sm text-gray-500">{getCabangName(deleteKaryawan.id_cabang)}</p>
                                        <p className="text-sm text-gray-500">{deleteKaryawan.telepon}</p>
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
        </>
    );
};

export default KaryawanPage;