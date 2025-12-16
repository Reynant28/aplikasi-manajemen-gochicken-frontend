// src/pages/AkunAdminAdvertisingPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { ConfirmDeletePopup, SuccessPopup } from "../../components/ui";
import { useNotification } from "../../components/context/NotificationContext";

// 🆕 IMPOR KOMPONEN
import AdminAdvertisingList from "../../components/AkunAdminAdvertising/AdminAdvertisingList";
import AdminAdvertisingFormModal from "../../components/AkunAdminAdvertising/AdminAdvertisingFormModal";
import AdminStats from "../../components/AkunAdminAdvertising/AdminStats";
import AdminAdvertisingSearchFilter from "../../components/AkunAdminAdvertising/AdminAdvertisingSearchFilter"; // <--- Komponen Baru

const API_URL = "http://localhost:8000/api";

const BranchAdminPage = () => {
    const { addNotification } = useNotification();
    const [formData, setFormData] = useState({ nama: "", email: "", password: "", id_cabang: "" });
    const [actionLoading, setActionLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]); // State untuk data hasil filter
    const [cabang, setCabang] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteName, setDeleteName] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState(""); // State pencarian

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    // 🔴 LOGIKA THEME
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
    
    // 🔴 LOGIKA FILTER DATA (Pencarian di sisi client)
    useEffect(() => {
        if (!searchTerm) {
            setFilteredAdmins(admins);
        } else {
            const lowerSearch = searchTerm.toLowerCase();
            const filtered = admins.filter(admin => 
                admin.nama.toLowerCase().includes(lowerSearch) || 
                admin.email.toLowerCase().includes(lowerSearch) ||
                (admin.cabang?.nama_cabang || "").toLowerCase().includes(lowerSearch)
            );
            setFilteredAdmins(filtered);
        }
    }, [searchTerm, admins]);

    // 🔴 LOGIKA FETCH DATA
    const fetchAdmins = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/admin-cabang`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setAdmins(data.data || []);
            setFilteredAdmins(data.data || []); // Set awal filtered sama dengan semua data
        } catch (err) {
            setAdmins([]);
            setFilteredAdmins([]);
            addNotification(`Gagal memuat data admin. Cek koneksi server.`, 'error');
        }
    }, [token, addNotification]);

    const fetchCabang = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/cabang-without-admin`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setCabang(data.data || []);
        } catch (err) { setCabang([]); }
    }, [token]);

    const initialFetch = useCallback(async () => {
        setIsFetching(true);
        await Promise.all([fetchAdmins(), fetchCabang()]);
        setIsFetching(false);
    }, [fetchAdmins, fetchCabang]);

    useEffect(() => {
        if (token) initialFetch();
    }, [token, initialFetch]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // 🔴 LOGIKA SUBMIT FORM
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        const isEditing = !!editingAdmin;
        const adminName = formData.nama;
        const url = isEditing ? `${API_URL}/admin-cabang/${editingAdmin}` : `${API_URL}/create-admin-cabang`;
        const method = isEditing ? "PUT" : "POST";
        const actionText = isEditing ? "mengubah" : "menambahkan";
        
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(isEditing && !formData.password ? { ...formData, password: undefined } : formData),
            });
            const data = await res.json();
           if (res.ok) {
                const msg = isEditing 
                    ? `Berhasil mengubah data admin cabang: ${adminName}` 
                    : `Akun admin cabang berhasil dibuat: ${adminName}`;
                addNotification(msg, theme.name);
                setSuccessMessage(msg);
                setShowSuccess(true);
                closeModal();
                initialFetch();
            } else {
                addNotification(`Gagal ${actionText} admin: ${data.message || "Error."}`, 'error');
            }
        } catch (err) {
            addNotification(`Error koneksi saat ${actionText} admin.`, 'error');
        } finally {
            setActionLoading(false);
        }
    };
    
    // 🔴 LOGIKA DELETE
    const confirmDelete = (id, name) => {
        setDeleteId(id);
        setDeleteName(name);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        setShowConfirm(false);
        const nameToDelete = deleteName;
        try {
            const res = await fetch(`${API_URL}/admin-cabang/${deleteId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) {
                const msg = data.message || `Berhasil menghapus admin: ${nameToDelete}`;
                addNotification(msg, 'info');
                setSuccessMessage(msg);
                setShowSuccess(true);
                initialFetch();
            } else {
                addNotification(`Gagal menghapus admin '${nameToDelete}': ${data.message || "Error."}`, 'error');
            }
        } catch (err) {
            addNotification(`Error koneksi saat menghapus admin.`, 'error');
        }
        setDeleteId(null);
        setDeleteName("");
    };

    // 🔴 LOGIKA MODAL
    const openAddModal = () => {
        setEditingAdmin(null);
        setFormData({ nama: "", email: "", password: "", id_cabang: "" });
        setShowAddForm(true);
    };
    
    const openEditModal = (admin) => {
        setEditingAdmin(admin.id_user);
        setFormData({
            nama: admin.nama,
            email: admin.email,
            password: "", 
            id_cabang: admin.cabang?.id_cabang || "",
        });
        setShowAddForm(true);
    };

    const closeModal = () => {
        setShowAddForm(false);
        setEditingAdmin(null);
    };

    return (
        <div className={`min-h-screen p-6 bg-gradient-to-br ${theme.bgGradient}`}>
            
            {/* Header Section */}
            <motion.div 
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="mb-4 lg:mb-0">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Kelola Admin Cabang
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Kelola akun admin untuk setiap cabang
                    </p>
                </div>
                
                <button
                    onClick={openAddModal}
                    disabled={isFetching}
                    className={`flex items-center gap-2 ${theme.primaryBg} ${theme.primaryHoverBg} text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1`}
                >
                    <UserPlus size={20} /> 
                    <span className="font-semibold">Tambah Admin</span>
                </button>
            </motion.div>

            {/* Stats Card */}
            <AdminStats 
                adminCount={admins.length}
                emptyCabangCount={cabang.length}
                totalCabangCount={admins.length + cabang.length}
            />

            {/* 🆕 Search & Filter Component (Pembatas) */}
            <AdminAdvertisingSearchFilter 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                theme={theme}
            />

            {/* List Table (Menggunakan filteredAdmins agar pencarian berfungsi) */}
            <AdminAdvertisingList
                admins={filteredAdmins} 
                isFetching={isFetching}
                theme={theme}
                openEditModal={openEditModal}
                confirmDelete={confirmDelete}
            />

            {/* Form Modal */}
            <AdminAdvertisingFormModal
                showAddForm={showAddForm}
                editingAdmin={editingAdmin}
                formData={formData}
                cabang={cabang}
                theme={theme}
                actionLoading={actionLoading}
                closeModal={closeModal}
                handleChange={handleChange}
                handleFormSubmit={handleFormSubmit}
            />
            
            {/* Popups */}
            <ConfirmDeletePopup isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message={`Anda yakin ingin menghapus admin: ${deleteName}? Tindakan ini tidak dapat dibatalkan.`} />
            <SuccessPopup isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Aksi Berhasil! 🎉" message={successMessage} type={user?.role} />
        </div>
    );
};

export default BranchAdminPage;