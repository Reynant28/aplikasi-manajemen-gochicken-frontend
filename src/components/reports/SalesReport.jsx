import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ServerCrash, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = "http://localhost:8000/api";
const formatRupiah = (value) => {
  if (!value || isNaN(value)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
};

const SalesReport = ({ cabangId, token }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailableYears();
    fetchMonthlyData();
  }, [selectedYear, cabangId, token]);

  const fetchAvailableYears = async () => {
    try {
      const res = await axios.get(`${API_URL}/reports/available-years`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableYears(res.data.data);
    } catch (err) {
      console.error('Failed to fetch years:', err);
    }
  };

  const fetchMonthlyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/reports/monthly-revenue?year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMonthlyData(res.data.data);
    } catch (err) {
      setError("Gagal mengambil data laporan penjualan.");
      console.error('Failed to fetch monthly data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Safe calculation functions
  const calculateTotalPendapatan = () => {
    if (!monthlyData || monthlyData.length === 0) return 0;
    return monthlyData.reduce((sum, month) => {
      const pendapatan = parseFloat(month.total_pendapatan) || 0;
      return sum + pendapatan;
    }, 0);
  };

  const calculateTotalTransaksi = () => {
    if (!monthlyData || monthlyData.length === 0) return 0;
    return monthlyData.reduce((sum, month) => {
      const transaksi = parseInt(month.total_transaksi) || 0;
      return sum + transaksi;
    }, 0);
  };

  const calculateRataRata = () => {
    const totalPendapatan = calculateTotalPendapatan();
    const totalTransaksi = calculateTotalTransaksi();
    if (totalTransaksi === 0) return 0;
    return totalPendapatan / totalTransaksi;
  };

  const getGrowthColor = (current, previous) => {
    if (!previous) return 'text-gray-500';
    return current >= previous ? 'text-green-600' : 'text-red-600';
  };

  const calculateGrowth = (currentMonthIndex) => {
    if (currentMonthIndex === 0) return null;
    
    const current = monthlyData[currentMonthIndex];
    const previous = monthlyData[currentMonthIndex - 1];
    
    if (!previous || !previous.total_pendapatan) return null;
    
    const currentPendapatan = parseFloat(current.total_pendapatan) || 0;
    const previousPendapatan = parseFloat(previous.total_pendapatan) || 0;
    
    if (previousPendapatan === 0) return null;
    
    const growth = ((currentPendapatan - previousPendapatan) / previousPendapatan) * 100;
    return growth.toFixed(1);
  };

  if (loading) return <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-green-600" /></div>;
  if (error) return <div className="flex flex-col justify-center items-center h-40 text-red-600"><ServerCrash size={32} /><p className="mt-2">{error}</p></div>;

  const totalPendapatan = calculateTotalPendapatan();
  const totalTransaksi = calculateTotalTransaksi();
  const rataRata = calculateRataRata();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header with Year Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Laporan Penjualan Bulanan</h2>
          <p className="text-gray-600">Ringkasan pendapatan per bulan untuk cabang Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="text-gray-500" size={20} />
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-gray-300 text-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Pendapatan {selectedYear}</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {formatRupiah(totalPendapatan)}
              </p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div>
            <p className="text-gray-600 text-sm">Total Transaksi {selectedYear}</p>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {totalTransaksi.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div>
            <p className="text-gray-600 text-sm">Rata-rata per Transaksi</p>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {formatRupiah(rataRata)}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Data Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Data Bulanan</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bulan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendapatan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Transaksi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rata-rata</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pertumbuhan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyData.length > 0 ? (
                monthlyData.map((month, index) => {
                  const growth = calculateGrowth(index);
                  const pendapatan = parseFloat(month.total_pendapatan) || 0;
                  const transaksi = parseInt(month.total_transaksi) || 0;
                  const avgTransaction = transaksi > 0 ? pendapatan / transaksi : 0;
                  
                  return (
                    <tr key={`${month.year}-${month.month}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{month.month_name}</p>
                          <p className="text-sm text-gray-500">{month.year}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-gray-900">{formatRupiah(pendapatan)}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {transaksi.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {formatRupiah(avgTransaction)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {growth && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGrowthColor(pendapatan, parseFloat(monthlyData[index - 1]?.total_pendapatan) || 0)}`}>
                            {growth}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <Calendar className="mx-auto mb-2 text-gray-300" size={32} />
                    <p>Tidak ada data penjualan untuk tahun {selectedYear}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default SalesReport;