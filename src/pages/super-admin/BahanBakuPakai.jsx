import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ConfirmDeletePopup, SuccessPopup, Modal } from "../../components/ui";
import BahanHarianTable from "../../components/bahan-baku-pakai/BahanBakuPakaiTable.jsx";
import BahanHarianForm from "../../components/bahan-baku-pakai/BahanBakuPakaiForm.jsx";
import { Package, Calendar, PlusCircle } from "lucide-react";

const API_URL = "http://localhost:8000/api";

function BahanBakuPakai() {
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split("T")[0]);
  const [pemakaianList, setPemakaianList] = useState([]);
  const [bahanList, setBahanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch daftar bahan baku untuk dropdown
  useEffect(() => {
    axios.get(`${API_URL}/bahan-baku`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      setBahanList(res.data.data || []);
    });
  }, [token]);

  // Fetch data pemakaian harian
  const fetchPemakaian = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/bahan-baku-pakai?tanggal=${tanggal}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPemakaianList(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data pemakaian.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPemakaian();
  }, [tanggal]);

  // Tambah data pemakaian
  const handleAdd = async (formData) => {
    try {
      await axios.post(
        `${API_URL}/bahan-baku-pakai`,
        {
          tanggal,
          ...formData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSuccessMessage("Data pemakaian berhasil ditambahkan!");
      setShowSuccess(true);
      setShowForm(false);
      fetchPemakaian();
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan data pemakaian.");
    }
  };

  // Hapus pemakaian
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/bahan-baku-pakai/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("Data pemakaian berhasil dihapus!");
      setShowSuccess(true);
      fetchPemakaian();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data.");
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  const closeSuccessPopup = () => setShowSuccess(false);

  // Calculate totals
  const totalPemakaian = pemakaianList.length;
  const totalModal = pemakaianList.reduce((sum, item) => sum + (Number(item.total_modal) || 0), 0);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">Pemakaian Bahan Baku Harian</h1>
            <p className="text-gray-600">Kelola dan pantau pemakaian bahan baku per hari</p>
          </div>
          
          <motion.button 
            onClick={() => setShowForm(true)} 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 font-semibold"
          >
            <PlusCircle size={20} />
            Tambah Pemakaian
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pemakaian Hari Ini</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{totalPemakaian}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Package className="text-gray-700" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Modal</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  Rp {totalModal.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Package className="text-gray-700" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tanggal</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {new Date(tanggal).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Calendar className="text-gray-700" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={20} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Tanggal
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
            
            <button
              onClick={fetchPemakaian}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Muat Ulang
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <BahanHarianTable
            data={pemakaianList}
            loading={loading}
            onDelete={confirmDelete}
          />
        </div>
      </motion.div>

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <BahanHarianForm
          title="Tambah Pemakaian Bahan Baku"
          bahanList={bahanList}
          onSubmit={handleAdd}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {/* Popup Hapus */}
      <ConfirmDeletePopup
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />

      {/* Popup Sukses */}
      <SuccessPopup
        isOpen={showSuccess}
        onClose={closeSuccessPopup}
        title="Berhasil"
        message={successMessage}
      />
    </div>
  );
}

export default BahanBakuPakai;