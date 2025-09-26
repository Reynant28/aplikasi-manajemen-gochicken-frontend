// src/pages/AkunAdminAdvertisingPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Edit, Trash2, X, AlertTriangle, Plus } from "lucide-react";

import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { Link } from "react-router-dom";

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
  const [showAddForm, setShowAddForm] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

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
        setShowAddForm(false);
      } else {
        setMessage("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("❌ Error koneksi server");
    }
    setLoading(false);
  };

  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowConfirm(true);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin.id_user);
    setFormData({
      nama: admin.nama,
      email: admin.email,
      password: "",
      id_cabang: admin.cabang?.id_cabang || "",
    });
    setShowAddForm(true);
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
        fetchCabang();
        setShowAddForm(false);
      } else {
        setMessage("❌ " + (data.message || "Gagal update"));
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/admin-cabang/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchAdmins();
        fetchCabang();
      }
    } catch (err) {
      console.error("Delete admin error:", err);
    }
    setShowConfirm(false);
    setDeleteId(null);
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
        <Button onClick={() => setShowAddForm(true)}>
          <UserPlus size={18} /> Tambah Admin
        </Button>
      </div>

      {/* Grid daftar admin */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin, index) => (
          <Card
            key={admin.id_user}
            className="relative"
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
              <Button
                onClick={() => handleEdit(admin)}
                variant="warning"
              >
                <Edit size={16} /> Edit
              </Button>
              <Button
                onClick={() =>
                  confirmDelete(admin.id_user, admin.nama)
                }
                variant="danger"
              >
                <Trash2 size={16} /> Hapus
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Tambah/Edit */}
      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
        <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
          <Plus size={18} /> Tambah Cabang
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

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
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
      

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-500" size={28} />
                <h2 className="text-lg font-bold text-gray-800">
                  Konfirmasi Hapus
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus akun admin cabang ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
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
