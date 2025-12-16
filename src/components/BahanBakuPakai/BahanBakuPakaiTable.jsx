// src/components/BahanBakuPakai/BahanBakuPakaiTable.jsx
import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Button, Card, CardContent } from "../ui"; // Pastikan path ke komponen UI Anda benar

export default function BahanBakuPakaiTable({
  pemakaianList,
  loading,
  openDeleteConfirm,
}) {
  return (
    <Card className="bg-white/90 backdrop-blur shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
      <CardContent className="overflow-x-auto p-4">
        {loading ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 italic py-6"
          >
            Memuat data...
          </motion.p>
        ) : pemakaianList.length === 0 ? (
          <p className="text-center text-gray-500 py-6">
            Belum ada data untuk tanggal ini.
          </p>
        ) : (
          <table className="min-w-full text-sm rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 text-gray-800">
                {[
                  "Nama Bahan",
                  "Satuan",
                  "Harga Satuan",
                  "Jumlah Pakai",
                  "Total Modal",
                  "Catatan",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-left font-semibold border-b border-amber-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pemakaianList.map((item, i) => (
                <tr
                  key={item.id_pemakaian}
                  className={`transition-colors duration-150 ${
                    i % 2 === 0 ? "bg-white" : "bg-amber-50"
                  } hover:bg-amber-100`}
                >
                  <td className="py-3 px-4">{item.nama_bahan}</td>
                  {/* Satuan - DIPERBAIKI */}
                  <td className="py-3 px-4">
                    {Number(item.satuan)} kg
                  </td>
                  {/* Harga Satuan */}
                  <td className="py-3 px-4 text-gray-700">
                    Rp {Number(item.harga_satuan).toLocaleString()}
                  </td>
                  {/* Jumlah Pakai */}
                  <td className="py-3 px-4">
                    {Number(item.jumlah_pakai)} pcs
                  </td>
                  {/* Total Modal */}
                  <td className="py-3 px-4 text-emerald-600 font-medium">
                    Rp {Number(item.total_modal).toLocaleString()}
                  </td>
                  {/* Catatan */}
                  <td className="py-3 px-4 text-gray-600">
                    {item.catatan || "-"}
                  </td>
                  {/* Aksi */}
                  <td className="py-3 px-4">
                    <Button
                      onClick={() =>
                        openDeleteConfirm(item.id_pemakaian, item.nama_bahan)
                      }
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md shadow-sm transition"
                    >
                      <Trash2 size={16} /> Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}