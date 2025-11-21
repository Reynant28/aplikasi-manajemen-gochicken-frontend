import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Loader2,
  ServerCrash,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Pagination from "./Pagination.jsx";
import { getPaymentIcon, mapPaymentMethodToUI } from "../utils/paymentUtils";

const API_URL = "http://localhost:8000/api";
const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
const formatDate = (dateString) =>
  new Date(dateString).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });

const SalesReport = ({ cabangId, token, filter }) => {
  const [activeTab, setActiveTab] = useState("transaksi");

  const [transaksiData, setTransaksiData] = useState([]);
  const [pengeluaranData, setPengeluaranData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [transaksiPage, setTransaksiPage] = useState(1);
  const [transaksiTotalPages, setTransaksiTotalPages] = useState(1);

  const [pengeluaranPage, setPengeluaranPage] = useState(1);
  const [pengeluaranTotalPages, setPengeluaranTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!cabangId || !token) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [transaksiRes, pengeluaranRes] = await Promise.all([
          axios.get(
            `${API_URL}/reports/cabang/${cabangId}/sales/transactions?page=${transaksiPage}&limit=${itemsPerPage}&filter=${filter}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `${API_URL}/reports/cabang/${cabangId}/sales/expenses?page=${pengeluaranPage}&limit=${itemsPerPage}&filter=${filter}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
        setTransaksiData(transaksiRes.data.data);
        setTransaksiTotalPages(transaksiRes.data.last_page);
        setPengeluaranData(pengeluaranRes.data.data);
        setPengeluaranTotalPages(pengeluaranRes.data.last_page);
        //eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Gagal mengambil data laporan penjualan.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cabangId, token, transaksiPage, pengeluaranPage, filter]);

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-40 text-red-600">
        <ServerCrash size={32} />
        <p className="mt-2">{error}</p>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-lg border">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("transaksi")}
            className={`flex items-center gap-2 p-4 text-sm font-semibold transition-colors ${
              activeTab === "transaksi"
                ? "border-b-2 border-red-500 text-red-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <TrendingUp size={16} /> Riwayat Transaksi
          </button>
          <button
            onClick={() => setActiveTab("pengeluaran")}
            className={`flex items-center gap-2 p-4 text-sm font-semibold transition-colors ${
              activeTab === "pengeluaran"
                ? "border-b-2 border-red-500 text-red-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <TrendingDown size={16} /> Riwayat Pengeluaran
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-red-600" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {activeTab === "transaksi" && (
                <TransaksiTable
                  data={transaksiData}
                  totalPages={transaksiTotalPages}
                  onPageChange={setTransaksiPage}
                  currentPage={transaksiPage}
                />
              )}
              {activeTab === "pengeluaran" && (
                <PengeluaranTable
                  data={pengeluaranData}
                  totalPages={pengeluaranTotalPages}
                  onPageChange={setPengeluaranPage}
                  currentPage={pengeluaranPage}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

// Extracted Transaction Table into its own component
const TransaksiTable = ({ data, totalPages, currentPage, onPageChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredData = useMemo(
    () =>
      data.filter(
        (item) =>
          item.kode_transaksi
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.metode_pembayaran
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      ),
    [data, searchTerm]
  );

  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari kode atau metode pembayaran..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 transition text-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                Kode
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                Tanggal & Waktu
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                Metode Pembayaran
              </th>
              <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr
                  key={item.kode_transaksi}
                  className="even:bg-gray-50/50 hover:bg-red-50/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                    {item.kode_transaksi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {formatDate(item.tanggal_waktu)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div className="flex items-center">
                      {getPaymentIcon(item.metode_pembayaran)}
                      {mapPaymentMethodToUI(item.metode_pembayaran)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 text-right">
                    {formatRupiah(item.total_harga)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <AlertTriangle size={32} />
                    <p className="font-semibold">
                      Tidak ada transaksi ditemukan.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredData.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

// Extracted Expense Table into its own component
const PengeluaranTable = ({ data, totalPages, currentPage, onPageChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredData = useMemo(
    () =>
      data.filter(
        (item) =>
          item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.jenis.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [data, searchTerm]
  );

  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari keterangan atau jenis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 transition text-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                Jenis
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                Keterangan
              </th>
              <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">
                Jumlah
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr
                  key={index}
                  className="even:bg-gray-50/50 hover:bg-red-50/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(item.tanggal).toLocaleDateString("id-ID", {
                      dateStyle: "long",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {item.jenis}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {item.keterangan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-red-600 text-right">
                    {formatRupiah(item.jumlah)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <AlertTriangle size={32} />
                    <p className="font-semibold">
                      Tidak ada pengeluaran ditemukan.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredData.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default SalesReport;
