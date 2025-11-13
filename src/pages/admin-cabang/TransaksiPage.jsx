import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import * as XLSX from "xlsx";
import TransaksiTable from "../../components/transaksi/TransaksiTable.jsx";
import TransaksiDetailModal from "../../components/transaksi/TransaksiDetailModal.jsx";

const API_URL = "http://localhost:8000/api";

const TransaksiPage = () => {
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
                setDetailTransaksi(data.data);
            } else {
                console.error("Gagal ambil detail transaksi:", data.message);
            }
        } catch (error) {
            console.error("Error ambil detail transaksi:", error);
        } finally {
            setLoadingDetail(false);
        }
    };

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

    const handleExportAllData = () => {
        if (filteredData.length === 0) {
            alert("Tidak ada data untuk diexport.");
            return;
        }

        const headers = [
            "Kode Transaksi",
            "Tanggal & Waktu",
            "Nama Pelanggan",
            "Metode Pembayaran",
            "Total",
        ];

        const dataForExport = filteredData.map((t) => ({
            "Kode Transaksi": t.kode_transaksi,
            "Tanggal & Waktu": t.tanggal_waktu,
            "Nama Pelanggan": t.nama_pelanggan || "-",
            "Metode Pembayaran": t.metode_pembayaran,
            Total: t.total_harga || 0,
        }));

        const ws = XLSX.utils.json_to_sheet(dataForExport);
        XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

        ws['!cols'] = [
            { wch: 20 },
            { wch: 25 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data Transaksi");

        const fileName = "Pelaporan Data Transaksi.xlsx";
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
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-gray-800">Kelola Transaksi</h1>
                    <p className="text-gray-500 mt-1">Riwayat dan detail semua transaksi</p>
                </motion.div>
                
                <motion.button
                    onClick={handleExportAllData}
                    className="flex items-center gap-2 bg-gray-700 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-md"
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-md border border-gray-100">
                <div className="flex items-center gap-2">
                    <CalendarIcon size={20} className="text-gray-400" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-gray-500 focus:outline-none text-gray-700"
                    />
                    {selectedDate && (
                        <button
                            onClick={() => {
                                setSelectedDate("");
                                setCurrentPage(1);
                            }}
                            className="text-sm text-gray-600 hover:text-gray-800 underline"
                        >
                            Reset
                        </button>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg transition ${
                                currentPage === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, i) => (
                                <button
                                    key={i}
                                    onClick={() => typeof page === "number" && changePage(page)}
                                    disabled={page === "..."}
                                    className={`min-w-[36px] px-3 py-2 text-sm font-medium rounded-lg transition ${
                                        currentPage === page
                                            ? "bg-gray-700 text-white"
                                            : page === "..."
                                            ? "text-gray-400 cursor-default"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg transition ${
                                currentPage === totalPages
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200"
                >
                    <AlertTriangle size={20} />
                    <span className="font-medium">{error}</span>
                    <button 
                        onClick={() => setError(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        <X size={16} />
                    </button>
                </motion.div>
            )}

            {/* Table */}
            <TransaksiTable
                transaksi={currentData}
                loading={loading}
                onDetail={handleDetailClick}
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
            />
        </div>
    );
};

export default TransaksiPage;