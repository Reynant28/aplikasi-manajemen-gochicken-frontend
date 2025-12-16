// src/pages/KaryawanPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Loader2, 
  Users,
  Building,
  Filter, // Tambahkan Filter agar ikon di Header Stat bisa muncul
  Search // Tambahkan Search agar ikon di Header Search bisa muncul
} from "lucide-react";
import { ConfirmDeletePopup, SuccessPopup } from "../../components/ui";
import { useNotification } from "../../components/context/NotificationContext";

// 🆕 IMPOR KOMPONEN BARU
import KaryawanStats from "../../components/karyawan/KaryawanStats";
import KaryawanSearchFilter from "../../components/karyawan/KaryawanSearchFilter";
import KaryawanList from "../../components/karyawan/KaryawanList";
import KaryawanFormModal from "../../components/karyawan/KaryawanFormModal";

const API_URL = "http://localhost:8000/api";

// --- Helper Functions (DITINGGALKAN DI PAGE) ---
const formatRupiah = (angka) => {
  if (angka === null || angka === undefined || angka === '') return "Rp 0";
  let numberString = String(angka);
  if (numberString.includes(',')) {
    numberString = numberString.replace(',', '.');
  }
  
  const numberValue = parseFloat(numberString);
  
  if (isNaN(numberValue)) return "Rp 0";
  
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numberValue);
};

const formatGajiInput = (value) => {
  if (!value) return '';
  
  let cleanValue = String(value).replace(/[^\d.,]/g, '');
  
  cleanValue = cleanValue.replace(',', '.');
  
  return cleanValue;
};

const parseGajiInput = (value) => {
  if (!value) return '';
  
  let cleanValue = String(value).replace(/[^\d.,]/g, '');
  
  cleanValue = cleanValue.replace(',', '.');
  
  return cleanValue;
};
// --- AKHIR HELPER FUNCTIONS ---

