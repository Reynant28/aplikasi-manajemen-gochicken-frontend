import { useState, useEffect, useCallback } from "react";
import { Plus, Building2, LoaderCircle, User, AlertTriangle, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { ConfirmDeletePopup, SuccessPopup } from "../../components/ui";
import Modal from "../../components/ui/Modal.jsx";
import CardInfo from "../../components/ui/CardInfo.jsx";
import CabangForm from "../../components/cabang/CabangForm.jsx";

const API_URL = "http://localhost:8000/api";

const KelolaCabangPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cabang, setCabang] = useState([]);
    const [formData, setFormData] = useState({
        nama_cabang: "",
        alamat: "",
        telepon: "",
        password_cabang: "",
    });
    const [editCabang, setEditCabang] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const token = localStorage.getItem("token");

    const fetchCabang = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`${API_URL}/cabang`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setCabang(data.data || []);
        } catch (err) {
            console.error("Failed to fetch cabang:", err);
            setCabang([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchCabang();
    }, [token, fetchCabang]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/cabang`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.status === 201) {
                setSuccessMessage(data.message || "Cabang berhasil ditambahkan!");
                setShowSuccess(true);
                setFormData({
                    nama_cabang: "",
                    alamat: "",
                    telepon: "",
                    password_cabang: "",
                });
                setShowAddForm(false);
                fetchCabang();
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
        setLoading(false);
    };

    const handleEdit = (cabang) => {
        setEditCabang(cabang);
        setFormData({
            nama_cabang: cabang.nama_cabang,
            alamat: cabang.alamat,
            telepon: cabang.telepon,
            password_cabang: "",
        });
        setShowAddForm(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/cabang/${editCabang.id_cabang}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            
            const data = await res.json();
            if (res.ok) {
                setSuccessMessage(data.message || `Cabang ${formData.nama_cabang} berhasil diupdate!`);
                setShowSuccess(true);
                await fetchCabang();
                setEditCabang(null);
                setShowAddForm(false);
                setFormData({
                    nama_cabang: "",
                    alamat: "",
                    telepon: "",
                    password_cabang: "",
                });
            }
        } catch (err) {
            console.error("Update cabang error:", err);
        }
        setLoading(false);
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`${API_URL}/cabang/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setSuccessMessage("Cabang berhasil dihapus!");
                setShowSuccess(true);
                fetchCabang();
            }
        } catch (err) {
            console.error("Delete cabang error:", err);
        }
        setShowConfirm(false);
        setDeleteId(null);
    };

    const handleCloseModal = () => {
        setShowAddForm(false);
        setEditCabang(null);
        setFormData({
            nama_cabang: "",
            alamat: "",
            telepon: "",
            password_cabang: "",
        });
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
                    <h1 className="text-3xl font-bold text-gray-800">Kelola Cabang</h1>
                    <p className="text-gray-500 mt-1">Manajemen data cabang dan lokasi</p>
                </motion.div>
                
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-gray-700 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Plus size={20} /> Tambah Cabang
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

            {/* Cabang Grid */}
            {!loading && !error && (
                <>
                {cabang.length === 0 ? (
                    <motion.div 
                        className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-md border border-gray-100"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Building2 size={64} className="text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">Belum ada cabang</p>
                        <p className="text-gray-400 text-sm mt-1">Klik "Tambah Cabang" untuk memulai</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                    
                        {cabang.map((branch) => (
                            <CardInfo
                                key={branch.id_cabang}
                                avatarIcon={<User size={36} className="text-white" />}
                                avatarBg="bg-gray-700"
                                title={branch.nama_cabang}
                                
                                items={[
                                {
                                    icon: <MapPin size={16} />,
                                    content: branch.alamat
                                },
                                {
                                    icon: <Phone size={16} />,
                                    content: branch.telepon
                                }
                                ]}
                                onEdit={() => handleEdit(branch)}
                                onDelete={() => confirmDelete(branch.id_cabang)}
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
                <CabangForm
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={editCabang ? handleUpdate : handleAdd}
                    loading={loading}
                    isEditing={!!editCabang}
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

export default KelolaCabangPage;