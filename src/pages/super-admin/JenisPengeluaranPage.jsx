import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash, FileText } from "lucide-react"; 
import { motion } from "framer-motion";
import {
 ConfirmDeletePopup,
 SuccessPopup,
 Button,
 Modal,
} from "../../components/ui";

const API_URL = "http://localhost:8000/api";

const PengeluaranPage = () => {
 const [pengeluaran, setPengeluaran] = useState([]);
 const [loading, setLoading] = useState(false);
 
 // --- STATE LAINNYA (Tidak Berubah) ---
 const [selectedDate, setSelectedDate] = useState("");
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8; 

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
 const user = JSON.parse(localStorage.getItem("user"));
 const cabang = JSON.parse(localStorage.getItem("cabang"));

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
   });

   const data = await res.json();
   if (res.status === 201 || data.status === "success") {
    setSuccessMessage(data.message || "Pengeluaran berhasil ditambahkan!");
    setShowSuccess(true);

    setFormData({ jenis_pengeluaran: "" });
    setShowForm(false);
    fetchPengeluaran();
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
    setSuccessMessage(data.message || "Pengeluaran berhasil diupdate!");
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
    setSuccessMessage("Pengeluaran berhasil dihapus!");
    setShowSuccess(true);
        
    fetchPengeluaran();
   } 
  } catch (err) {
   console.error("Delete pengeluaran error:", err);
  }
  setShowConfirm(false);
  setDeleteId(null);
 };

 // ... (Sisa fungsi dan render komponen tidak berubah) ...
    const closeSuccessPopup = () => setShowSuccess(false);

 // --- LOGIKA FILTER DAN PAGINATION BARU ---
 
 // Pagination logic
    const totalPages = Math.ceil(pengeluaran.length / itemsPerPage);
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = pengeluaran.slice(indexOfFirst, indexOfLast);

    const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
    };

    const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];

    if (totalPages <= maxPagesToShow) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        const startPage = Math.max(2, currentPage - Math.floor((maxPagesToShow - 3) / 2));
        const endPage = Math.min(totalPages - 1, currentPage + Math.ceil((maxPagesToShow - 3) / 2));

        pages.push(1);
        if (startPage > 2) pages.push("...");
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        if (endPage < totalPages - 1) pages.push("...");
        if (totalPages > 1) pages.push(totalPages);
    }

    return pages.filter((v, i, s) => s.indexOf(v) === i);
    };

 // ----------------------------------------

 return (
  <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 via-white to-green-100">
   <motion.h1
    className="text-4xl font-extrabold text-green-700 mb-8 drop-shadow-sm"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
   >
    Kelola Jenis Pengeluaran
   </motion.h1>

   <div className="mb-6 flex justify-between items-start">
    <Button onClick={() => setShowForm(true)}>
     <Plus size={18} /> Tambah Jenis Pengeluaran
    </Button>
    
    {/* ✅ FILTER TANGGAL DAN PAGINATION */}
    <div className="flex flex-col md:flex-row items-center gap-4">
     {/* Pagination Component */}
     {totalPages > 1 && (
      <div className="flex items-center border border-gray-200 rounded-xl shadow-md divide-x divide-gray-200">
       <button
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-3 rounded-l-xl transition duration-150 ease-in-out ${
         currentPage === 1
          ? "bg-gray-100 cursor-not-allowed text-gray-400"
          : "bg-white hover:bg-green-50 hover:text-green-600 text-gray-700"
        }`}
       >
        <span className="text-gray-600">
         &lt;
        </span>
       </button>
       {getPageNumbers().map((page, i) => (
        <button
         key={i}
         onClick={() => typeof page === "number" && changePage(page)}
         disabled={page === "..."}
         className={`px-4 py-2 text-sm font-medium transition duration-150 ease-in-out ${
          currentPage === page
           ? "bg-green-600 text-white shadow-inner shadow-green-800/20"
           : page === "..."
           ? "bg-white text-gray-400 cursor-default"
           : "bg-white text-gray-700 hover:bg-green-50 hover:text-green-600"
         }`}
        >
         {page}
        </button>
       ))}
       <button
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-3 rounded-r-xl transition duration-150 ease-in-out ${
         currentPage === totalPages
          ? "bg-gray-100 cursor-not-allowed text-gray-400"
          : "bg-white hover:bg-green-50 hover:text-green-600 text-gray-700"
        }`}
       >
        <span className="text-gray-600">
         &gt;
        </span>
       </button>
      </div>
     )}
    </div>
   </div>

   {/* --- Tabel Pengeluaran --- */}
   <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="overflow-hidden bg-white shadow-md rounded-xl"
   >
    {loading ? (
     <p className="p-4 text-center text-gray-500">⏳ Memuat data...</p>
    ) : currentData.length === 0 ? (
     <p className="p-4 text-center text-gray-600">❌ Tidak ada data pengeluaran yang sesuai dengan filter.</p>
    ) : (
     <table className="min-w-full text-sm text-gray-700 border-separate border-spacing-0">
      <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
       <tr>
        <th className="px-6 py-4 text-left font-semibold border-b border-gray-200">
         No
        </th>
        <th className="px-6 py-4 text-left font-semibold border-b border-gray-200">
         Jenis Pengeluaran
        </th>
        <th className="px-6 py-4 text-center font-semibold border-b border-gray-200">
         Aksi
        </th>
       </tr>
      </thead>
      <tbody>
       {currentData.map((item, index) => (
        <tr key={item.id_jenis} className="hover:bg-gray-50 transition">
         <td className="px-6 py-4 font-bold text-gray-800 border-b border-gray-200">
          {indexOfFirst + index + 1} {/* Nomor urut berdasarkan halaman */}
         </td>
         <td className="px-6 py-4 text-gray-600 italic border-b border-gray-200">
          {item.jenis_pengeluaran}
         </td>
         <td className="px-6 py-4 text-center border-b border-gray-200">
          <div className="flex justify-center gap-3">
           <button
            className="text-green-600 hover:text-green-800"
            onClick={() => setEditPengeluaran(item)}
            title="Edit"
           >
            <Edit size={18} />
           </button>
           <button
            className="text-red-500 hover:text-red-700"
            onClick={() => confirmDelete(item.id_jenis)}
            title="Hapus"
           >
            <Trash size={18} />
           </button>
          </div>
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    )}
   </motion.div>

    {/* --- Modal Tambah Pengeluaran --- (Tidak Berubah) */}
   <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
    <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
     <Plus size={18} /> Tambah Pengeluaran
    </h2>
    <form onSubmit={handleAdd}>
     <label className="text-sm font-medium text-gray-700">Jenis Pengeluaran</label>
     <input
      type="text"
      value={formData.jenis_pengeluaran}
      onChange={(e) => setFormData({ ...formData, jenis_pengeluaran: e.target.value })}
      className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
      required
     />

     <div className="flex justify-end gap-3 mt-4">
      <button
       type="button"
       onClick={() => setShowForm(false)}
       className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
      >
       Batal
      </button>
      <button
       type="submit"
       disabled={loading}
       className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
      >
       {loading ? "Menyimpan..." : "Simpan"}
      </button>
     </div>
    </form>
   </Modal>

   {/* --- Modal Edit Pengeluaran --- (Tidak Berubah) */}
   <Modal
    isOpen={!!editPengeluaran}
    onClose={() => setEditPengeluaran(null)}
   >
    <h2 className="text-xl font-semibold mb-4 text-green-700">
     ✏ Edit Pengeluaran
    </h2>

    <label className="text-sm font-medium text-gray-700">Jenis Pengeluaran</label>
    <input
     type="text"
     value={editPengeluaran?.jenis_pengeluaran || ""}
     onChange={(e) =>
      setEditPengeluaran({ ...editPengeluaran, jenis_pengeluaran: e.target.value })
     }
     className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
    />
    <div className="flex justify-end gap-3 mt-4">
     <button
      onClick={() => setEditPengeluaran(null)}
      className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
     >
      Batal
     </button>
     <button
      onClick={handleUpdate}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
     >
      Simpan
     </button>
    </div>
   </Modal>

   {/* --- Popup Hapus --- (Tidak Berubah) */}
   <ConfirmDeletePopup
    isOpen={showConfirm}
    onClose={() => setShowConfirm(false)}
    onConfirm={handleDelete}
   />

   {/* --- Popup Sukses --- (Tidak Berubah) */}
   <SuccessPopup
    isOpen={showSuccess}
    onClose={closeSuccessPopup}
    title="Aksi Berhasil 🎉"
    message={successMessage}
   />
  </div>
 );
};

export default PengeluaranPage;