const KaryawanPage = () => {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [karyawan, setKaryawan] = useState([]);
  const [filteredKaryawan, setFilteredKaryawan] = useState([]);
  const [cabang, setCabang] = useState([]);
  const [newKaryawan, setNewKaryawan] = useState({ 
    id_cabang: "", 
    nama_karyawan: "", 
    alamat: "", 
    telepon: "", 
    gaji: "" 
  });
  const [editKaryawan, setEditKaryawan] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCabang, setFilterCabang] = useState("");
  
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
        primaryBorder: 'border-orange-200',
        modalBorder: 'border-orange-600',
        focusRing: 'focus:ring-orange-400',
        closeButton: 'text-orange-500 hover:bg-orange-100',
        cardGradient: 'from-orange-500 to-orange-600',
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
      closeButton: 'text-red-500 hover:bg-red-100',
      cardGradient: 'from-red-500 to-red-600',
    };
  };

  const theme = getThemeColors(user?.role);

  // 🔴 LOGIKA FILTER KARYAWAN
  useEffect(() => {
    let filtered = karyawan;
    
    if (searchTerm) {
      filtered = filtered.filter(k => 
        k.nama_karyawan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.telepon.includes(searchTerm) ||
        k.cabang?.nama_cabang.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterCabang) {
      filtered = filtered.filter(k => k.id_cabang === parseInt(filterCabang));
    }
    
    setFilteredKaryawan(filtered);
  }, [karyawan, searchTerm, filterCabang]);

  // 🔴 LOGIKA FETCH DATA
  const fetchKaryawan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/karyawan`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      setKaryawan(data.data || []);
      // Pastikan filteredKaryawan juga di-set di sini jika karyawan diupdate
      setFilteredKaryawan(data.data || []); 
    } catch (err) {
      setKaryawan([]);
      setFilteredKaryawan([]);
      addNotification(
        "Gagal memuat data karyawan. Cek koneksi server.", 
        "error",
        "Karyawan",
        "fetch"
      );
    } finally {
      setLoading(false);
    }
  }, [token, addNotification]);

  const fetchCabang = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/cabang`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      setCabang(data.data || []);
    } catch (err) { 
      setCabang([]); 
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchKaryawan();
      fetchCabang();
    }
  }, [token, fetchKaryawan, fetchCabang]);

  // 🔴 LOGIKA CREATE
  const handleAdd = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const karyawanName = newKaryawan.nama_karyawan;
    
    try {
      const res = await fetch(`${API_URL}/karyawan`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newKaryawan),
      });
      const data = await res.json();
      
      if (res.status === 201) {
        const msg = data.message || `Karyawan ${karyawanName} berhasil ditambahkan!`;
        addNotification(
          `Berhasil menambah karyawan: ${karyawanName}`,
          "success", 
          "Karyawan",
          "create"
        );
        setSuccessMessage(msg);
        setShowSuccess(true);
        setNewKaryawan({ 
          id_cabang: "", 
          nama_karyawan: "", 
          alamat: "", 
          telepon: "", 
          gaji: "" 
        });
        setShowAddForm(false);
        fetchKaryawan();
      } else {
        addNotification(
          `Gagal menambah karyawan '${karyawanName}': ${data.message || "Error."}`, 
          "error",
          "Karyawan",
          "create"
        );
      }
    } catch (err) {
      addNotification(
        "Error koneksi saat menambah karyawan.", 
        "error",
        "Karyawan",
        "create"
      );
    }
    setActionLoading(false);
  };

  // 🔴 LOGIKA DELETE
  const confirmDelete = (id) => {
    const itemToDelete = karyawan.find(k => k.id_karyawan === id);
    setDeleteId(id);
    setDeleteName(itemToDelete?.nama_karyawan || `ID ${id}`);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    setShowConfirm(false);
    const nameToDelete = deleteName;
    
    try {
      const res = await fetch(`${API_URL}/karyawan/${deleteId}`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      
      if (res.ok) {
        const msg = data.message || `Karyawan ${nameToDelete} berhasil dihapus!`;
        addNotification(
          `Berhasil menghapus karyawan: ${nameToDelete}`,
          "info",
          "Karyawan",
          "delete"
        );
        setSuccessMessage(msg);
        setShowSuccess(true);
        fetchKaryawan();
      } else {
        addNotification(
          `Gagal menghapus karyawan '${nameToDelete}': ${data.message || "Error."}`, 
          "error",
          "Karyawan",
          "delete"
        );
      }
    } catch (err) {
      addNotification(
        "Error koneksi saat menghapus karyawan.", 
        "error",
        "Karyawan",
        "delete"
      );
    }
    
    setDeleteId(null);
    setDeleteName("");
  };

  // 🔴 LOGIKA UPDATE
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Pastikan gaji di editKaryawan diparsing sebelum dikirim (sesuai logic asli Anda)
    const payload = {
      ...editKaryawan,
      gaji: parseGajiInput(editKaryawan.gaji)
    };
    
    if (!editKaryawan) return;
    
    setActionLoading(true);
    const updatedName = editKaryawan.nama_karyawan;
    
    try {
      const res = await fetch(`${API_URL}/karyawan/${editKaryawan.id_karyawan}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload), // Gunakan payload dengan gaji yang sudah di-parse
      });
      const data = await res.json();
      
      if (res.ok) {
        const msg = data.message || `Karyawan ${updatedName} berhasil diupdate!`;
        addNotification(
          `Berhasil mengubah data karyawan: ${updatedName}`,
          "success",
          "Karyawan", 
          "update"
        );
        setSuccessMessage(msg);
        setShowSuccess(true);
        await fetchKaryawan();
        setEditKaryawan(null);
      } else {
        addNotification(
          `Gagal mengubah karyawan '${updatedName}': ${data.message || "Error."}`, 
          "error",
          "Karyawan",
          "update"
        );
      }
    } catch (err) {
      addNotification(
        "Error koneksi saat mengubah data karyawan.", 
        "error",
        "Karyawan",
        "update"
      );
    }
    setActionLoading(false);
  };

  // 🔴 LOGIKA FILTER RESET
  const resetFilters = () => {
    setSearchTerm("");
    setFilterCabang("");
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
              Kelola Karyawan
          </h1>
          <p className="text-gray-600">
            Kelola data karyawan dan informasi cabang
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(true)} 
          className={`flex items-center gap-2 ${theme.primaryBg} ${theme.primaryHoverBg} text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1`}
          disabled={loading}
        >
          <Plus size={20} /> 
          <span className="font-semibold">Tambah Karyawan</span>
        </button>
      </motion.div>

      {/* 🆕 Stats Cards */}
      <KaryawanStats
        karyawanCount={karyawan.length}
        cabangCount={cabang.length}
        filteredCount={filteredKaryawan.length}
        searchTerm={searchTerm}
        filterCabang={filterCabang}
        theme={theme}
      />

      {/* 🆕 Search and Filter Section */}
      <KaryawanSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCabang={filterCabang}
        setFilterCabang={setFilterCabang}
        cabangList={cabang}
        resetFilters={resetFilters}
        theme={theme}
      />

      {/* 🆕 Karyawan List / Loading / Empty State */}
      <KaryawanList
        filteredKaryawan={filteredKaryawan}
        karyawanCount={karyawan.length}
        loading={loading}
        theme={theme}
        setShowAddForm={setShowAddForm}
        setEditKaryawan={setEditKaryawan}
        confirmDelete={confirmDelete}
        formatRupiah={formatRupiah} // Pass helper function
      />

      {/* 🆕 Add/Edit Modal */}
      <KaryawanFormModal
        showAddForm={showAddForm}
        editKaryawan={editKaryawan}
        newKaryawan={newKaryawan}
        cabangList={cabang}
        actionLoading={actionLoading}
        theme={theme}
        setShowAddForm={setShowAddForm}
        setEditKaryawan={setEditKaryawan}
        setNewKaryawan={setNewKaryawan}
        handleAdd={handleAdd}
        handleUpdate={handleUpdate}
        formatRupiah={formatRupiah}
        formatGajiInput={formatGajiInput}
        parseGajiInput={parseGajiInput}
      />

      {/* Popups (Tetap di Page) */}
      <ConfirmDeletePopup 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)} 
        onConfirm={handleDelete} 
        message={`Anda yakin ingin menghapus karyawan: ${deleteName}? Aksi ini tidak dapat dibatalkan.`} 
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

export default KaryawanPage;