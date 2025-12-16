// src/pages/KelolaCabangPage.jsx
import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNotification } from "../../components/context/NotificationContext";
import { ConfirmDeletePopup, SuccessPopup } from "../../components/ui";

// 🆕 IMPOR KOMPONEN BARU
import CabangStats from "../../components/KelolaCabang/CabangStats";
import CabangSearchFilter from "../../components/KelolaCabang/CabangSearchFilter";
import CabangList from "../../components/KelolaCabang/CabangList";
import CabangFormModal from "../../components/KelolaCabang/CabangFormModal";

const API_URL = "http://localhost:8000/api";

const KelolaCabangPage = () => {
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [cabang, setCabang] = useState([]);
    const [filteredCabang, setFilteredCabang] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [newCabang, setNewCabang] = useState({ 
        nama_cabang: "", 
        alamat: "", 
        telepon: "", 
        password_cabang: "" 
    });
    const [editCabang, setEditCabang] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteName, setDeleteName] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    
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
                modalBorder: 'border-orange-600',
                focusRing: 'focus:ring-orange-400',
                closeButton: 'text-orange-500 hover:bg-orange-100',
            };
        }
        return {
            name: 'admin cabang',
            bgGradient: 'from-red-50 via-white to-red-100',
            primaryText: 'text-red-700',
            primaryAccent: 'text-red-600',
            primaryBg: 'bg-red-600',
            primaryHoverBg: 'hover:bg-red-700',
            modalBorder: 'border-red-600',
            focusRing: 'focus:ring-red-400',
            closeButton: 'text-red-500 hover:bg-red-100',
        };
    };

    const theme = getThemeColors(user?.role);

    // --- FETCH DATA ---
    const fetchCabang = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/cabang`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            const data = await res.json();
            setCabang(data.data || []);
            setFilteredCabang(data.data || []);
        } catch (err) {
            setCabang([]);
            addNotification(`Gagal memuat data cabang. Cek koneksi server.`, 'error');
        } finally {
            setLoading(false);
        }
    }, [token, addNotification]);

    useEffect(() => {
        if (token) fetchCabang();
    }, [token, fetchCabang]);

    // --- FILTER LOGIC ---
    useEffect(() => {
        if (!searchTerm) {
            setFilteredCabang(cabang);
        } else {
            const lower = searchTerm.toLowerCase();
            const filtered = cabang.filter(c => 
                c.nama_cabang.toLowerCase().includes(lower) ||
                c.alamat.toLowerCase().includes(lower) ||
                c.telepon.toLowerCase().includes(lower)
            );
            setFilteredCabang(filtered);
        }
    }, [searchTerm, cabang]);

    // --- CRUD HANDLERS ---
    const handleAdd = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        const cabangName = newCabang.nama_cabang;

        if (newCabang.password_cabang.length < 6) {
            addNotification(`Password harus minimal 6 karakter`, 'error');
            setActionLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/cabang`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(newCabang),
            });
            const data = await res.json();
            if (res.status === 201) {
                addNotification(`Berhasil menambah cabang: ${cabangName}`, 'success');
                setSuccessMessage(data.message || `Cabang ${cabangName} berhasil ditambahkan!`);
                setShowSuccess(true);
                setNewCabang({ nama_cabang: "", alamat: "", telepon: "", password_cabang: "" });
                setShowAddForm(false);
                fetchCabang();
            } else {
                addNotification(`Gagal menambah cabang '${cabangName}': ${data.message || "Error."}`, 'error');
            }
        } catch (err) {
            addNotification(`Error koneksi saat menambah cabang.`, 'error');
        }
        setActionLoading(false);
    };

    const confirmDelete = (id) => {
        const itemToDelete = cabang.find(c => c.id_cabang === id);
        setDeleteId(id);
        setDeleteName(itemToDelete?.nama_cabang || `ID ${id}`);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        setShowConfirm(false);
        const nameToDelete = deleteName;
        try {
            const res = await fetch(`${API_URL}/cabang/${deleteId}`, { 
                method: "DELETE", 
                headers: { Authorization: `Bearer ${token}` } 
            });
            const data = await res.json();
            if (res.ok) {
                addNotification(`Berhasil menghapus cabang: ${nameToDelete}`, 'info');
                setSuccessMessage(data.message || `Cabang ${nameToDelete} berhasil dihapus!`);
                setShowSuccess(true);
                fetchCabang();
            } else {
                addNotification(`Gagal menghapus cabang '${nameToDelete}': ${data.message || "Error."}`, 'error');
            }
        } catch (err) {
            addNotification(`Error koneksi saat menghapus cabang.`, 'error');
        }
        setDeleteId(null);
        setDeleteName("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editCabang) return;
        setActionLoading(true);
        const updatedName = editCabang.nama_cabang;

        if (editCabang.password_cabang && editCabang.password_cabang.length < 6) {
            addNotification(`Password harus minimal 6 karakter`, 'error');
            setActionLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/cabang/${editCabang.id_cabang}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(editCabang),
            });
            const data = await res.json();
            if (res.ok) {
                addNotification(`Berhasil mengubah data cabang: ${updatedName}`, 'info');
                setSuccessMessage(data.message || `Cabang ${updatedName} berhasil diupdate!`);
                setShowSuccess(true);
                await fetchCabang();
                setEditCabang(null);
            } else {
                addNotification(`Gagal mengubah cabang '${updatedName}': ${data.message || "Error."}`, 'error');
            }
        } catch (err) {
            addNotification(`Error koneksi saat mengubah data cabang.`, 'error');
        }
        setActionLoading(false);
    };

    return (
        <div className={`min-h-screen p-6 bg-gradient-to-br ${theme.bgGradient}`}>
            {/* Header Section */}
            <motion.div 
                className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6"
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Kelola Cabang</h1>
                    <p className="text-gray-500 mt-1">Kelola dan atur semua cabang yang terdaftar</p>
                </div>
                
                <motion.button 
                    onClick={() => setShowAddForm(true)} 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center justify-center gap-2 ${theme.primaryBg} ${theme.primaryHoverBg} text-white px-5 py-2.5 rounded-lg shadow hover:shadow-md transition-all duration-300 font-semibold`} 
                    disabled={loading}
                >
                    <Plus size={20} /> Tambah Cabang
                </motion.button>
            </motion.div>

            {/* Stats Card */}
            <CabangStats totalCabang={cabang.length} theme={theme} />

            {/* Search & Filter */}
            <CabangSearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} theme={theme} />

            {/* List Data */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className={`w-8 h-8 ${theme.primaryAccent} animate-spin`} />
                    <p className="ml-3 text-lg text-gray-600 font-medium">Memuat data cabang...</p>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <CabangList 
                        cabang={filteredCabang} 
                        loading={loading} 
                        theme={theme} 
                        setEditCabang={setEditCabang} 
                        confirmDelete={confirmDelete} 
                    />
                </motion.div>
            )}

            {/* Form Modal */}
            <CabangFormModal 
                showAddForm={showAddForm} 
                editCabang={editCabang} 
                setEditCabang={setEditCabang} 
                setShowAddForm={setShowAddForm} 
                formData={newCabang} 
                setFormData={setNewCabang} 
                theme={theme} 
                actionLoading={actionLoading} 
                handleAdd={handleAdd} 
                handleUpdate={handleUpdate} 
            />

            {/* Popups */}
            <ConfirmDeletePopup 
                isOpen={showConfirm} 
                onClose={() => setShowConfirm(false)} 
                onConfirm={handleDelete} 
                message={`Anda yakin ingin menghapus cabang: ${deleteName}? Tindakan ini tidak dapat dibatalkan.`} 
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

export default KelolaCabangPage;