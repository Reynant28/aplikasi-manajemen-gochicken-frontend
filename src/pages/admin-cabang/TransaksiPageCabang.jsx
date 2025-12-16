import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertTriangle, X } from "lucide-react";
import * as XLSX from "xlsx";
import TransaksiTable from "../../components/Transaksi/TransaksiTable.jsx";
import TransaksiDetailModal from "../../components/Transaksi/TransaksiDetailModal.jsx";

const API_URL = "http://localhost:8000/api";

const TransaksiPageCabang = () => {
    const [transaksi, setTransaksi] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [detailTransaksi, setDetailTransaksi] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const token = localStorage.getItem("token");
    const cabang = JSON.parse(localStorage.getItem("cabang") || "null");
    const cabangId = cabang?.id_cabang;
    const cabangName = cabang?.nama_cabang || 'Cabang';

    // 🔴 LOGIKA THEME DINAMIS (Disamakan dengan PengeluaranPage)
    const getThemeColors = () => {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (user?.role === 'super admin') {
            return {
                primary: 'bg-orange-600 hover:bg-orange-700',
                primaryLight: 'bg-orange-50',
                primaryText: 'text-orange-700',
                primaryBorder: 'border-orange-200',
                ring: 'focus:ring-orange-500',
                gradient: 'from-orange-50 to-white',
                iconColor: 'text-orange-600'
            };
        }
        return {
            primary: 'bg-red-600 hover:bg-red-700',
            primaryLight: 'bg-red-50',
            primaryText: 'text-red-700',
            primaryBorder: 'border-red-200',
            ring: 'focus:ring-red-500',
            gradient: 'from-red-50 to-white',
            iconColor: 'text-red-600'
        };
    };

    const theme = getThemeColors();

    const fetchTransaksi = useCallback(async () => {
        if (!cabangId) {
            setError("Data cabang tidak ditemukan.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/cabang/${cabangId}/transaksi`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                // Sort by tanggal_waktu descending (terbaru di atas)
                const sortedData = (data.data || []).sort((a, b) => 
                    new Date(b.tanggal_waktu) - new Date(a.tanggal_waktu)
                );
                setTransaksi(sortedData);
            } else {
                console.error("Fetch transaksi error:", data.message);
                setError("Gagal mengambil data transaksi.");
            }
        } catch (err) {
            console.error("Fetch transaksi error:", err);
            setError("Gagal mengambil data transaksi.");
            setTransaksi([]);
        } finally {
            setLoading(false);
        }
    }, [token, cabangId]);

    useEffect(() => {
        if (token) {
            fetchTransaksi();
        }
    }, [token, fetchTransaksi]);

    const handleDetailClick = async (id_transaksi) => {
        try {
            setLoadingDetail(true);
            setShowDetailModal(true);
            const res = await fetch(`${API_URL}/transaksi/${id_transaksi}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                console.log("Detail transaksi response:", data.data); // Debug log
                setDetailTransaksi(data.data);
            } else {
                console.error("Gagal ambil detail transaksi:", data.message);
                setError("Gagal mengambil detail transaksi.");
            }
        } catch (error) {
            console.error("Error ambil detail transaksi:", error);
            setError("Terjadi kesalahan saat mengambil detail transaksi.");
        } finally {
            setLoadingDetail(false);
        }
    };

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

    const handleExportAllData = () => {
        if (filteredData.length === 0) {
            alert("Tidak ada data transaksi untuk diexport.");
            return;
        }

        // Format tanggal untuk nama file
        const today = new Date().toISOString().split('T')[0];
        const formattedDate = today.split('-').reverse().join('-');
        
        // Data yang akan di-export (hanya data cabang saat ini)
        const dataForExport = filteredData.map((t) => ({
            "Kode Transaksi": t.kode_transaksi,
            "Tanggal & Waktu": t.tanggal_waktu,
            "Nama Pelanggan": t.nama_pelanggan || "-",
            "Metode Pembayaran": t.metode_pembayaran,
            "Total Harga": t.total_harga || 0,
            "Status": t.status || "Selesai",
        }));

        // Buat workbook dan worksheet
        const wb = XLSX.utils.book_new();
        
        // Worksheet untuk data transaksi
        const ws = XLSX.utils.json_to_sheet(dataForExport);
        
        // Tambahkan header informasi cabang
        const infoRows = [
            [`LAPORAN TRANSAKSI - ${cabangName.toUpperCase()}`],
            [`Periode: ${selectedDate || 'Semua Data'}`],
            [`Tanggal Export: ${formattedDate}`],
            [`Total Transaksi: ${filteredData.length}`],
            [], // Baris kosong
            ["Kode Transaksi", "Tanggal & Waktu", "Nama Pelanggan", "Metode Pembayaran", "Total Harga", "Status"]
        ];

        XLSX.utils.sheet_add_aoa(ws, infoRows, { origin: "A1" });

        // Style untuk kolom
        ws['!cols'] = [
            { wch: 20 }, // Kode Transaksi
            { wch: 25 }, // Tanggal & Waktu
            { wch: 20 }, // Nama Pelanggan
            { wch: 18 }, // Metode Pembayaran
            { wch: 15 }, // Total Harga
            { wch: 12 }, // Status
        ];

        // Merge cells untuk judul
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }); // Judul
        ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }); // Periode
        ws['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }); // Tanggal Export
        ws['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: 5 } }); // Total Transaksi

        XLSX.utils.book_append_sheet(wb, ws, "Data Transaksi");

        // Buat nama file yang informatif
        const periodText = selectedDate ? `Periode-${selectedDate}` : 'Semua-Data';
        const fileName = `Transaksi-${cabangName.replace(/\s+/g, '-')}-${periodText}-${today}.xlsx`;
        
        XLSX.writeFile(wb, fileName);
    };

    const getPageNumbers = () => {
        const maxPagesToShow = 5;
        const pages = [];

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const startPage = Math.max(2, currentPage - Math.floor((maxPagesToShow - 3) / 2));
            const endPage = Math.min(totalPages - 1, currentPage + Math.ceil((maxPagesToShow - 3) / 2));

            pages.push(1);
            if (startPage > 2) pages.push("...");
            for (let i = startPage; i <= endPage; i++) pages.push(i);
            if (endPage < totalPages - 1) pages.push("...");
            if (totalPages > 1) pages.push(totalPages);
        }

        return pages.filter((value, index, self) => self.indexOf(value) === index);
    };

    return (
        <>
            {/* Style untuk custom date input icon seperti di referensi */}
            <style>{`
                .date-input-container input::-webkit-calendar-picker-indicator { opacity: 0; cursor: pointer; }
            `}</style>

            <div className={`p-6 space-y-6 min-h-screen bg-gradient-to-br ${theme.gradient}`}>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-gray-800">Kelola Transaksi</h1>
                        <p className="text-gray-500 mt-1">
                            Riwayat dan detail transaksi untuk <strong className={`font-semibold ${theme.primaryText}`}>{cabangName}</strong>
                        </p>
                    </motion.div>
                    
                    <motion.button
                        onClick={handleExportAllData}
                        className={`flex items-center gap-2 ${theme.primary} text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Download size={20} /> Export Excel
                    </motion.button>
                </div>

                {/* Filter and Pagination */}
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-md border ${theme.primaryBorder}`}>
                    <div className="flex items-center gap-2">
                        <div className="relative date-input-container">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className={`border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm focus:ring-2 ${theme.ring} focus:outline-none focus:border-transparent text-gray-700 transition`}
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        </div>
                        
                        {selectedDate && (
                            <button
                                onClick={() => {
                                    setSelectedDate("");
                                    setCurrentPage(1);
                                }}
                                className={`text-sm ${theme.primaryText} hover:underline font-medium`}
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    {/* Informasi Data */}
                    <div className="text-sm text-gray-600">
                        Menampilkan {currentData.length} dari {filteredData.length} transaksi
                        {selectedDate && ` pada tanggal ${selectedDate}`}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => changePage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg transition duration-150 ease-in-out disabled:text-gray-300 disabled:cursor-not-allowed hover:${theme.primaryLight} ${theme.primaryText}`}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex items-center gap-1">
                                {getPageNumbers().map((page, i) => (
                                    <button
                                        key={i}
                                        onClick={() => typeof page === "number" && changePage(page)}
                                        disabled={page === "..."}
                                        className={`min-w-[36px] px-3 py-2 text-sm font-medium rounded-lg transition duration-150 ease-in-out ${
                                            currentPage === page
                                                ? `${theme.primary} text-white shadow-md`
                                                : page === "..."
                                                ? "text-gray-400 cursor-default"
                                                : `text-gray-700 hover:${theme.primaryLight} hover:${theme.primaryText}`
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => changePage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-lg transition duration-150 ease-in-out disabled:text-gray-300 disabled:cursor-not-allowed hover:${theme.primaryLight} ${theme.primaryText}`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex items-center gap-3 p-4 ${theme.primaryLight} ${theme.primaryText} ${theme.primaryBorder} rounded-lg border`}
                        >
                            <AlertTriangle size={20} />
                            <span className="font-medium">{error}</span>
                            <button 
                                onClick={() => setError(null)}
                                className={`ml-auto hover:opacity-75`}
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table */}
                <TransaksiTable
                    transaksi={currentData}
                    loading={loading}
                    onDetail={handleDetailClick}
                    theme={theme}
                />

                {/* Detail Modal */}
                <TransaksiDetailModal
                    isOpen={showDetailModal}
                    onClose={() => {
                        setShowDetailModal(false);
                        setDetailTransaksi(null);
                    }}
                    data={detailTransaksi}
                    loading={loadingDetail}
                    theme={theme}
                />
            </div>
        </>
    );
};

export default TransaksiPageCabang;