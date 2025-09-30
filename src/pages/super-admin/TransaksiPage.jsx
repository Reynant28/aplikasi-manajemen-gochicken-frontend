// src/pages/TransaksiPage.jsx
import { useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:8000/api";

const TransaksiPage = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [detailTransaksi, setDetailTransaksi] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const token = localStorage.getItem("token");

  const fetchTransaksi = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/transaksi`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTransaksi(data.data || []);
      } else {
        console.error("Fetch transaksi error:", data.message);
      }
    } catch (err) {
      console.error("Fetch transaksi error:", err);
      setTransaksi([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchTransaksi();
  }, [token, fetchTransaksi]);

  // filter berdasarkan tanggal
  const filteredData = transaksi.filter(
    (t) => !selectedDate || t.tanggal_waktu.startsWith(selectedDate)
  );

  // pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- Fungsi untuk mengontrol tombol yang ditampilkan ---
  const getPageNumbers = () => {
    const maxPagesToShow = 5; 
    const pages = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(
        2,
        currentPage - Math.floor((maxPagesToShow - 3) / 2)
      );
      const endPage = Math.min(
        totalPages - 1,
        currentPage + Math.ceil((maxPagesToShow - 3) / 2)
      );

      pages.push(1);

      if (startPage > 2) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    if (pages[0] === "...") {
      pages.shift();
    }
    if (pages[pages.length - 1] === "...") {
      pages.pop();
    }
    
    return pages.filter((value, index, self) => self.indexOf(value) === index);
  };
  // --------------------------------------------------------

  return (
    <div className="p-6">
      
      {/* Judul dengan warna hijau */}
      <h1 className="text-3xl font-bold mb-6 text-green-700">
          Kelola Transaksi
      </h1>

      {/* Filter tanggal dan Pagination */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Pilih Tanggal
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-xl px-4 py-2 w-60 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-700"
          />
        </div>

        {/* Pagination dengan warna hijau */}
        {totalPages > 1 && (
          <div className="flex items-center border border-gray-200 rounded-xl shadow-md divide-x divide-gray-200">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-3 text-gray-600 rounded-l-xl transition duration-150 ease-in-out ${
                currentPage === 1
                  ? "bg-gray-100 cursor-not-allowed text-gray-400"
                  : "bg-white hover:bg-green-50 hover:text-green-600"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>
            
            {/* Tampilkan tombol halaman */}
            {getPageNumbers().map((page, i) => (
              <button
                key={i}
                onClick={() => typeof page === 'number' && changePage(page)}
                disabled={page === "..."}
                className={`px-4 py-2 text-sm font-medium transition duration-150 ease-in-out ${
                  currentPage === page
                    ? "bg-green-600 text-white shadow-inner shadow-green-800/20" 
                    : page === "..."
                    ? "bg-white text-gray-400 cursor-default"
                    : "bg-white text-gray-700 hover:bg-green-50 hover:text-green-600" 
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-3 text-gray-600 rounded-r-xl transition duration-150 ease-in-out ${
                currentPage === totalPages
                  ? "bg-gray-100 cursor-not-allowed text-gray-400"
                  : "bg-white hover:bg-green-50 hover:text-green-600"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Tabel transaksi */}
      <div className="overflow-x-auto border rounded-lg shadow-md bg-white">
        {loading ? (
          <p className="text-center py-6 text-gray-500">⏳ Memuat data...</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-white border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Kode
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Tanggal & Waktu
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Nama Pelanggan
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Metode
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Total
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((t, i) => (
                  <tr
                    key={t.id_transaksi}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-green-50 transition`}
                  >
                    <td className="px-4 py-2 text-gray-700">
                      {t.kode_transaksi}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {t.tanggal_waktu}
                    </td>
                    <td className="px-4 py-2 text-gray-700 font-medium">
                      {t.nama_pelanggan || "-"}
                    </td>
                    <td className="px-4 py-2 text-green-600 font-semibold">
                      {t.metode_pembayaran}
                    </td>
                    <td className="px-4 py-2 font-bold text-red-600">
                      Rp {(t.total_harga || 0).toLocaleString()}
                    </td>
                    {/* HANYA TOMBOL DETAIL */}
                    <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => setDetailTransaksi(t)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition shadow-md"
                        >
                          Detail
                        </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-6 text-gray-500"
                  >
                    ❌ Tidak ada transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal detail transaksi */}
      {detailTransaksi && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[600px] overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-green-500/30">
              <h2 className="text-lg font-bold text-green-700">
                🐔 GoChicken Administrator
              </h2>
              <p className="text-sm text-gray-500">
                Detail Transaksi {detailTransaksi.kode_transaksi}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <p className="font-semibold text-gray-700">👤 Pelanggan:</p>
                <p className="text-gray-900">
                  {detailTransaksi.nama_pelanggan || "-"}
                </p>
                <p className="font-semibold text-gray-700">
                  📅 Tanggal & Waktu:
                </p>
                <p className="text-gray-900">{detailTransaksi.tanggal_waktu}</p>
                <p className="font-semibold text-gray-700">
                  💳 Metode Pembayaran:
                </p>
                <p className="text-gray-900">
                  {detailTransaksi.metode_pembayaran}
                </p>
              </div>
              <table className="w-full text-sm border mt-4">
                <thead>
                  <tr className="bg-green-50">
                    <th className="border px-3 py-2 text-left text-gray-900">
                      Produk
                    </th>
                    <th className="border px-3 py-2 text-center text-gray-900">
                      Qty
                    </th>
                    <th className="border px-3 py-2 text-right text-gray-900">
                      Harga
                    </th>
                    <th className="border px-3 py-2 text-right text-gray-900">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {detailTransaksi.detail.map((d, idx) => (
                    <tr key={idx}>
                      <td className="border px-3 py-2 text-gray-900">
                        {d.produk?.nama_produk || "Produk"}
                      </td>
                      <td className="border px-3 py-2 text-center text-gray-900">
                        {d.jumlah_produk}
                      </td>
                      <td className="border px-3 py-2 text-right text-gray-900">
                        Rp {parseInt(d.harga_item).toLocaleString()}
                      </td>
                      <td className="border px-3 py-2 text-right text-gray-900">
                        Rp {parseInt(d.subtotal).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between font-bold text-gray-800">
                  <span>TOTAL</span>
                  <span className="text-red-600">
                    Rp {parseInt(detailTransaksi.total_harga).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4 border-t">
              <button
                onClick={() => setDetailTransaksi(null)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransaksiPage;