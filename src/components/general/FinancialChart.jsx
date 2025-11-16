import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format, getDay, getMonth, getWeekOfMonth, parseISO } from "date-fns";
import { id } from "date-fns/locale";

const API_URL = "http://localhost:8000/api";

const formatRupiah = (value = 0) => {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `Rp ${value}`;
  }
};

const processChartData = (rawData = [], filter) => {
  if (!rawData || rawData.length === 0) return [];

  if (filter === "minggu") {
    const days = [
      { name: "Min", value: 0 }, { name: "Sen", value: 0 },
      { name: "Sel", value: 0 }, { name: "Rab", value: 0 },
      { name: "Kam", value: 0 }, { name: "Jum", value: 0 },
      { name: "Sab", value: 0 },
    ];
    rawData.forEach(item => {
      const dayIndex = getDay(parseISO(item.tanggal));
      days[dayIndex].value += parseFloat(item.total);
    });
    return days;
  }
  
  if (filter === "bulan") {
    const weeks = [
      { name: "Minggu 1", value: 0 }, { name: "Minggu 2", value: 0 },
      { name: "Minggu 3", value: 0 }, { name: "Minggu 4", value: 0 },
      { name: "Minggu 5", value: 0 },
    ];
    rawData.forEach(item => {
      const date = parseISO(item.tanggal);
      const weekOfMonth = getWeekOfMonth(date) - 1;
      if (weeks[weekOfMonth]) {
        weeks[weekOfMonth].value += parseFloat(item.total);
      }
    });
    return weeks.filter(w => w.value > 0);
  }

  if (filter === "tahun") {
     const months = Array.from({ length: 12 }, (_, i) => ({
      name: format(new Date(0, i), "MMM", { locale: id }),
      value: 0,
    }));
    rawData.forEach(item => {
      const monthIndex = getMonth(parseISO(item.tanggal));
      months[monthIndex].value += parseFloat(item.total);
    });
    return months;
  }

  return [];
};

const FinancialChart = ({ token }) => {
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);
  const [chartMode, setChartMode] = useState("pendapatan");
  const [chartFilter, setChartFilter] = useState("tahun");

  useEffect(() => {
    let cancelled = false;

    const fetchChartData = async () => {
      setChartLoading(true);
      setChartError(null);

      try {
        const res = await axios.get(
          `${API_URL}/dashboard/chart?filter=${chartFilter}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res?.data?.status === "success" && !cancelled) {
          const rawData = res.data.data[chartMode] || [];
          const processedData = processChartData(rawData, chartFilter);
          setChartData(processedData);
        } else if (!cancelled) {
          setChartError("Gagal memuat data chart.");
        }
      } catch (err) {
        console.error("fetchChartData error", err);
        if (!cancelled) setChartError("Terjadi kesalahan saat mengambil data chart.");
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    };

    fetchChartData();

    return () => {
      cancelled = true;
    };
  }, [token, chartMode, chartFilter]);

  const handleModeChange = (newMode) => {
    setChartMode(newMode);
    if (newMode === 'pengeluaran' && chartFilter === 'minggu') {
       setChartFilter('tahun');
    }
  };

  return (
    <motion.div 
      className="lg:col-span-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-md border border-gray-100 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 capitalize flex items-center gap-2">
            <BarChart3 className="text-gray-700" size={24} />
            {chartMode}
          </h2>
          
          <div className="flex bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => handleModeChange("pendapatan")}
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                chartMode === "pendapatan"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <TrendingUp className="inline-block h-4 w-4 mr-1" /> 
              Pendapatan
            </button>
            <button
              onClick={() => handleModeChange("pengeluaran")}
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                chartMode === "pengeluaran"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <TrendingDown className="inline-block h-4 w-4 mr-1" /> 
              Pengeluaran
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Grafik finansial berdasarkan periode waktu</p>
          
          <div className="flex bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
            {["minggu", "bulan", "tahun"].map((f) => (
              <button
                key={f}
                onClick={() => setChartFilter(f)}
                className={`px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                  chartFilter === f
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-[400px]">
        {chartLoading ? (
          <div className="flex justify-center items-center h-full text-gray-500">Memuat data grafik...</div>
        ) : chartError ? (
          <div className="flex justify-center items-center h-full text-red-500">{chartError}</div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400">Tidak ada data untuk ditampilkan.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat("id-ID", { notation: "compact" }).format(value)
                }
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "0.75rem",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value) => formatRupiah(value)}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={chartMode === "pendapatan" ? "Pendapatan" : "Pengeluaran"}
                stroke={chartMode === "pendapatan" ? "#10b981" : "#ef4444"}
                strokeWidth={3}
                dot={{ r: 4, fill: chartMode === "pendapatan" ? "#10b981" : "#ef4444" }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff", fill: chartMode === "pendapatan" ? "#10b981" : "#ef4444" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

export default FinancialChart;