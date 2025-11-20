import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Package, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ConfirmDeletePopup,
  SuccessPopup,
  Modal,
  DataTable
} from "../../components/ui";
import BahanTable from "../../components/bahan-baku/BahanBakuTable.jsx";
import BahanForm from "../../components/bahan-baku/BahanBakuForm.jsx";

const API_URL = "http://localhost:8000/api";

const BahanPage = () => {
  const [bahanList, setBahanList] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination
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

  const BahanBakuColumns = [
    { 
      key: 'nama_bahan', 
      header: 'Nama Bahan',
    },
    { 
      key: 'harga_satuan', 
      header: 'Harga Satuan',
      bold: true
    },
    { 
      key: 'satuan', 
      header: 'Satuan',
    },
    { 
      key: 'jumlah_stok', 
      header: 'Jumlah Stok',
    },
  ];

  const renderAction = (item) => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => setEditBahan(item)}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Edit size={14} />
      </button>
      <button
        onClick={() => confirmDelete(item.id_bahan_baku)}
        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  const totalPages = Math.ceil(bahanList.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = bahanList.slice(indexOfFirst, indexOfLast);

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(2, currentPage - Math.floor((maxPagesToShow - 3) / 2));
      const endPage = Math.min(totalPages - 1, currentPage + Math.ceil((maxPagesToShow - 3) / 2));

      pages.push(1);
      if (startPage > 2) pages.push("...");
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < totalPages - 1) pages.push("...");
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages.filter((value, index, self) => self.indexOf(value) === index);
  };

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

        {/* Filter and Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-md border border-gray-100">
          {/* Data Info */}
          <div className="text-sm text-gray-600">
            Menampilkan {indexOfFirst + 1}-{Math.min(indexOfLast, bahanList.length)} dari {bahanList.length} bahan baku
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, i) => (
                  <button
                    key={i}
                    onClick={() => typeof page === "number" && changePage(page)}
                    disabled={page === "..."}
                    className={`min-w-[36px] px-3 py-2 text-sm font-medium rounded-lg transition ${
                      currentPage === page
                        ? "bg-gray-700 text-white"
                        : page === "..."
                        ? "text-gray-400 cursor-default"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Table Section */}
        <DataTable
          data={currentData}  // Use paginated data
          columns={BahanBakuColumns}
          loading={loading}
          emptyMessage="Tidak ada bahan baku"
          emptyDescription="Belum ada data bahan baku untuk ditampilkan"
          onRowAction={renderAction}
          showActions={true}
          actionLabel="Aksi"
        />
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