// src/components/DailyReport/DailyReportDetailTable.jsx
import React, { memo } from "react"; // Impor 'memo' untuk optimasi
import { motion } from "framer-motion";

// Helper function formatRupiah (Jika tidak diimport dari utilitas)
const formatRupiahLocal = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

// Helper untuk format angka tanpa .00
const formatNumber = (value) => {
  const num = Number(value);
  return num % 1 === 0 ? num.toString() : num.toString();
};

// Helper untuk status badge di section 'pengeluaran'
const StatusBadge = ({ value }) => (
  <span
    className={`px-2 py-1 rounded-full text-xs font-semibold ${
      value > 0
        ? "bg-green-100 text-green-700" // Sesuai tema hijau Anda
        : "bg-gray-100 text-gray-500"
    }`}
  >
    {value > 0 ? "Aktif" : "Selesai"}
  </span>
);

function DailyReportDetailTable({ section, data, theme }) {
  // 1. Logika 'getSectionData' disempurnakan
  // - 'headers' sekarang menjadi array of object untuk alignment
  // - 'colSpan' didefinisikan di sini
  const getSectionData = () => {
    switch (section) {
      case "penjualan":
        return {
          title: "Penjualan Produk",
          total: data.penjualan?.total_penjualan || 0,
          details: data.penjualan?.detail || [],
          headers: [
            { label: "Produk", align: "left" },
            { label: "Jumlah", align: "center" },
            { label: "Total", align: "right" },
          ],
          colSpan: 3,
        };
      case "bahan_baku":
        return {
          title: "Bahan Baku Harian",
          total: data.bahan_baku?.total_modal_bahan_baku || 0,
          details: data.bahan_baku?.detail || [],
          headers: [
            { label: "Nama Bahan", align: "left" },
            { label: "Jumlah Pakai", align: "center" },
            { label: "Satuan", align: "center" }, // TAMBAH KOLOM SATUAN TERPISAH
            { label: "Total Modal", align: "right" },
          ],
          colSpan: 4, // UBAH COLSPAN JADI 4
        };
      case "pengeluaran":
        return {
          title: "Pengeluaran",
          total: data.pengeluaran_harian || 0,
          details: data.pengeluaran?.detail || [],
          headers: [
            { label: "Keterangan", align: "left" },
            { label: "Jumlah", align: "right" },
            { label: "Cicilan Harian", align: "right" },
            { label: "Status", align: "center" }, // Status lebih baik di-center
          ],
          colSpan: 4,
        };
      default:
        return { title: "", total: 0, details: [], headers: [], colSpan: 1 };
    }
  };

  const sectionData = getSectionData();

  // 2. Logika render baris (tbody) dipisah ke fungsi sendiri
  // Ini membuat bagian <tbody> di JSX jadi jauh lebih bersih
  const renderRowContent = (item, index) => {
    switch (section) {
      case "penjualan":
        return (
          <>
            <td className="p-3 font-medium text-gray-700">{item.produk}</td>
            <td className="p-3 text-center">{item.jumlah_produk}</td>
            <td
              className={`p-3 text-right font-semibold ${theme.primaryAccent}`}
            >
              {formatRupiahLocal(item.total_penjualan_produk)}
            </td>
          </>
        );
      case "bahan_baku":
        return (
          <>
            <td className="p-3 font-medium text-gray-700">{item.nama_bahan}</td>
            <td className="p-3 text-center">
              {formatNumber(item.jumlah_pakai)} {/* JUMLAH PAKAI */}
            </td>
            <td className="p-3 text-center">
              {formatNumber(item.satuan)} kg {/* SATUAN TERPISAH */}
            </td>
            <td
              className={`p-3 text-right font-semibold ${theme.primaryAccent}`}
            >
              {formatRupiahLocal(item.modal_produk)}
            </td>
          </>
        );
      case "pengeluaran":
        return (
          <>
            <td className="p-3 font-medium text-gray-700">{item.jenis}</td>
            <td className="p-3 text-right">
              {formatRupiahLocal(item.jumlah)}
            </td>
            <td
              className={`p-3 text-right font-semibold ${theme.primaryAccent}`}
            >
              {formatRupiahLocal(item.cicilan_harian)}
            </td>
            <td className="p-3 text-center">
              <StatusBadge value={item.cicilan_harian} />
            </td>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`bg-white rounded-xl shadow-md overflow-hidden ${
        section === "pengeluaran" ? "lg:col-span-2" : ""
      }`}
    >
      {/* Bagian Header Kartu */}
      <div className="p-4 border-b bg-gray-50/70">
        <h2 className={`text-lg font-semibold ${theme.primaryText}`}>
          {sectionData.title}
        </h2>
        <p className="text-sm text-gray-500">
          Total: {formatRupiahLocal(sectionData.total)}
        </p>
      </div>

      {/* Bagian Tabel */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-600">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {/* 3. Render 'thead' jadi sangat bersih */}
              {sectionData.headers.map((h) => (
                <th
                  key={h.label}
                  className={`p-3 font-semibold text-${h.align}`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sectionData.details.length === 0 ? (
              <tr>
                <td
                  colSpan={sectionData.colSpan} // Menggunakan colSpan dinamis
                  className="p-6 text-center text-gray-400"
                >
                  Tidak ada data pada tanggal ini
                </td>
              </tr>
            ) : (
              // 4. Render 'tbody' memanggil helper
              sectionData.details.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/70">
                  {renderRowContent(item, i)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// 5. Bungkus dengan memo()
// Ini mencegah re-render jika props (section, data, theme) tidak berubah
export default memo(DailyReportDetailTable);