import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, User, LoaderCircle, AlertTriangle, Mail, MapPin } from "lucide-react";
import { ConfirmDeletePopup, SuccessPopup } from "../../components/ui";
import Modal from "../../components/ui/Modal.jsx";
import KasirForm from "../../components/form/KasirForm.jsx";
import CardInfo from "../../components/ui/CardInfo.jsx";

const API_URL = "http://localhost:8000/api";

const KasirPage = () => {
    const [formData, setFormData] = useState({
        nama: "",
        email: "",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [kasir, setKasir] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingKasir, setEditingKasir] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const token = localStorage.getItem("token");
    const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
    const cabangId = cabang?.id_cabang;

    const fetchKasir = useCallback(async () => {
        if (!cabangId) {
            setError("Data cabang tidak ditemukan.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`${API_URL}/kasir`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const data = await res.json();
            if (data.status === 'success') {
                // Filter kasir only for current branch (backend should handle this, but double check)
                const filteredKasir = data.data.filter(k => k.id_cabang === cabangId);
                setKasir(filteredKasir);
            }
        } catch (err) {
            console.error("Failed to fetch kasir:", err);
            setError("Terjadi kesalahan saat mengambil data kasir.");
            setKasir([]);
        } finally {
            setLoading(false);
        }
    }, [token, cabangId]);

    useEffect(() => {
        if (token && cabangId) {
            fetchKasir();
        }
    }, [token, cabangId, fetchKasir]);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/kasir`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    // id_cabang will be automatically assigned by backend based on admin's branch
                }),
            });

            const data = await res.json();
            if (res.status === 201) {
                setSuccessMessage(data.message || "Kasir berhasil ditambahkan!");
                setShowSuccess(true);
                setFormData({ nama: "", email: "" });
                fetchKasir();
                setShowAddForm(false);
            } else {
                setError(data.message || "Gagal menambahkan kasir.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Terjadi kesalahan saat menambahkan kasir.");
        }
        setLoading(false);
    };

    const handleEdit = (kasir) => {
        setEditingKasir(kasir.id_user);
        setFormData({
            nama: kasir.nama,
            email: kasir.email,
        });
        setShowAddForm(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/kasir/${editingKasir}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMessage(data.message || "Kasir berhasil diupdate!");
                setShowSuccess(true);
                setEditingKasir(null);
                setFormData({ nama: "", email: "" });
                fetchKasir();
                setShowAddForm(false);
            } else {
                setError(data.message || "Gagal mengupdate kasir.");
            }
        } catch (err) {
            console.error("Update error:", err);
            setError("Terjadi kesalahan saat mengupdate kasir.");
        }
        setLoading(false);
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`${API_URL}/kasir/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setSuccessMessage("Kasir berhasil dihapus!");
                setShowSuccess(true);
                fetchKasir();
            } else {
                const data = await res.json();
                setError(data.message || "Gagal menghapus kasir.");
            }
        } catch (err) {
            console.error("Delete kasir error:", err);
            setError("Terjadi kesalahan saat menghapus kasir.");
        }
        setShowConfirm(false);
        setDeleteId(null);
    };

    const handleCloseModal = () => {
        setShowAddForm(false);
        setEditingKasir(null);
        setFormData({ nama: "", email: "" });
        setError(null);
    };

    return (
        <motion.div 
            className="p-6 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-gray-800">Kelola Kasir</h1>
                    <p className="text-gray-500 mt-1">
                        Manajemen akun kasir untuk cabang <strong>{cabang?.nama_cabang || 'N/A'}</strong>
                    </p>
                </motion.div>
                
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-gray-700 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-md"
                >
                    <Plus size={20} /> Tambah Kasir
                </button>
            </div>

            {/* Error State */}
            {error && (
                <motion.div 
                    className="p-5 bg-red-50 text-red-700 rounded-2xl border-2 border-red-200 flex items-start gap-3 shadow-md"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-lg mb-1">Terjadi Kesalahan</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <button 
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700"
                    >
                        ✕
                    </button>
                </motion.div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-md border border-gray-100">
                    <div className="text-center">
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            <LoaderCircle className="animate-spin h-6 w-6 mr-3" /> Memuat...
                        </div>
                    </div>
                </div>
            )}

            {/* Kasir Grid */}
            {!loading && !error && (
                <>
                    {kasir.length === 0 ? (
                        <motion.div 
                            className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-md border border-gray-100"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <User size={64} className="text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg font-medium">Belum ada kasir</p>
                            <p className="text-gray-400 text-sm mt-1">Klik "Tambah Kasir" untuk memulai</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            {kasir.map((kasirItem, index) => (
                                <CardInfo
                                    key={kasirItem.id_user}
                                    avatarIcon={<User size={36} className="text-white" />}
                                    avatarBg="bg-gray-700"
                                    title={kasirItem.nama}
                                    badge={kasirItem.cabang ? kasirItem.cabang.nama_cabang : cabang?.nama_cabang || "N/A"}
                                    badgeIcon={<MapPin size={12} />}
                                    items={[
                                        {
                                            icon: <Mail size={16} />,
                                            content: kasirItem.email
                                        },
                                    ]}
                                    onEdit={() => handleEdit(kasirItem)}
                                    onDelete={() => confirmDelete(kasirItem.id_user)}
                                    animateOnMount={false} 
                                />
                            ))}
                        </motion.div>
                    )}
                </>
            )}

            {/* Modal Add/Edit with Form Component */}
            <Modal 
                isOpen={showAddForm} 
                onClose={handleCloseModal}
                maxWidth="max-w-xl"
            >
                <KasirForm
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={editingKasir ? handleUpdate : handleSubmit}
                    loading={loading}
                    isEditing={!!editingKasir}
                    cabang={cabang}
                />
            </Modal>

            {/* Custom Popups */}
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
        </motion.div>
    );
};

export default KasirPage;