import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ConfirmDeletePopup, SuccessPopup, Button, Modal } from "../../components/ui";
import { Card, CardContent, CardTitle } from "../../components/ui/Card";
import { header } from "framer-motion/client";

const API_URL = "http://localhost:8000/api";

export default function BahanBakuHarianPage() {
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split("T")[0]);
  const [pemakaianList, setPemakaianList] = useState([]);
  const [bahanList, setBahanList] = useState([]);
  const [newPemakaian, setNewPemakaian] = useState({
    id_bahan_baku: "",
    jumlah_pakai: "",
    catatan: "",
  });
  const [loading, setLoading] = useState(false);

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
  }, []);

  // Fetch data pemakaian harian
  const fetchPemakaian = async () => {
    setLoading(true);
    try {
        const res = await axios.get(`${API_URL}/bahan-baku-pakai?tanggal=${tanggal}`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });
        setPemakaianList(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data pemakaian.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPemakaian();
  }, [tanggal]);

  // Tambah data pemakaian
  const handleAdd = async () => {
    if (!newPemakaian.id_bahan_baku || !newPemakaian.jumlah_pakai) {
      alert("Pilih bahan baku dan isi jumlah pakai!");
      return;
    }

    try {
        await axios.post(
        `${API_URL}/bahan-baku-pakai`,
        {
            tanggal,
            ...newPemakaian,
        },
        {
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            },
        });
      setNewPemakaian({ id_bahan_baku: "", jumlah_pakai: "", catatan: "" });
      fetchPemakaian();
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan data pemakaian.");
    }
  };

  // Hapus pemakaian
  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data ini?")) return;
    try {
      await axios.delete(`/api/bahan-baku-pakai/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPemakaian();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <CardTitle className="text-2xl font-semibold">Pemakaian Bahan Baku Harian</CardTitle>

      {/* Filter tanggal */}
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-500">Tanggal:</label>
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="border text-gray-500 rounded-lg px-3 py-2"
        />
        <Button onClick={fetchPemakaian}>Muat Ulang</Button>
      </div>

      {/* Form tambah pemakaian */}
      <Card className="bg-white shadow-md">
        <CardContent className="p-4 space-y-3">
          <CardTitle className="font-semibold text-lg">Tambah Pemakaian</CardTitle>

          <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-3">
            <select
              value={newPemakaian.id_bahan_baku}
              onChange={(e) =>
                setNewPemakaian({ ...newPemakaian, id_bahan_baku: e.target.value })
              }
              className="border text-gray-500 rounded-lg px-3 py-2"
            >
              <option value="">Pilih Bahan Baku</option>
              {bahanList.map((b) => (
                <option key={b.id_bahan_baku} value={b.id_bahan_baku}>
                  {b.nama_bahan}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Jumlah Pakai"
              value={newPemakaian.jumlah_pakai}
              onChange={(e) =>
                setNewPemakaian({ ...newPemakaian, jumlah_pakai: e.target.value })
              }
              className="border text-gray-500 rounded-lg px-3 py-2"
            />

            <input
              type="text"
              placeholder="Catatan (opsional)"
              value={newPemakaian.catatan}
              onChange={(e) =>
                setNewPemakaian({ ...newPemakaian, catatan: e.target.value })
              }
              className="border text-gray-500 rounded-lg px-3 py-2"
            />

            <Button onClick={handleAdd}>Tambah</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabel data pemakaian */}
      <Card className="bg-white shadow-md">
        <CardContent className="overflow-x-auto p-4">
          {loading ? (
            <p className="text-center text-gray-500">Memuat data...</p>
          ) : pemakaianList.length === 0 ? (
            <p className="text-center text-gray-500">Belum ada data untuk tanggal ini.</p>
          ) : (
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 border">Nama Bahan</th>
                  <th className="p-2 border">Satuan</th>
                  <th className="p-2 border">Harga Satuan</th>
                  <th className="p-2 border">Jumlah Pakai</th>
                  <th className="p-2 border">Total Modal</th>
                  <th className="p-2 border">Catatan</th>
                  <th className="p-2 border">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pemakaianList.map((item) => (
                  <tr key={item.id_pemakaian} className="text-center">
                    <td className="p-2 border">{item.nama_bahan}</td>
                    <td className="p-2 border">
                        {Number(item.satuan) % 1 === 0
                        ? Number(item.satuan) 
                        : Number(item.satuan).toFixed(1)} kg
                    </td>
                    
                    <td className="p-2 border">
                      Rp {Number(item.harga_satuan).toLocaleString()}
                    </td>
                    <td className="p-2 border">
                        {Number(item.jumlah_pakai) % 1 === 0
                        ? Number(item.jumlah_pakai) 
                        : Number(item.jumlah_pakai).toFixed(1)} pcs</td>
                    <td className="p-2 border">
                      Rp {Number(item.total_modal).toLocaleString()}
                    </td>
                    <td className="p-2 border">{item.catatan || "-"}</td>
                    <td className="p-2 border flex justify-center items-center">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(item.id_pemakaian)}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
