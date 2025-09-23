// src/pages/AkunAdminAdvertisingPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Edit, Trash2, X } from "lucide-react";

const API_URL = "http://localhost:8000/api";

const BranchAdminPage = () => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    id_cabang: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [admins, setAdmins] = useState([]);
  const [cabang, setCabang] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // 👈 target hapus

  const token = localStorage.getItem("token");

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin-cabang`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAdmins(data.data || []);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
      setAdmins([]);
    }
  }, [token]);

  const fetchCabang = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/cabang-without-admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCabang(data.data || []);
    } catch (err) {
      console.error("Failed to fetch cabang:", err);
      setCabang([]);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAdmins();
      fetchCabang();
    }
  }, [token, fetchAdmins, fetchCabang]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/create-admin-cabang`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.status === 201) {
        setMessage("✅ " + data.message);
        setFormData({ nama: "", email: "", password: "", id_cabang: "" });
        fetchAdmins();
        fetchCabang();
        setShowForm(false);
      } else {
        setMessage("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("❌ Error koneksi server");
    }
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_URL}/admin-cabang/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ " + data.message);
        fetchAdmins();
      } else {
        setMessage("❌ " + (data.message || "Gagal hapus"));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
    setDeleteTarget(null);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin.id_user);
    setFormData({
      nama: admin.nama,
      email: admin.email,
      password: "",
      id_cabang: admin.cabang?.id_cabang || "",
    });
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin-cabang/${editingAdmin}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ " + data.message);
        setEditingAdmin(null);
        setFormData({ nama: "", email: "", password: "", id_cabang: "" });
        fetchAdmins();
        setShowForm(false);
      } else {
        setMessage("❌ " + (data.message || "Gagal update"));
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 via-white to-green-100">
      <motion.h1
        className="text-4xl font-extrabold text-green-700 mb-8 drop-shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Kelola Admin Cabang
      </motion.h1>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-green-700">
          Daftar Admin Cabang
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <UserPlus size={18} /> Tambah Admin
        </button>
      </div>

      {/* Grid daftar admin */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin, index) => (
          <motion.div
            key={admin.id_user}
            className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-green-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h2 className="text-lg font-bold text-green-800">{admin.nama}</h2>
            <p className="text-gray-700 text-sm">{admin.email}</p>
            <p className="text-gray-600 text-xs mt-1">
              Cabang: {admin.cabang ? admin.cabang.nama_cabang : "N/A"}
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => handleEdit(admin)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
              >
                <Edit size={16} /> Edit
              </button>
              <button
                onClick={() =>
                  setDeleteTarget({ id: admin.id_user, nama: admin.nama })
                }
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
              >
                <Trash2 size={16} /> Hapus
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Tambah/Edit */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-white bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border-t-4 border-green-600 relative"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAdmin(null);
                  setFormData({
                    nama: "",
                    email: "",
                    password: "",
                    id_cabang: "",
                  });
                }}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-semibold mb-4 text-green-700">
                {editingAdmin ? "✏️ Edit Admin Cabang" : "➕ Tambah Admin Cabang"}
              </h2>

              <form
                onSubmit={editingAdmin ? handleUpdate : handleSubmit}
                className="space-y-3"
              >
                <input
                  type="text"
                  name="nama"
                  placeholder="Nama Lengkap"
                  value={formData.nama}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 w-full text-gray-800"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 w-full text-gray-800"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 w-full text-gray-800"
                  required={!editingAdmin}
                />

                <select
                  name="id_cabang"
                  value={formData.id_cabang}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 w-full text-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
                  required
                  disabled={cabang.length === 0}
                >
                  <option value="">
                    {cabang.length === 0
                      ? "Tidak ada cabang tersedia"
                      : "Pilih Cabang"}
                  </option>
                  {cabang.map((cab) => (
                    <option key={cab.id_cabang} value={cab.id_cabang}>
                      {cab.nama_cabang}
                    </option>
                  ))}
                </select>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                  className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  {loading
                    ? "Menyimpan..."
                    : editingAdmin
                    ? "Simpan Perubahan"
                    : "Tambah Admin"}
                </motion.button>
              </form>

              {message && (
                <p
                  className={`mt-4 text-center text-sm font-medium ${
                    message.includes("✅") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-lg font-semibold text-red-600 mb-3">
                Konfirmasi Hapus
              </h2>
              <p className="text-gray-700 mb-5">
                Yakin ingin menghapus admin{" "}
                <span className="font-bold">{deleteTarget.nama}</span>?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BranchAdminPage;
