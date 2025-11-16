import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react"; 
import { motion } from "framer-motion";
import {
 ConfirmDeletePopup,
 SuccessPopup,
 Button,
 Modal,
} from "../../components/ui";
import { FileText } from "lucide-react";
import JenisPengeluaranTable from "../../components/jenis-pengeluaran/JenisPengeluaranTable.jsx";
import JenisPengeluaranForm from "../../components/jenis-pengeluaran/JenisPengeluaranForm.jsx";

const API_URL = "http://localhost:8000/api";

const JenisPengeluaranPage = () => {
 const [pengeluaran, setPengeluaran] = useState([]);
 const [loading, setLoading] = useState(false);
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
   } 
  } catch (err) {
   console.error("Delete pengeluaran error:", err);
  }
  setShowConfirm(false);
  setDeleteId(null);
 };

 const closeSuccessPopup = () => setShowSuccess(false);

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

    {/* Table Section */}
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
     <JenisPengeluaranTable
      data={pengeluaran}
      loading={loading}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      onEdit={setEditPengeluaran}
      onDelete={confirmDelete}
     />
    </div>
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