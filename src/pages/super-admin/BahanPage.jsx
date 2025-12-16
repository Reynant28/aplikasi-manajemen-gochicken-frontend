// src/pages/BahanPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { ConfirmDeletePopup, SuccessPopup } from "../../components/ui";
import { useNotification } from "../../components/context/NotificationContext";

// 🆕 IMPOR KOMPONEN BARU
import BahanBakuStats from "../../components/BahanBaku/BahanBakuStats";
import BahanBakuSearchBar from "../../components/BahanBaku/BahanBakuSearchBar";
import BahanBakuList from "../../components/BahanBaku/BahanBakuList";
import BahanBakuFormModal from "../../components/BahanBaku/BahanBakuFormModal";

const API_URL = "http://localhost:8000/api";

// Helper function formatRupiah tetap di page jika tidak digunakan di banyak tempat
// Tapi karena format Rupiah juga digunakan di Stats dan List, kita bisa hapus di sini
// dan pastikan sudah di-import/copy ke komponen yang membutuhkannya.

const BahanPage = () => {
  const { addNotification } = useNotification();
  const [bahanList, setBahanList] = useState([]);
  const [filteredBahan, setFilteredBahan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nama_bahan: "",
    jumlah_stok: 0, // Ubah ke 0 untuk konsistensi
    satuan: "",
    harga_satuan: "",
  });
  const [editBahan, setEditBahan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // 🔴 LOGIKA THEME
  const getThemeColors = (role) => {
    if (role === "super admin") {
      return {
        name: "super admin",
        bgGradient: "from-orange-50 via-white to-orange-100",
        primaryText: "text-orange-700",
        primaryAccent: "text-orange-600",
        primaryBg: "bg-orange-600",
        primaryHoverBg: "hover:bg-orange-700",
        modalBorder: "border-orange-600",
        focusRing: "focus:ring-orange-400",
        cardGradient: "from-orange-500 to-orange-600",
      };
    }
    return {
      name: "admin cabang",
      bgGradient: "from-red-50 via-white to-red-100",
      primaryText: "text-red-700",
      primaryAccent: "text-red-600",
      primaryBg: "bg-red-600",
      primaryHoverBg: "hover:bg-red-700",
      modalBorder: "border-red-600",
      focusRing: "focus:ring-red-400",
      cardGradient: "from-red-500 to-red-600",
    };
  };

  const theme = getThemeColors(user?.role);

  // 🔴 LOGIKA FILTER/SEARCH
  useEffect(() => {
    if (searchTerm) {
      const filtered = bahanList.filter(
        (item) =>
          item.nama_bahan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.satuan.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBahan(filtered);
    } else {
      setFilteredBahan(bahanList);
    }
  }, [bahanList, searchTerm]);

  // 🔴 LOGIKA FETCH DATA
  const fetchBahan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bahan-baku`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBahanList(data.data || []);
    } catch (err) {
      setBahanList([]);
      addNotification("Gagal memuat data bahan baku.", "error");
    } finally {
      setLoading(false);
    }
  }, [token, addNotification]);

  useEffect(() => {
    if (token) fetchBahan();
  }, [token, fetchBahan]);

  // 🔴 LOGIKA SUBMIT FORM (CREATE/UPDATE)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const isEditing = !!editBahan;
    const payload = isEditing ? editBahan : formData;
    const bahanName = payload.nama_bahan;
    const url = isEditing
      ? `${API_URL}/bahan-baku/${editBahan.id_bahan_baku}`
      : `${API_URL}/bahan-baku`;
    const method = isEditing ? "PUT" : "POST";
    const actionText = isEditing ? "mengubah" : "menambah";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        const msg =
          data.message ||
          `Bahan baku ${bahanName} berhasil di${
            isEditing ? "update" : "tambahkan"
          }!`;
        addNotification(
          `Berhasil ${actionText} bahan: ${bahanName}`,
          "success",
          "Bahan Baku",
          isEditing ? "update" : "create"
        );

        setSuccessMessage(msg);
        setShowSuccess(true);
        closeModal(); // Panggil fungsi closeModal
        fetchBahan();
      } else {
        addNotification(
          `Gagal ${actionText} bahan: ${data.message || "Error"}`,
          "error"
        );
      }
    } catch (err) {
      addNotification(`Error koneksi saat ${actionText} bahan.`, "error");
    }
    setActionLoading(false);
  };

  // 🔴 LOGIKA DELETE
  const confirmDelete = (id) => {
    const item = bahanList.find((b) => b.id_bahan_baku === id);
    if (item) {
      setDeleteId(id);
      setDeleteName(item.nama_bahan);
      setShowConfirm(true);
    }
  };

  const handleDelete = async () => {
    const nameToDelete = deleteName;
    try {
      const res = await fetch(`${API_URL}/bahan-baku/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(
          `Berhasil menghapus bahan: ${nameToDelete}`,
          "info",
          "Bahan Baku",
          "delete"
        );
        setSuccessMessage(
          data.message || `Bahan ${nameToDelete} berhasil dihapus!`
        );
        setShowSuccess(true);
        fetchBahan();
      } else {
        addNotification(
          `Gagal menghapus bahan: ${data.message || "Error"}`,
          "error",
          "Bahan Baku",
          "delete"
        );
      }
    } catch (err) {
      addNotification(`Error koneksi saat menghapus bahan.`, "error");
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  // 🔴 LOGIKA MODAL
  const openAddModal = () => {
    setFormData({ nama_bahan: "", jumlah_stok: 0, satuan: "", harga_satuan: "" });
    setEditBahan(null);
    setShowForm(true);
  };

  const openEditModal = (bahan) => {
    setEditBahan(bahan);
    setShowForm(true);
  };

  const closeModal = () => {
    setShowForm(false);
    setEditBahan(null);
  };

  // 🔴 LOGIKA STATS
  const totalBahan = bahanList.length;
  const lowStockBahan = bahanList.filter((item) => item.jumlah_stok < 5).length;
  const totalValue = bahanList.reduce(
    (sum, item) => sum + item.harga_satuan * item.jumlah_stok,
    0
  );

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 bg-gradient-to-br ${theme.bgGradient}`}
    >
      {/* Header Section */}
      <motion.div
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-4 lg:mb-0">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Manajemen Bahan Baku
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Kelola dan atur semua bahan baku yang terdaftar
          </p>
        </div>

        <button
          onClick={openAddModal}
          className={`flex items-center gap-2 ${theme.primaryBg} ${theme.primaryHoverBg} text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl`}
        >
          <Plus size={18} />
          <span className="font-semibold">Tambah Bahan</span>
        </button>
      </motion.div>

      {/* 🆕 Stats Cards */}
      <BahanBakuStats
        totalBahan={totalBahan}
        lowStockBahan={lowStockBahan}
        totalValue={totalValue}
      />

      {/* 🆕 Search Section */}
      <BahanBakuSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onReset={() => setSearchTerm("")}
      />

      {/* 🆕 Bahan List - Grid Layout untuk Mobile, Table untuk Desktop */}
      <BahanBakuList
        filteredBahan={filteredBahan}
        bahanList={bahanList}
        loading={loading}
        openAddModal={openAddModal}
        openEditModal={openEditModal}
        confirmDelete={confirmDelete}
        theme={theme}
      />

      {/* 🆕 Modal Form (Pindah ke Komponen) */}
      <BahanBakuFormModal
        showForm={showForm}
        editBahan={editBahan}
        formData={formData}
        setEditBahan={setEditBahan}
        setFormData={setFormData}
        handleFormSubmit={handleFormSubmit}
        closeModal={closeModal}
        actionLoading={actionLoading}
        theme={theme}
      />

      {/* Popups (Tetap di Page) */}
      <ConfirmDeletePopup
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        message={`Anda yakin ingin menghapus bahan baku: ${deleteName}?`}
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

export default BahanPage;