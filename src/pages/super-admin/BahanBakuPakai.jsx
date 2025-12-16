// src/pages/BahanBakuHarianPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "../../components/ui";
import { useNotification } from "../../components/context/NotificationContext";

// 🆕 IMPOR KOMPONEN BARU
import BahanBakuPakaiForm from "../../components/BahanBakuPakai/BahanBakuPakaiForm";
import BahanBakuPakaiTable from "../../components/BahanBakuPakai/BahanBakuPakaiTable";
import BahanBakuPakaiDeleteConfirm from "../../components/BahanBakuPakai/BahanBakuPakaiDeleteConfirm";
import AlertPopup from "../../components/ui/AlertPopup";

const API_URL = "http://localhost:8000/api";

export default function BahanBakuHarianPage() {
  const { addNotification } = useNotification();
  const [tanggal, setTanggal] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [pemakaianList, setPemakaianList] = useState([]);
  const [bahanList, setBahanList] = useState([]);
  const [newPemakaian, setNewPemakaian] = useState({
    id_bahan_baku: "",
    jumlah_pakai: "",
    catatan: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, message: "" });
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    id: null,
    name: "",
  });
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // 🔴 LOGIKA THEME (Sama seperti PengeluaranPage & BranchAdminPage)
  const getThemeColors = (role) => {
    if (role === 'super admin') {
      return {
        name: 'super admin',
        bgGradient: 'from-orange-50 via-white to-orange-100',
        primaryText: 'text-orange-700',
        primaryAccent: 'text-orange-600',
        primaryBg: 'bg-orange-600',
        primaryHoverBg: 'hover:bg-orange-700',
        focusRing: 'focus:ring-orange-400',
        // Tambahan spesifik page ini (opsional, jika butuh custom border/bg lagi)
        filterBorder: 'border-orange-200',
        filterBg: 'bg-orange-50',
      };
    }
    return {
      name: 'admin cabang',
      bgGradient: 'from-red-50 via-white to-red-100',
      primaryText: 'text-red-700',
      primaryAccent: 'text-red-600',
      primaryBg: 'bg-red-600',
      primaryHoverBg: 'hover:bg-red-700',
      focusRing: 'focus:ring-red-400',
      filterBorder: 'border-red-200',
      filterBg: 'bg-red-50',
    };
  };
  const theme = getThemeColors(user?.role);

  // 🔴 LOGIKA ALERT
  const showAlert = (message) => setAlert({ isOpen: true, message });
  const closeAlert = () => setAlert({ isOpen: false, message: "" });

  // 🔴 LOGIKA FETCH BAHAN BAKU
  useEffect(() => {
    axios
      .get(`${API_URL}/bahan-baku`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBahanList(res.data.data || []))
      .catch(() => {
        showAlert("Gagal memuat bahan baku.");
        addNotification(
          "Gagal memuat data bahan baku",
          "error",
          "Pemakaian Harian",
          "fetch"
        );
      });
  }, [token, addNotification]);

  // 🔴 LOGIKA FETCH PEMAKAIAN
  const fetchPemakaian = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/bahan-baku-pakai?tanggal=${tanggal}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPemakaianList(res.data.data || []);
    } catch {
      showAlert("Gagal memuat data pemakaian.");
      addNotification(
        "Gagal memuat data pemakaian harian",
        "error",
        "Pemakaian Harian",
        "fetch"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPemakaian();
  }, [tanggal, token]);

  // 🔴 LOGIKA TAMBAH DATA (ADD)
  const handleAdd = async () => {
    if (!newPemakaian.id_bahan_baku || !newPemakaian.jumlah_pakai) {
      showAlert("Pilih bahan baku dan isi jumlah pakai!");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/bahan-baku-pakai`,
        { tanggal, ...newPemakaian },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const bahanName =
        bahanList.find((b) => b.id_bahan_baku === newPemakaian.id_bahan_baku)
          ?.nama_bahan || "Bahan";

      addNotification(
        `Berhasil menambah pemakaian: ${bahanName} (${newPemakaian.jumlah_pakai} pcs)`,
        "success",
        "Pemakaian Harian",
        "create"
      );

      setNewPemakaian({ id_bahan_baku: "", jumlah_pakai: "", catatan: "" });
      fetchPemakaian();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Bahan baku tidak tersedia";
      showAlert(errorMessage);
      addNotification(errorMessage, "error", "Pemakaian Harian", "create");
    } finally {
      setLoading(false);
    }
  };

  // 🔴 LOGIKA KONFIRMASI HAPUS
  const openDeleteConfirm = (id, name) => {
    setConfirmDelete({ isOpen: true, id, name });
  };
  const closeDeleteConfirm = () => {
    setConfirmDelete({ isOpen: false, id: null, name: "" });
  };

  // 🔴 LOGIKA HAPUS DATA (DELETE)
  const handleDelete = async () => {
    const { id, name } = confirmDelete;

    try {
      await axios.delete(`${API_URL}/bahan-baku-pakai/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      addNotification(
        `Berhasil menghapus pemakaian: ${name}`,
        "info",
        "Pemakaian Harian",
        "delete"
      );

      fetchPemakaian();
    } catch {
      showAlert("Gagal menghapus data.");
      addNotification(
        `Gagal menghapus pemakaian ${name}`,
        "error",
        "Pemakaian Harian",
        "delete"
      );
    } finally {
      closeDeleteConfirm();
    }
  };

  return (
    // Gunakan class background gradient dari theme di wrapper utama
    <div className={`min-h-screen p-6 bg-gradient-to-br ${theme.bgGradient}`}>
      
      {/* 🟢 Custom Alert (Tetap di Page) */}
      <AlertPopup
        isOpen={alert.isOpen}
        message={alert.message}
        onClose={closeAlert}
      />

      {/* 🟠 Custom Confirm Delete Popup (Pindah ke Komponen) */}
      <BahanBakuPakaiDeleteConfirm
        isOpen={confirmDelete.isOpen}
        confirmDelete={confirmDelete}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6" // Hapus p-6 di sini karena sudah di wrapper utama
      >
        {/* 🟢 Judul Halaman */}
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Pemakaian Bahan Baku Harian
          </h1>
          <p className="text-gray-500 text-sm ml-1">
            Kelola penggunaan bahan baku setiap hari secara efisien.
          </p>
        </div>

        {/* 🔸 Filter Tanggal (Updated Style agar match theme) */}
        <div className={`flex flex-wrap items-center gap-3 ${theme.filterBg} border ${theme.filterBorder} rounded-xl p-4 shadow-sm`}>
          <label className={`font-medium ${theme.primaryText}`}>Tanggal:</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className={`border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:ring-2 ${theme.focusRing} focus:outline-none bg-white`}
          />
          <Button
            onClick={fetchPemakaian}
            // Gunakan warna theme untuk button
            className={`flex items-center gap-2 ${theme.primaryBg} ${theme.primaryHoverBg} text-white px-4 py-2 rounded-lg shadow-md transition`}
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Muat Ulang
          </Button>
        </div>

        {/* 🟣 Form Tambah Pemakaian (Pindah ke Komponen) */}
        <BahanBakuPakaiForm
          newPemakaian={newPemakaian}
          bahanList={bahanList}
          setNewPemakaian={setNewPemakaian}
          handleAdd={handleAdd}
          loading={loading}
          theme={theme} // Pass theme jika komponen butuh styling dinamis
        />

        {/* 📊 Tabel Data Pemakaian (Pindah ke Komponen) */}
        <BahanBakuPakaiTable
          pemakaianList={pemakaianList}
          loading={loading}
          openDeleteConfirm={openDeleteConfirm}
          theme={theme} // Pass theme
        />
      </motion.div>
    </div>
  );
}