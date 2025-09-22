// src/pages/AkunAdminAdvertisingPage.jsx
import React, { useState, useEffect, useCallback } from "react";
//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

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

  // 🔑 Ambil token dari localStorage
  const token = localStorage.getItem("token");

  // ✅ Bungkus pakai useCallback biar stable di dependency
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
    } else {
      console.error("⚠️ Token tidak ditemukan, user belum login");
    }
  }, [token, fetchAdmins, fetchCabang]); // ✅ sekarang aman

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  return (
    <div className="p-6 space-y-8">
      {showForm && (
          <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg mx-auto border-l-4 border-blue-600"
          >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-700">
                  <UserPlus className="text-blue-600" /> Tambah Admin Cabang
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                  {/* ⬅️ Hapus input untuk ID User */}
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
                      required
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
                      onClick={handleSubmit}
                      disabled={loading || cabang.length === 0}
                      className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                      {loading ? "Menyimpan..." : "Tambah Admin"}
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
      )}

      {/* List admin */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-blue-700">
          Daftar Admin Cabang
        </h3>
        <div className="grid md:grid-cols-2 gap-5">
          {admins.map((admin) => (
            <motion.div
              key={admin.id_user}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-600"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                {admin.nama}
              </h2>
              <p className="text-gray-700 text-sm">{admin.email}</p>
              <p className="text-gray-600 text-xs">
                Cabang: {admin.cabang ? admin.cabang.nama_cabang : "N/A"}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BranchAdminPage;