// src/pages/AkunAdminAdvertisingPage.jsx
import React, { useState, useEffect, useCallback } from "react";
//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { UserPlus, Edit, Trash2, Save, X } from "lucide-react";

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
    //eslint-disable-next-line no-unused-vars
    const [showForm, setShowForm] = useState(true);

  // State untuk edit mode
  const [editingAdmin, setEditingAdmin] = useState(null);

  // 🔑 Token
  const token = localStorage.getItem("token");

  // Fetch Admin
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

  // Fetch Cabang
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

  // Input handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit (Tambah Admin)
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
            body: JSON.stringify(formData), // ⬅️ Kirim formData tanpa id_user
        });

        const data = await res.json();
        if (res.status === 201) {
            setMessage("✅ " + data.message);
            setFormData({
                nama: "",
                email: "",
                password: "",
                id_cabang: "",
            });
            fetchAdmins();
            fetchCabang();
        } else {
            setMessage("❌ " + (data.message || "Error"));
        }
    } catch (err) {
        console.error("Fetch error:", err);
        setMessage("❌ Error koneksi server");
    }

    setLoading(false);
  };

  // Delete Admin
  const handleDelete = async (id_user) => {
    if (!window.confirm("Yakin ingin menghapus admin ini?")) return;
    try {
      const res = await fetch(`${API_URL}/admin-cabang/${id_user}`, {
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
  };

  // Edit Admin
  const handleEdit = (admin) => {
    setEditingAdmin(admin.id_user);
    setFormData({
      nama: admin.nama,
      email: admin.email,
      password: "",
      id_cabang: admin.cabang?.id_cabang || "",
    });
  };

  // Update Admin
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
      } else {
        setMessage("❌ " + (data.message || "Gagal update"));
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div className="p-6 space-y-10">
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg mx-auto border-t-4 border-blue-600"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-700">
            <UserPlus className="text-blue-600" />{" "}
            {editingAdmin ? "Edit Admin Cabang" : "Tambah Admin Cabang"}
          </h2>
          <form
            onSubmit={editingAdmin ? handleUpdate : handleSubmit}
            className="space-y-4"
          >
            <input
              type="text"
              name="nama"
              placeholder="Nama Lengkap"
              value={formData.nama}
              onChange={handleChange}
              className="w-full p-3 border placeholder:text-gray-400 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border placeholder:text-gray-400 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password Pribadi"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border placeholder:text-gray-400 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500"
              required={!editingAdmin}
            />

            <select
              name="id_cabang"
              value={formData.id_cabang}
              onChange={handleChange}
              className="w-full p-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
              required
              disabled={cabang.length === 0} // ⬅️ kalau kosong, select jadi disable
            >
              <option value="">
                {cabang.length === 0
                  ? "Tidak ada cabang yang belum memiliki admin"
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
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              {loading
                ? "Menyimpan..."
                : editingAdmin
                ? "Simpan Perubahan"
                : "Tambah Admin"}
            </motion.button>

            {editingAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditingAdmin(null);
                  setFormData({
                    nama: "",
                    email: "",
                    password: "",
                    id_cabang: "",
                  });
                }}
                className="w-full bg-gray-300 text-gray-800 p-3 rounded-lg hover:bg-gray-400 transition font-semibold mt-2"
              >
                Batal
              </button>
            )}
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
      )}

      {/* List Admin */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-blue-700">
          Daftar Admin Cabang
        </h3>
        <div className="grid md:grid-cols-2 gap-5">
          {admins.map((admin) => (
            <motion.div
              key={admin.id_user}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-5 rounded-xl shadow-md border-t-4 border-blue-600 relative"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                {admin.nama}
              </h2>
              <p className="text-gray-700 text-sm">{admin.email}</p>
              <p className="text-gray-600 text-xs">
                Cabang: {admin.cabang ? admin.cabang.nama_cabang : "N/A"}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleEdit(admin)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(admin.id_user)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <Trash2 size={16} /> Hapus
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BranchAdminPage;
