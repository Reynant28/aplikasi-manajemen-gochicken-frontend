// src/pages/ProdukPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Package, Edit, Trash2, Plus, Minus } from "lucide-react";

const API_URL = "http://localhost:8000/api";

const ProdukPage = () => {
  const [formData, setFormData] = useState({
    nama_produk: "",
    harga: "",
    stok: "",
    kategori: "",
    gambar: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [produk, setProduk] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch produk
  const fetchProduk = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/produk`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProduk(data.data || []);
    } catch (err) {
      console.error("Failed to fetch produk:", err);
      setProduk([]);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchProduk();
  }, [token, fetchProduk]);

  // Input handler
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Submit produk
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) form.append(key, value);
    });

    try {
      const res = await fetch(
        `${API_URL}/produk${editingId ? "/" + editingId : ""}`,
        {
          method: "POST", // ganti ke PUT kalau backend support update
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ " + data.message);
        setFormData({ nama_produk: "", harga: "", stok: "", kategori: "", gambar: null });
        setEditingId(null);
        fetchProduk();
      } else {
        setMessage("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("❌ Error koneksi server");
    }

    setLoading(false);
  };

  // Delete produk
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      const res = await fetch(`${API_URL}/produk/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ " + data.message);
        fetchProduk();
      } else {
        setMessage("❌ " + (data.message || "Gagal hapus"));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Edit produk
  const handleEdit = (prod) => {
    setEditingId(prod.id_produk);
    setFormData({
      nama_produk: prod.nama_produk,
      harga: prod.harga,
      stok: prod.stok,
      kategori: prod.kategori,
      gambar: null,
    });
  };

  // Update stok
  const updateStok = async (id, jumlah) => {
    try {
      const res = await fetch(`${API_URL}/produk/${id}/stok`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jumlah }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ " + data.message);
        fetchProduk();
      } else {
        setMessage("❌ " + (data.message || "Gagal update stok"));
      }
    } catch (err) {
      console.error("Update stok error:", err);
    }
  };

  return (
    <div className="p-6 space-y-12">
      {/* Form Produk */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl mx-auto border-t-4 border-blue-600"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-700">
          <Package className="text-blue-600" />
          {editingId ? "Edit Produk" : "Tambah Produk"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                name="nama_produk"
                placeholder="Nama Produk"
                value={formData.nama_produk}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                required
            />
            <input
                type="number"
                name="harga"
                placeholder="Harga"
                value={formData.harga}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                required
            />
            <input
                type="number"
                name="stok"
                placeholder="Stok"
                value={formData.stok}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                required
            />
            <input
                type="text"
                name="kategori"
                placeholder="Kategori"
                value={formData.kategori}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                required
            />
            <input
                type="file"
                name="gambar"
                accept="image/*"
                onChange={handleChange}
                className="w-full border p-2 rounded-lg text-gray-900 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
                {loading ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Produk"}
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

      {/* List Produk */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          📦 Daftar Produk
        </h3>
        {produk.length === 0 ? (
          <p className="text-gray-500">Belum ada produk ditambahkan.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {produk.map((prod) => (
              <motion.div
                key={prod.id_produk}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border hover:shadow-xl transition"
              >
                {prod.gambar_url && (
                  <img
                    src={prod.gambar_url}
                    alt={prod.nama_produk}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-gray-900">{prod.nama_produk}</h2>
                  <p className="text-gray-700 text-sm">Harga: Rp{prod.harga}</p>
                  <p className="text-gray-700 text-sm">Kategori: {prod.kategori}</p>
                  <p className="text-gray-600 text-sm mb-2">Stok: {prod.stok}</p>

                  {/* Stok Button */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => updateStok(prod.id_produk, +1)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <Plus size={16} /> Tambah
                    </button>
                    <button
                      onClick={() => updateStok(prod.id_produk, -1)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      <Minus size={16} /> Kurangi
                    </button>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(prod)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id_produk)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 size={16} /> Hapus
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProdukPage;
