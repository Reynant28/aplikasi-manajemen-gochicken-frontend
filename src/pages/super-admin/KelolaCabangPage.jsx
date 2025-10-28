import { useState, useEffect, useCallback } from "react";
import { Plus, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { ConfirmDeletePopup, SuccessPopup } from "../../components/ui";
import Modal from "../../components/ui/Modal.jsx";
import CabangCard from "../../components/ui/Card/CabangCard.jsx";
import CabangForm from "../../components/ui/Form/CabangForm.jsx";

const API_URL = "http://localhost:8000/api";

const KelolaCabangPage = () => {
    const [loading, setLoading] = useState(false);
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
            const res = await fetch(`${API_URL}/cabang`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setCabang(data.data || []);
        } catch (err) {
            console.error("Failed to fetch cabang:", err);
            setCabang([]);
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
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-gray-800">Kelola Cabang</h1>
                    <p className="text-gray-500 mt-1">Manajemen data cabang dan lokasi</p>
                </motion.div>
                
                <motion.button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-gray-700 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Plus size={20} /> Tambah Cabang
                </motion.button>
            </div>

            {/* Cabang Grid */}
            {cabang.length === 0 && !loading ? (
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {cabang.map((branch, index) => (
                        <CabangCard
                            key={branch.id_cabang}
                            cabang={branch}
                            index={index}
                            onEdit={handleEdit}
                            onDelete={confirmDelete}
                        />
                    ))}
                </div>
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
        </div>
    );
};

export default KelolaCabangPage;