// src/pages/KelolaCabangPage.jsx
import { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Building2, 
  MapPin, 
  Phone,
  Loader2,
  X,
  Search
} from "lucide-react"; 
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:8000/api";

// --- Custom ConfirmDeletePopup Component ---
const ConfirmDeletePopup = ({ isOpen, onClose, onConfirm, loading = false }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto border border-gray-200"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Konfirmasi Hapus
                                </h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Apakah Anda yakin ingin menghapus cabang ini? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={loading}
                                    className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={loading}
                                    className="flex-1 py-2 px-4 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
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
    );
};

// --- Modal Form Component ---
const CabangFormModal = ({ 
    isOpen, 
    onClose, 
    title, 
    cabangData, 
    onChange, 
    onSubmit, 
    loading = false,
    isEdit = false 
}) => {
    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto border border-gray-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-red-500" />
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Cabang
                            </label>
                            <input
                                type="text"
                                value={cabangData.nama_cabang}
                                onChange={(e) => onChange({ ...cabangData, nama_cabang: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                placeholder="Masukkan nama cabang"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Alamat
                            </label>
                            <input
                                type="text"
                                value={cabangData.alamat}
                                onChange={(e) => onChange({ ...cabangData, alamat: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                placeholder="Masukkan alamat cabang"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Telepon
                            </label>
                            <input
                                type="text"
                                value={cabangData.telepon}
                                onChange={(e) => onChange({ ...cabangData, telepon: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                placeholder="Masukkan nomor telepon"
                                required
                            />
                        </div>

                        {!isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password Cabang
                                </label>
                                <input
                                    type="password"
                                    value={cabangData.password_cabang}
                                    onChange={(e) => onChange({ ...cabangData, password_cabang: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                    placeholder="Masukkan password"
                                    required
                                />
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2 px-4 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Simpan"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Loading Component ---
const LoadingState = () => (
    <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="ml-3 text-gray-600">Memuat data cabang...</p>
    </div>
);

// --- KelolaCabangPage Component ---
const KelolaCabangPage = () => {
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [cabang, setCabang] = useState([]);
    const [filteredCabang, setFilteredCabang] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [newCabang, setNewCabang] = useState({
        nama_cabang: "",
        alamat: "",
        telepon: "",
        password_cabang: "",
    });
    const [editCabang, setEditCabang] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const token = localStorage.getItem("token");

    const fetchCabang = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/cabang`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setCabang(data.data || []);
            setFilteredCabang(data.data || []);
        } catch (err) {
            console.error("Failed to fetch cabang:", err);
            setCabang([]);
            setFilteredCabang([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchCabang();
    }, [token, fetchCabang]);

    // Filter cabang based on search term
    useEffect(() => {
        const filtered = cabang.filter(branch =>
            branch.nama_cabang.toLowerCase().includes(searchTerm.toLowerCase()) ||
            branch.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
            branch.telepon.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCabang(filtered);
    }, [searchTerm, cabang]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setActionLoading(true);

        try {
            const res = await fetch(`${API_URL}/cabang`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newCabang),
            });

            if (res.status === 201) {
                setNewCabang({
                    nama_cabang: "",
                    alamat: "",
                    telepon: "",
                    password_cabang: "",
                });
                setShowAddForm(false);
                // Reload data without notification
                await fetchCabang();
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }

        setActionLoading(false);
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            const res = await fetch(`${API_URL}/cabang/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                // Reload data without notification
                await fetchCabang();
            }
        } catch (err) {
            console.error("Delete cabang error:", err);
        }
        setDeleteLoading(false);
        setShowConfirm(false);
        setDeleteId(null);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/cabang/${editCabang.id_cabang}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editCabang),
            });
            if (res.ok) {
                // Reload data without notification
                await fetchCabang();
                setEditCabang(null);
            }
        } catch (err) {
            console.error("Update cabang error:", err);
        }
        setActionLoading(false);
    };

    return (
        <motion.div
            className="space-y-6 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Kelola Cabang</h1>
                    <p className="text-gray-500 text-sm sm:text-base">
                        Kelola data cabang dan informasi kontak
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 self-start md:self-center">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari cabang..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border border-gray-300 text-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition w-full sm:w-64"
                            disabled={loading}
                        />
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => setShowAddForm(true)}
                        disabled={loading}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Cabang
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <LoadingState />
            ) : (
                <>
                    {/* Cabang Grid */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {filteredCabang.map((branch, index) => (
                            <motion.div
                                key={branch.id_cabang}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <Building2 className="w-5 h-5 text-red-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {branch.nama_cabang}
                                        </h3>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm">{branch.alamat}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm">{branch.telepon}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => setEditCabang(branch)}
                                        className="flex-1 py-2 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(branch.id_cabang)}
                                        className="flex-1 py-2 px-3 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Hapus
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Empty State */}
                    {filteredCabang.length === 0 && (
                        <motion.div 
                            className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                {searchTerm ? "Cabang tidak ditemukan" : "Belum ada cabang"}
                            </h3>
                            <p className="text-gray-500 text-sm mb-4">
                                {searchTerm 
                                    ? "Coba ubah kata kunci pencarian Anda"
                                    : "Mulai dengan menambahkan cabang pertama Anda"
                                }
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    Tambah Cabang Pertama
                                </button>
                            )}
                        </motion.div>
                    )}
                </>
            )}

            {/* Add Cabang Modal */}
            <CabangFormModal
                isOpen={showAddForm}
                onClose={() => setShowAddForm(false)}
                title="Tambah Cabang Baru"
                cabangData={newCabang}
                onChange={setNewCabang}
                onSubmit={handleAdd}
                loading={actionLoading}
            />

            {/* Edit Cabang Modal */}
            <CabangFormModal
                isOpen={!!editCabang}
                onClose={() => setEditCabang(null)}
                title="Edit Cabang"
                cabangData={editCabang || {}}
                onChange={setEditCabang}
                onSubmit={handleUpdate}
                loading={actionLoading}
                isEdit={true}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmDeletePopup
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
                loading={deleteLoading}
            />
        </motion.div>
    );
};

export default KelolaCabangPage;

//terakhir kali, revisi page setelah page kelola cabang
// ayo es em en ge te