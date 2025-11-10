// src/pages/JenisPengeluaranPage.jsx
import React, { useState, useEffect, useCallback } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, FileText, Loader2, Search, XCircle, Tag } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const JenisPengeluaranPage = () => {
    const [jenisPengeluaran, setJenisPengeluaran] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Data states
    const [editingJenis, setEditingJenis] = useState(null);
    const [deleteJenis, setDeleteJenis] = useState(null);
    
    // Form and filter states
    const [formData, setFormData] = useState({
        jenis_pengeluaran: "",
    });
    const [searchTerm, setSearchTerm] = useState("");

    // Action loading states
    const [actionLoading, setActionLoading] = useState(null);

    const token = localStorage.getItem("token");

    // Fetch jenis pengeluaran
    const fetchJenisPengeluaran = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/jenis-pengeluaran`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJenisPengeluaran(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch jenis pengeluaran:", err);
            setError("Terjadi kesalahan koneksi ke server.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchJenisPengeluaran();
    }, [token, fetchJenisPengeluaran]);

    // Filter jenis pengeluaran based on search
    const filteredJenisPengeluaran = jenisPengeluaran.filter(jenis => 
        jenis.jenis_pengeluaran.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddJenis = () => {
        setEditingJenis(null);
        setFormData({
            jenis_pengeluaran: "",
        });
        setIsModalOpen(true);
    };

    const handleEdit = (jenis) => {
        setEditingJenis(jenis);
        setFormData({
            jenis_pengeluaran: jenis.jenis_pengeluaran,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(editingJenis ? "editing" : "adding");

        try {
            if (editingJenis) {
                await axios.put(`${API_URL}/jenis-pengeluaran/${editingJenis.id_jenis}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage({ type: "success", text: "Jenis pengeluaran berhasil diperbarui!" });
            } else {
                await axios.post(`${API_URL}/jenis-pengeluaran`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage({ type: "success", text: "Jenis pengeluaran berhasil ditambahkan!" });
            }
            
            await fetchJenisPengeluaran();
            setIsModalOpen(false);
            setEditingJenis(null);
        } catch (err) {
            console.error("Submit error:", err);
            const errorMsg = err.response?.data?.message || "Gagal menyimpan jenis pengeluaran";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteJenis) return;
        
        setActionLoading("deleting");
        try {
            await axios.delete(`${API_URL}/jenis-pengeluaran/${deleteJenis.id_jenis}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: "success", text: "Jenis pengeluaran berhasil dihapus!" });
            await fetchJenisPengeluaran();
            setIsDeleteModalOpen(false);
            setDeleteJenis(null);
        } catch (err) {
            console.error("Delete error:", err);
            setMessage({ type: "error", text: "Gagal menghapus jenis pengeluaran" });
        } finally {
            setActionLoading(null);
        }
    };

    const confirmDelete = (jenis) => {
        setDeleteJenis(jenis);
        setIsDeleteModalOpen(true);
    };

    const renderContent = () => {
        if (loading) return (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <Loader2 className="animate-spin h-8 w-8 mb-4 text-red-500" />
                <p>Memuat data jenis pengeluaran...</p>
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
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                No
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Jenis Pengeluaran
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredJenisPengeluaran.map((jenis, index) => (
                            <motion.tr
                                key={jenis.id_jenis}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <Tag className="text-red-600" size={16} />
                                        </div>
                                        <span className="font-medium">{jenis.jenis_pengeluaran}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(jenis)}
                                            className="p-2 text-yellow-600 hover:text-yellow-800 transition-colors rounded-full hover:bg-yellow-100"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(jenis)}
                                            className="p-2 text-red-600 hover:text-red-800 transition-colors rounded-full hover:bg-red-100"
                                            title="Hapus"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
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
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Kelola Jenis Pengeluaran</h1>
                        <p className="text-gray-500 text-sm sm:text-base">Kelola kategori dan jenis pengeluaran untuk laporan keuangan</p>
                    </div>
                    <button
                        onClick={handleAddJenis}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition shadow-md font-semibold self-start sm:self-center"
                    >
                        <Plus size={18} /> Tambah Jenis
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

                {/* Search Section */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari jenis pengeluaran..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Content */}
                <div>
                    {renderContent()}
                </div>

                {/* Empty State */}
                {!loading && !error && filteredJenisPengeluaran.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="mx-auto text-gray-400" size={48} />
                        <p className="text-gray-500 mt-4">
                            {searchTerm ? "Tidak ada jenis pengeluaran yang sesuai dengan pencarian" : "Belum ada jenis pengeluaran"}
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Add/Edit Jenis Modal */}
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
                                    {editingJenis ? "Edit Jenis Pengeluaran" : "Tambah Jenis Pengeluaran Baru"}
                                </h2>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Jenis Pengeluaran
                                    </label>
                                    <input
                                        type="text"
                                        name="jenis_pengeluaran"
                                        value={formData.jenis_pengeluaran}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                                        placeholder="Contoh: Biaya Listrik, Pembelian Bahan Baku, dll."
                                        required
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
                                            editingJenis ? "Simpan Perubahan" : "Tambah Jenis"
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
                {isDeleteModalOpen && deleteJenis && (
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
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center"
                        >
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-red-600" size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Hapus Jenis Pengeluaran</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Apakah Anda yakin ingin menghapus jenis pengeluaran <strong>"{deleteJenis.jenis_pengeluaran}"</strong>? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold"
                                    disabled={actionLoading === "deleting"}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={actionLoading === "deleting"}
                                    className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-red-400"
                                >
                                    {actionLoading === "deleting" ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2" size={18} />
                                            Menghapus...
                                        </>
                                    ) : (
                                        "Hapus"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default JenisPengeluaranPage;