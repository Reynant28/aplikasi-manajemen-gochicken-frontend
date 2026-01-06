import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Shield, LoaderCircle, AlertTriangle, User, Mail } from "lucide-react";
import { ConfirmDeletePopup, SuccessPopup } from "../../components/ui";
import Modal from "../../components/ui/Modal.jsx";
import AdminCabangForm from "../../components/branch-admin/BranchAdminForm.jsx";
import CardInfo from "../../components/ui/CardInfo.jsx";
import { set } from "date-fns";

const API_URL = "http://localhost:8000/api";

const BranchAdminPage = () => {
    const [formData, setFormData] = useState({
        nama: "",
        email: "",
        password: "",
        id_cabang: "",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [cabang, setCabang] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const token = localStorage.getItem("token");

    // Fetch admins data

    const fetchAdmins = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`${API_URL}/admin-cabang`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setAdmins(data.data || []);
        } catch (err) {
            console.error("Failed to fetch admins:", err);
            setError("Terjadi kesalahan saat mengambil data admin.");
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Fetch cabang data

    const fetchCabang = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`${API_URL}/cabang-without-admin`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setCabang(data.data || []);
        } catch (err) {
            console.error("Failed to fetch cabang:", err);
            setError("Terjadi kesalahan saat mengambil data cabang.");
            setCabang([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchAdmins();
            fetchCabang();
        }
    }, [token, fetchAdmins, fetchCabang]);

    // Handling form changes and submissions

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/create-admin-cabang`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.status === 201) {
                setSuccessMessage(data.message || "Admin cabang berhasil ditambahkan!");
                setShowSuccess(true);
                setFormData({ nama: "", email: "", password: "", id_cabang: "" });
                fetchAdmins();
                fetchCabang();
                setShowAddForm(false);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
        setLoading(false);
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin.id_user);
        setFormData({
            nama: admin.nama,
            email: admin.email,
            password: "",
            id_cabang: admin.cabang?.id_cabang || "",
        });
        setShowAddForm(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/admin-cabang/${editingAdmin}`, {
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
                setSuccessMessage(data.message || "Admin cabang berhasil diupdate!");
                setShowSuccess(true);
                setEditingAdmin(null);
                setFormData({ nama: "", email: "", password: "", id_cabang: "" });
                fetchAdmins();
                fetchCabang();
                setShowAddForm(false);
            }
        } catch (err) {
            console.error("Update error:", err);
        }
        setLoading(false);
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`${API_URL}/admin-cabang/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setSuccessMessage("Admin cabang berhasil dihapus!");
                setShowSuccess(true);
                fetchAdmins();
                fetchCabang();
            }
        } catch (err) {
            console.error("Delete admin error:", err);
        }
        setShowConfirm(false);
        setDeleteId(null);
    };

    const handleCloseModal = () => {
        setShowAddForm(false);
        setEditingAdmin(null);
        setFormData({ nama: "", email: "", password: "", id_cabang: "" });
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
                    <h1 className="text-3xl font-bold text-gray-800">Kelola Admin Cabang</h1>
                    <p className="text-gray-500 mt-1">Manajemen akun administrator cabang</p>
                </motion.div>

                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-gray-700 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-md"
                >
                    <Plus size={20} /> Tambah Admin
                </button>
            </div>

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

            {/* Error State */}
            {error && !loading && (
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
                </motion.div>
            )}

            {/* Admin Grid */}
            {!loading && !error && (
                <>
                    {admins.length === 0 ? (
                        <motion.div
                            className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-md border border-gray-100"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Shield size={64} className="text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg font-medium">Belum ada admin cabang</p>
                            <p className="text-gray-400 text-sm mt-1">Klik "Tambah Admin" untuk memulai</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            {admins.map((admin, index) => (
                                <CardInfo
                                    key={admin.id_user}
                                    avatarIcon={<User size={36} className="text-white" />}
                                    avatarBg="bg-gray-700"
                                    title={admin.nama}
                                    badge={admin.cabang ? admin.cabang.nama_cabang : "N/A"}
                                    items={[
                                        {
                                            icon: <Mail size={16} />,
                                            content: admin.email
                                        },
                                    ]}
                                    onEdit={() => handleEdit(admin)}
                                    onDelete={() => confirmDelete(admin.id_user)}
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
                <AdminCabangForm
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={editingAdmin ? handleUpdate : handleSubmit}
                    loading={loading}
                    cabang={cabang}
                    isEditing={!!editingAdmin}
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

export default BranchAdminPage;