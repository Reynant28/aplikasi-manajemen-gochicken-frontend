import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ConfirmDeletePopup, SuccessPopup, Modal, DataTable } from "../../components/ui";
import BahanHarianForm from "../../components/bahan-baku-pakai/BahanBakuPakaiForm.jsx";
import { Package, Calendar, PlusCircle, Trash2, ChevronLeft, ChevronRight, Edit } from "lucide-react";

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

function BahanBakuPakai() {
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split("T")[0]);
  const [pemakaianList, setPemakaianList] = useState([]);
  const [bahanList, setBahanList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingCabang, setLoadingCabang] = useState(false); // Add this line

  const [editingItem, setEditingItem] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Fetch cabang data from API
  useEffect(() => {
    const fetchCabang = async () => {
      setLoadingCabang(true);
      try {
        const response = await axios.get(`${API_URL}/cabang`, { // Use API_URL constant
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCabangList(response.data.data || []);
      } catch (error) {
        console.error('Error fetching cabang:', error);
        alert('Gagal memuat data cabang');
      } finally {
        setLoadingCabang(false);
      }
    };

    fetchCabang();
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
      
      // Wait for cabang data to be loaded before mapping
      if (cabangList.length > 0) {
        const pemakaianWithCabangName = (res.data.data || []).map(item => ({
          ...item,
          nama_cabang: getCabangName(item.id_cabang)
        }));
        setPemakaianList(pemakaianWithCabangName);
      } else {
        // If cabang data not loaded yet, just set the data without cabang names
        setPemakaianList(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data pemakaian.");
    } finally {
      setLoading(false);
    }
  };

  const getCabangName = (idCabang) => {
    const cabang = cabangList.find(cabang => cabang.id_cabang == idCabang);
    return cabang ? cabang.nama_cabang : `Cabang ${idCabang}`;
  };

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

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowEditForm(true);
  };

  // Update handler
  const handleUpdate = async (formData) => {
    try {
      await axios.put(
        `${API_URL}/bahan-baku-pakai/${editingItem.id_pemakaian}`,
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
      setSuccessMessage("Data pemakaian berhasil diupdate!");
      setShowSuccess(true);
      setShowEditForm(false);
      setEditingItem(null);
      fetchPemakaian();
    } catch (err) {
      console.error(err);
      alert("Gagal mengupdate data pemakaian.");
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

  // Define columns configuration
  const bahanPakaiColumns = [
    { 
      key: 'nama_bahan', 
      header: 'Bahan Baku',
      render: (item) => (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {item.nama_bahan}
            </p>
          </div>
        </div>
      )
    },
    { 
      key: 'satuan', 
      header: 'Satuan',
      render: (item) => (
        <span className="text-sm text-gray-700">
          {Number(item.satuan) % 1 === 0
            ? Number(item.satuan)
            : Number(item.satuan).toFixed(1)} kg
        </span>
      )
    },
    { 
      key: 'harga_satuan', 
      header: 'Harga Satuan',
      align: 'right',
      render: (item) => (
        <span className="text-sm font-semibold text-gray-900">
          {formatRupiah(item.harga_satuan)}
        </span>
      )
    },
    { 
      key: 'jumlah_pakai', 
      header: 'Jumlah Pakai',
      align: 'right',
      render: (item) => (
        <span className="text-sm text-gray-700">
          {Number(item.jumlah_pakai) % 1 === 0
            ? Number(item.jumlah_pakai)
            : Number(item.jumlah_pakai).toFixed(1)} pcs
        </span>
      )
    },
    { 
      key: 'total_modal', 
      header: 'Total Modal',
      align: 'right',
      render: (item) => (
        <span className="text-sm font-bold text-gray-900">
          {formatRupiah(item.total_modal)}
        </span>
      )
    },
    {
      key: 'cabang',
      header: 'Cabang',
      render: (item) => (
        <span className="text-sm text-gray-600">
          {getCabangName(item.id_cabang)}
        </span>
      )
    },
    { 
      key: 'catatan', 
      header: 'Catatan',
      render: (item) => (
        <span className="text-sm text-gray-600">
          {item.catatan || "-"}
        </span>
      )
    },
    { 
      key: 'actions', 
      header: 'Aksi',
      align: 'center',
      render: (item) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => confirmDelete(item.id_pemakaian)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const totalPages = Math.ceil(pemakaianList.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = pemakaianList.slice(indexOfFirst, indexOfLast);

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

        {/* Filter and Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-md border border-gray-100">
          {/* Data Info */}
          <div className="text-sm text-gray-600">
            Menampilkan {indexOfFirst + 1}-{Math.min(indexOfLast, pemakaianList.length)} dari {pemakaianList.length} Bahan Baku Pakai
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
          data={pemakaianList}
          columns={bahanPakaiColumns}
          loading={loading}
          emptyMessage="Tidak ada data pemakaian"
          emptyDescription="Mulai dengan menambahkan pemakaian baru"
          showActions={false}
          actionLabel="Aksi"
          cabangList={cabangList}
        />
      </motion.div>

      {/* Add Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <BahanHarianForm
          title="Tambah Pemakaian Bahan Baku"
          bahanList={bahanList}
          cabangList={cabangList}
          onSubmit={handleAdd}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {/* Edit Form Modal */}
      <Modal isOpen={showEditForm} onClose={() => setShowEditForm(false)}>
        <BahanHarianForm
          title="Edit Pemakaian Bahan Baku"
          bahanList={bahanList}
          cabangList={cabangList}
          initialData={editingItem}
          onSubmit={handleUpdate}
          onClose={() => setShowEditForm(false)}
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