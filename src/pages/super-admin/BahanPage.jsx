import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Package } from "lucide-react";
import {
  ConfirmDeletePopup,
  SuccessPopup,
  Modal,
} from "../../components/ui";
import BahanTable from "../../components/bahan-baku/BahanBakuTable.jsx";
import BahanForm from "../../components/bahan-baku/BahanBakuForm.jsx";

const API_URL = "http://localhost:8000/api";

const BahanPage = () => {
  const [bahanList, setBahanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    nama_bahan: "",
    jumlah_stok: "",
    satuan: "",
    harga_satuan: "",
  });

  const [editBahan, setEditBahan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch data bahan
  const fetchBahan = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/bahan-baku`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBahanList(data.data || []);
    } catch (err) {
      console.error("Fetch bahan error:", err);
      setBahanList([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchBahan();
  }, [token, fetchBahan]);

  // Tambah bahan
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/bahan-baku`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.status === 201) {
        setSuccessMessage(data.message || "Bahan baku berhasil ditambahkan!");
        setShowSuccess(true);
        setFormData({ nama_bahan: "", jumlah_stok: "", satuan: "", harga_satuan: "" });
        setShowForm(false);
        fetchBahan();
      } else {
        alert("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Add bahan error:", err);
    }
    setLoading(false);
  };

  // Update bahan
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${API_URL}/bahan-baku/${editBahan.id_bahan_baku}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nama_bahan: editBahan.nama_bahan,
            jumlah_stok: Number(editBahan.jumlah_stok),
            satuan: Number(editBahan.satuan),
            harga_satuan: Number(editBahan.harga_satuan),
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || "Bahan baku berhasil diupdate!");
        setShowSuccess(true);
        fetchBahan();
        setEditBahan(null);
      } else {
        alert("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Update bahan error:", err);
    }
  };

  // Hapus bahan
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/bahan-baku/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || "Bahan baku berhasil dihapus!");
        setShowSuccess(true);
        fetchBahan();
      } else {
        alert("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Delete bahan error:", err);
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  const closeSuccessPopup = () => setShowSuccess(false);

  // Calculate total value
  const totalNilaiBahan = bahanList.reduce((sum, item) => 
    sum + (Number(item.jumlah_stok) * Number(item.harga_satuan)), 0
  );

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
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Bahan Baku</h1>
            <p className="text-gray-600">Kelola stok dan harga bahan baku untuk produksi</p>
          </div>
          
          <motion.button 
            onClick={() => setShowForm(true)} 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 font-semibold"
          >
            <PlusCircle size={20} />
            Tambah Bahan Baku
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bahan</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{bahanList.length}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Package className="text-gray-700" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stok Rendah</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {bahanList.filter(item => item.jumlah_stok < 5).length}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <Package className="text-red-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Nilai Stok</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  Rp {totalNilaiBahan.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Package className="text-gray-700" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <BahanTable
            data={bahanList}
            loading={loading}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onEdit={setEditBahan}
            onDelete={confirmDelete}
          />
        </div>
      </motion.div>

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <BahanForm
          title="Tambah Bahan Baku"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAdd}
          loading={loading}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editBahan} onClose={() => setEditBahan(null)}>
        <BahanForm
          title="Edit Bahan Baku"
          formData={editBahan || {}}
          setFormData={setEditBahan}
          onSubmit={handleUpdate}
          loading={loading}
          onClose={() => setEditBahan(null)}
          isEdit
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
};

export default BahanPage;