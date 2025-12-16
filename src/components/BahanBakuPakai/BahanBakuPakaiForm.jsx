// src/components/BahanBakuPakai/BahanBakuPakaiForm.jsx
import React from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardTitle } from "../ui"; // Pastikan path ke komponen UI Anda benar

export default function BahanBakuPakaiForm({
  newPemakaian,
  bahanList,
  setNewPemakaian,
  handleAdd,
  loading,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    handleAdd();
  };

  return (
    <Card className="bg-white/90 backdrop-blur shadow-md border border-gray-100">
      <CardContent className="p-5 space-y-3">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Tambah Pemakaian
        </CardTitle>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-3">
            <select
              value={newPemakaian.id_bahan_baku}
              onChange={(e) =>
                setNewPemakaian({ ...newPemakaian, id_bahan_baku: e.target.value })
              }
              className="border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400"
              required
              disabled={loading}
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
              className="border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400"
              required
              min="1"
              disabled={loading}
            />

            <input
              type="text"
              placeholder="Catatan (opsional)"
              value={newPemakaian.catatan}
              onChange={(e) =>
                setNewPemakaian({ ...newPemakaian, catatan: e.target.value })
              }
              className="border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400"
              disabled={loading}
            />

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-md transition px-4 py-2 disabled:bg-gray-400"
              disabled={loading}
            >
              <Plus size={18} />
              {loading ? "Memproses..." : "Tambah"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}