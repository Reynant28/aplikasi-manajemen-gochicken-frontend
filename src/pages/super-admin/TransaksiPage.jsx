import { useState, useEffect, useCallback, useMemo } from "react";
// import * as XLSX from "xlsx"; // Dihapus, kita load dari CDN
import {
  FileDown,
  Calendar,
  Loader2,
  Eye,
  X,
  ReceiptText,
  User,
  Clock,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:8000/api";

// Fungsi helper untuk format Rupiah
const formatRupiah = (value) => {
  if (!value && value !== 0) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
};

// Fungsi helper untuk format Tanggal
const formatTanggal = (datetimeString) => {
  if (!datetimeString) return "-";
  try {
    const date = new Date(datetimeString);
    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Intl.DateTimeFormat('id-ID', options).format(date).replace(/\./g, ':');
  } catch (error) {
    console.error("Error formatting date:", error);
    return datetimeString;
  }
};

const TransaksiPage = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [detailTransaksi, setDetailTransaksi] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [isXlsxLoaded, setIsXlsxLoaded] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role || "";

  // 🔴 LOGIKA THEME DINAMIS
  const getThemeColors = (role) => {
    if (role === "super admin") {
      return {
        name: "super admin",
        bgGradient: "from-orange-50 via-white to-orange-100",
        primaryText: "text-orange-700",
        primaryAccent: "text-orange-600",
        primaryBg: "bg-orange-600",
        primaryHoverBg: "hover:bg-orange-700",
        focusRing: "focus:ring-orange-400",
      };
    }
    return {
      name: "admin cabang",
      bgGradient: "from-red-50 via-white to-red-100",
      primaryText: "text-red-700",
      primaryAccent: "text-red-600",
      primaryBg: "bg-red-600",
      primaryHoverBg: "hover:bg-red-700",
      focusRing: "focus:ring-red-400",
    };
  };

  const theme = getThemeColors(role);

  // --- useEffect untuk memuat XLSX dari CDN ---
  useEffect(() => {
    const scriptId = 'xlsx-script';
    if (window.XLSX || document.getElementById(scriptId)) {
        setIsXlsxLoaded(true);
        return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.async = true;
    script.onload = () => {
        console.log('XLSX library loaded from CDN.');
        setIsXlsxLoaded(true);
    };
    script.onerror = () => {
        console.error('Failed to load XLSX library from CDN.');
    };
    document.head.appendChild(script);
  }, []); 

  const fetchTransaksi = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/transaksi`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTransaksi(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("Fetch transaksi error:", data.message);
        setTransaksi([]);
      }
    } catch (err) {
      console.error("Fetch transaksi error:", err);
      setTransaksi([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleDetailClick = async (id_transaksi) => {
  setDetailTransaksi(null);
  setLoadingDetail(true);

    try {
      const res = await fetch(`${API_URL}/transaksi/${id_transaksi}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (res.ok) {
        setDetailTransaksi(data.data);
      } else {
        console.error("Gagal ambil detail transaksi:", data.message);
        setDetailTransaksi(null);
      }
    } catch (error) {
      console.error("Error ambil detail transaksi:", error);
      setDetailTransaksi(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (token) fetchTransaksi();
  }, [token, fetchTransaksi]);

  const filteredData = useMemo(() =>
    transaksi.filter(
      (t) => !selectedDate || t.tanggal_waktu.startsWith(selectedDate)
    ),
    [transaksi, selectedDate]
  );

  const { currentData, totalPages } = useMemo(() => {
    const total = Math.ceil(filteredData.length / itemsPerPage);
    const validCurrentPage = Math.max(1, Math.min(currentPage, total));
    const indexOfLast = validCurrentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const current = filteredData.slice(indexOfFirst, indexOfLast);
    if (currentPage !== validCurrentPage && total > 0) {
        setCurrentPage(validCurrentPage);
    }
    return { currentData: current, totalPages: total };
  }, [filteredData, currentPage, itemsPerPage]);


  const changePage = (page) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
  };

  const handleExportAllData = () => {
    if (!isXlsxLoaded || typeof window.XLSX === 'undefined') {
        console.error('XLSX library is not loaded yet.');
        alert('Fitur ekspor belum siap. Silakan coba lagi sebentar.');
        return;
    }

    setExportLoading(true);
    if (filteredData.length === 0) {
      console.warn("Tidak ada data untuk diexport.");
      alert("Tidak ada data untuk diexport.");
      setExportLoading(false);
      return;
    }

    const XLSX = window.XLSX;

    setTimeout(() => {
      const headers = [
        "Kode", "Tanggal & Waktu", "Nama Pelanggan", "Metode", "Total",
      ];

      const dataForExport = filteredData.map((t) => ({
        Kode: t.kode_transaksi,
        "Tanggal & Waktu": formatTanggal(t.tanggal_waktu),
        "Nama Pelanggan": t.nama_pelanggan || "-",
        Metode: t.metode_pembayaran,
        Total: t.total_harga || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(dataForExport);
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

      ws['!cols'] = [ { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 15 } ];

      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let R = range.s.r + 1; R <= range.e.r; ++R) { 
          const cell_address = { c: 4, r: R }; 
          const cell_ref = XLSX.utils.encode_cell(cell_address);
          if (ws[cell_ref]) {
              ws[cell_ref].t = 'n'; 
              ws[cell_ref].z = '#,##0'; 
          }
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Transaksi");
      const fileName = `Pelaporan_Transaksi_${selectedDate || 'Semua'}.xlsx`;
      XLSX.writeFile(wb, fileName);
      setExportLoading(false);
    }, 500);
  };

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];
    const actualTotalPages = totalPages === 0 ? 1 : totalPages; 

    if (actualTotalPages <= maxPagesToShow) {
      for (let i = 1; i <= actualTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let middleStart = Math.max(2, currentPage - Math.floor((maxPagesToShow - 3) / 2));
      let middleEnd = Math.min(actualTotalPages - 1, currentPage + Math.floor((maxPagesToShow - 2) / 2));

      if (middleStart === 2 && middleEnd < maxPagesToShow - 2) {
          middleEnd = Math.min(actualTotalPages - 1, maxPagesToShow - 2);
      }
      if (middleEnd === actualTotalPages - 1 && middleStart > actualTotalPages - maxPagesToShow + 3) {
          middleStart = Math.max(2, actualTotalPages - maxPagesToShow + 3);
      }

      if (middleStart > 2) pages.push("...");
      for (let i = middleStart; i <= middleEnd; i++) pages.push(i);
      if (middleEnd < actualTotalPages - 1) pages.push("...");
      pages.push(actualTotalPages);
    }
    return pages;
  };


  return (
    // 🔴 PERUBAHAN UTAMA: Menambahkan 'bg-gradient-to-br' agar gradient muncul
    <div className={`min-h-screen p-6 bg-gradient-to-br ${theme.bgGradient}`}>
      <style>{`.date-input-container input::-webkit-calendar-picker-indicator { display: none; -webkit-appearance: none; }`}</style>
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              {/* Icon Wallet saya hapus agar konsisten jika diminta, atau biarkan jika butuh */}
              Riwayat Transaksi
            </h1>
            <p className="text-gray-500 mt-1">Kelola dan lihat semua riwayat transaksi yang tercatat.</p>
          </div>
          {/* Area kosong jika ingin menambah tombol di kanan header */}
      </div>

      {/* Filter, Export, dan Pagination */}
      <div className="mb-6 bg-white p-4 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Kontrol Kiri: Filter & Export */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Filter Tanggal */}
          <div className="relative w-full sm:w-auto date-input-container">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1); 
              }}
              className={`border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 pl-10 w-full sm:w-60 shadow-sm focus:ring-2 ${theme.focusRing} focus:outline-none text-gray-700 transition`}
            />
          </div>
          {/* Tombol Export */}
          <button
            onClick={handleExportAllData}
            disabled={!isXlsxLoaded || exportLoading || filteredData.length === 0}
            className={`flex items-center justify-center gap-2 ${theme.primaryBg} ${theme.primaryHoverBg} text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold disabled:opacity-60 disabled:cursor-not-allowed`}
            title={!isXlsxLoaded ? "Memuat library ekspor..." : filteredData.length === 0 ? "Tidak ada data untuk diekspor" : "Ekspor data ke Excel"}
          >
            {exportLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <FileDown size={18} />
            )}
            Ekspor (Excel)
          </button>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center border border-gray-200 rounded-xl shadow-md divide-x divide-gray-200 bg-white">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-3 rounded-l-xl transition duration-150 ease-in-out text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-50 hover:${theme.primaryText}`}
            >
              <ChevronLeft size={18} />
            </button>
            {getPageNumbers().map((page, i) => (
              <button
                key={i}
                onClick={() => typeof page === "number" && changePage(page)}
                disabled={page === "..."}
                className={`px-4 py-2 text-sm font-medium transition duration-150 ease-in-out ${
                  currentPage === page
                    ? `${theme.primaryBg} text-white shadow-inner`
                    : page === "..."
                    ? "text-gray-400 cursor-default"
                    : `text-gray-700 hover:bg-gray-50 hover:${theme.primaryText}`
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-3 rounded-r-xl transition duration-150 ease-in-out text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-50 hover:${theme.primaryText}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Tabel transaksi */}
      <div className="rounded-2xl shadow-lg bg-white overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <Loader2 className={`animate-spin h-8 w-8 mr-3 ${theme.primaryAccent}`} />
            Memuat data transaksi...
        </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kode
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tanggal & Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Metode
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.length > 0 ? (
                currentData.map((t) => (
                  <tr
                    key={t.id_transaksi}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {t.kode_transaksi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatTanggal(t.tanggal_waktu)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {t.nama_pelanggan || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        t.metode_pembayaran.toLowerCase() === 'cash'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                      }`}>
                        {t.metode_pembayaran}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${theme.primaryAccent}`}>
                      {formatRupiah(t.total_harga)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <button
                        onClick={() => handleDetailClick(t.id_transaksi)}
                        className={`bg-white border border-gray-200 ${theme.primaryText} hover:bg-gray-50 px-3 py-1.5 rounded-lg transition duration-150 shadow-sm flex items-center gap-1 mx-auto`}
                      >
                        <Eye size={14} />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                   <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    <ReceiptText size={40} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-lg">Tidak ada transaksi</p>
                    <p className="text-sm">
                      {selectedDate ? "Tidak ada transaksi pada tanggal ini." : "Belum ada transaksi yang tercatat."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        </div>
      </div>

      {/* Modal detail transaksi */}
      <AnimatePresence>
        {detailTransaksi && (
          <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={() => setDetailTransaksi(null)}
        >
            <motion.div
            key="modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Detail Transaksi
                  </h2>
                  <p className="text-sm text-gray-500">
                    {!loadingDetail && detailTransaksi.kode_transaksi ? detailTransaksi.kode_transaksi : "Memuat..."}
                  </p>
                </div>
                <button
                  onClick={() => setDetailTransaksi(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

            {/* Konten Modal */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-10 text-gray-500">
                    <Loader2 className={`animate-spin h-6 w-6 mr-2 ${theme.primaryAccent}`} />
                    Memuat detail...
                  </div>
                ) : detailTransaksi && detailTransaksi.kode_transaksi ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      <div className="flex items-start gap-3">
                        <User size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Pelanggan</p>
                          <p className="font-medium text-gray-800">{detailTransaksi.nama_pelanggan || "-"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Tanggal & Waktu</p>
                          <p className="font-medium text-gray-800">{formatTanggal(detailTransaksi.tanggal_waktu)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CreditCard size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Metode Pembayaran</p>
                           <p className="font-medium text-gray-800">{detailTransaksi.metode_pembayaran}</p>
                        </div>
                      </div>
                    </div>

                    {/* Tabel Item */}
                    <table className="w-full text-sm border-t border-b border-gray-200 mt-4">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-gray-600">
                          <th className="px-4 py-2 font-semibold">Produk</th>
                          <th className="px-4 py-2 font-semibold text-center">Qty</th>
                          <th className="px-4 py-2 font-semibold text-right">Harga</th>
                          <th className="px-4 py-2 font-semibold text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(detailTransaksi.details || detailTransaksi.detail) && 
                        (detailTransaksi.details || detailTransaksi.detail).length > 0 ? (
                          (detailTransaksi.details || detailTransaksi.detail).map((d, idx) => (
                            <tr key={idx} className="text-gray-800">
                              <td className="px-4 py-2">
                                {d.produk?.nama_produk || 
                                d.nama_produk || 
                                `Produk ${d.id_produk}`}
                              </td>
                              <td className="px-4 py-2 text-center">{d.jumlah_produk}</td>
                              <td className="px-4 py-2 text-right">{formatRupiah(d.harga_item)}</td>
                              <td className="px-4 py-2 text-right font-medium">{formatRupiah(d.subtotal)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-4 py-4 text-center text-gray-500 italic">
                              Tidak ada detail produk.
                              <div className="text-xs mt-1">
                                details: {detailTransaksi.details ? 'ada' : 'tidak'}, 
                                detail: {detailTransaksi.detail ? 'ada' : 'tidak'}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Rincian Total */}
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                      <div className="flex justify-between items-center text-lg font-bold text-gray-800">
                        <span>TOTAL</span>
                        <span className={theme.primaryAccent}>
                          {formatRupiah(detailTransaksi.total_harga)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                   <XCircle size={32} className={`mb-2 text-gray-400`}/>
                     <p>Gagal memuat detail transaksi.</p>
                  </div>
                )}
              </div>
           {/* Footer Modal */}
              <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setDetailTransaksi(null)}
                  className={`${theme.primaryBg} ${theme.primaryHoverBg} text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold`}
                >
                  Tutup
                </button>
           </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransaksiPage;