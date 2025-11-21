import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Loader2,
  ServerCrash,
  Search,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Building2,
} from "lucide-react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Pagination from "./Pagination.jsx";

const API_URL = "http://localhost:8000/api";
const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const EmployeeReport = ({ token }) => {
  const [data, setData] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCabang, setSelectedCabang] = useState("all");

  // Fetch semua data karyawan dan cabang
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [employeesRes, cabangRes] = await Promise.all([
          axios.get(`${API_URL}/reports/employees?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/cabang`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Add cabang information to employee data
        const employeesWithCabang = (employeesRes.data.data || []).map(
          (employee) => ({
            ...employee,
            // You might need to adjust this based on your API response structure
            cabang: employee.cabang || "Unknown", // Adjust this field name as needed
          })
        );

        setData(employeesWithCabang);
        setCabangList(cabangRes.data.data || []);
        //eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Gagal mengambil data karyawan.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Logika untuk filtering dan paginasi di sisi klien
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((item) => {
      const matchesSearch =
        item.nama_karyawan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.alamat &&
          item.alamat.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.cabang &&
          item.cabang.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCabang =
        selectedCabang === "all" ||
        (item.cabang && item.cabang === selectedCabang);

      return matchesSearch && matchesCabang;
    });
  }, [data, searchTerm, selectedCabang]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    setCurrentPage(1);
  }, [filteredData, itemsPerPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-lg border">
        {/* Header dengan search bar dan filter cabang */}
        <div className="p-4 border-b space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama karyawan, alamat, atau cabang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Branch Filter */}
          <div className="relative w-full sm:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter Cabang
            </label>
            <div className="relative">
              <select
                value={selectedCabang}
                onChange={(e) => setSelectedCabang(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 appearance-none bg-white pr-10"
              >
                <option value="all">Semua Cabang</option>
                {cabangList.map((cabang) => (
                  <option key={cabang.id_cabang} value={cabang.nama_cabang}>
                    {cabang.nama_cabang}
                  </option>
                ))}
              </select>
              {/* Dropdown arrow icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-5 text-gray-700">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="animate-spin text-red-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-60 text-red-600">
            <ServerCrash size={32} />
            <p className="mt-2">{error}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                      Nama Karyawan
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                      Alamat
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                      Telepon
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} />
                        Cabang
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">
                      Gaji
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr
                        key={index}
                        className="even:bg-gray-50/50 hover:bg-red-50/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <span className="font-semibold text-gray-900">
                              {item.nama_karyawan}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="flex-shrink-0" />
                            <span>{item.alamat}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="flex-shrink-0" />
                            <span>{item.telepon}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-gray-400" />
                            <span>{item.cabang || "Tidak diketahui"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-semibold text-right">
                          {formatRupiah(item.gaji)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <AlertTriangle size={32} />
                          <p className="font-semibold">
                            Tidak ada karyawan ditemukan
                          </p>
                          <p className="text-xs">
                            Coba ubah kata kunci pencarian atau filter cabang.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredData.length > 0 && totalPages > 1 && (
              <div className="p-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>

    // next to do : adjust reportspage jsx super admin if needed.
    // if not, move to daily report. tweak the UI as usual
    // note : deepseek is great
  );
};

export default EmployeeReport;
