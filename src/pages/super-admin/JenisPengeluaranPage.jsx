import { useState, useEffect, useCallback } from "react";
import { Plus, FileText, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"; 
import { motion } from "framer-motion";
import {
 ConfirmDeletePopup,
 SuccessPopup,
 Modal,
 DataTable
} from "../../components/ui";
import JenisPengeluaranForm from "../../components/jenis-pengeluaran/JenisPengeluaranForm.jsx";

const API_URL = "http://localhost:8000/api";

const JenisPengeluaranPage = () => {
  const [pengeluaran, setPengeluaran] = useState([]);
  const [loading, setLoading] = useState(false);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    jenis_pengeluaran: "",
  });

  const [editPengeluaran, setEditPengeluaran] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("token");

  // Ambil data pengeluaran
  const fetchPengeluaran = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/jenis-pengeluaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPengeluaran(data.data || []);
    } catch (err) {
      console.error("Fetch pengeluaran error:", err);
      setPengeluaran([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchPengeluaran();
  }, [token, fetchPengeluaran]);

  // Tambah pengeluaran
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/jenis-pengeluaran`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.status === 201 || data.status === "success") {
        setSuccessMessage(data.message || "Jenis pengeluaran berhasil ditambahkan!");
        setShowSuccess(true);

        setFormData({ jenis_pengeluaran: "" });
        setShowForm(false);
        fetchPengeluaran();
        setCurrentPage(1); // Reset to first page after adding
      } else {
        alert("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Add pengeluaran error:", err);
    }

    setLoading(false);
  };

  // Update pengeluaran
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${API_URL}/jenis-pengeluaran/${editPengeluaran.id_jenis}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jenis_pengeluaran: editPengeluaran.jenis_pengeluaran,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || "Jenis pengeluaran berhasil diupdate!");
        setShowSuccess(true);
        
        fetchPengeluaran();
        setEditPengeluaran(null);
      } else {
        alert("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Update pengeluaran error:", err);
    }
  };

  // Hapus pengeluaran
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/jenis-pengeluaran/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSuccessMessage("Jenis pengeluaran berhasil dihapus!");
        setShowSuccess(true);
            
        fetchPengeluaran();
        // Reset to first page if current page becomes empty
        if (currentData.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } 
    } catch (err) {
      console.error("Delete pengeluaran error:", err);
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  const closeSuccessPopup = () => setShowSuccess(false);

  // Define columns configuration for the reusable DataTable
  const jenisPengeluaranColumns = [
    { 
      key: 'id_jenis', 
      header: 'ID',
      width: '80px',
      align: 'center'
    },
    { 
      key: 'jenis_pengeluaran', 
      header: 'Jenis Pengeluaran',
      bold: true
    },
  ];

  // Define action buttons for the table
  const renderAction = (item) => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => setEditPengeluaran(item)}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Edit size={14} />
      </button>
      <button
        onClick={() => confirmDelete(item.id_jenis)}
        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  const totalPages = Math.ceil(pengeluaran.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = pengeluaran.slice(indexOfFirst, indexOfLast);

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
            <h1 className="text-3xl font-bold text-gray-800">Jenis Pengeluaran</h1>
            <p className="text-gray-600">Kelola jenis-jenis pengeluaran untuk sistem</p>
          </div>
          
          <motion.button 
            onClick={() => setShowForm(true)} 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 font-semibold"
          >
            <Plus size={20} />
            Tambah Jenis
          </motion.button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jenis</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{pengeluaran.length}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <FileText className="text-gray-700" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-md border border-gray-100">
          {/* Data Info */}
          <div className="text-sm text-gray-600">
            Menampilkan {indexOfFirst + 1}-{Math.min(indexOfLast, pengeluaran.length)} dari {pengeluaran.length} jenis pengeluaran
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

        {/* Table Section - Using Reusable DataTable */}
        <DataTable
          data={currentData}
          columns={jenisPengeluaranColumns}
          loading={loading}
          emptyMessage="Tidak ada jenis pengeluaran"
          emptyDescription="Belum ada data jenis pengeluaran untuk ditampilkan"
          onRowAction={renderAction}
          showActions={true}
          actionLabel="Aksi"
        />
      </motion.div>

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <JenisPengeluaranForm
          title="Tambah Jenis Pengeluaran"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAdd}
          loading={loading}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editPengeluaran} onClose={() => setEditPengeluaran(null)}>
        <JenisPengeluaranForm
          title="Edit Jenis Pengeluaran"
          formData={editPengeluaran || {}}
          setFormData={setEditPengeluaran}
          onSubmit={handleUpdate}
          loading={loading}
          onClose={() => setEditPengeluaran(null)}
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

export default JenisPengeluaranPage;