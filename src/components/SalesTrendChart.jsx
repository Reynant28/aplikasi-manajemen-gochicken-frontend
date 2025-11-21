import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Calendar, Zap } from "lucide-react";

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-800">{label}</p>
        <p className="text-sm text-red-500">{`Pendapatan: ${formatRupiah(
          payload[0].value
        )}`}</p>
        <p className="text-sm text-gray-500">{`Transaksi: ${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};

const SalesTrendChart = ({ data, filter }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 h-[350px] sm:h-[420px] flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Tren Penjualan
        </h3>
        <div className="flex-grow flex items-center justify-center text-gray-500">
          No sales data for this period.
        </div>
      </div>
    );
  }

  // --- Calculate Summary Metrics ---
  const totalRevenue = data.reduce(
    (sum, item) => sum + Number(item.total_pendapatan || 0),
    0
  );
  const totalTransactions = data.reduce(
    (sum, item) => sum + Number(item.jumlah_transaksi || 0),
    0
  );
  const peakDay = data.reduce(
    (peak, current) =>
      Number(current.total_pendapatan) > Number(peak.total_pendapatan)
        ? current
        : peak,
    data[0]
  );

  // --- Dynamic Peak Label ---
  const getPeakLabel = () => {
    switch (filter) {
      case "minggu":
        return "Hari Puncak";
      case "bulan":
        return "Minggu Puncak";
      case "tahun":
        return "Bulan Puncak";
      default:
        return "Puncak";
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 h-auto sm:h-[420px] flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Tren Penjualan
      </h3>

      {/* Summary Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center sm:text-left">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
            <TrendingUp size={14} /> Total Pendapatan
          </p>
          <p className="font-bold text-red-600 text-xl">
            {formatRupiah(totalRevenue)}
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
            <Calendar size={14} /> Total Transaksi
          </p>
          <p className="font-bold text-gray-800 text-xl">
            {totalTransactions.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
            <Zap size={14} /> {getPeakLabel()}
          </p>
          <p className="font-bold text-gray-800 text-xl">{peakDay.period}</p>
        </div>
      </div>

      <div className="flex-grow" style={{ height: "250px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="colorTransactions"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                new Intl.NumberFormat("id-ID", { notation: "compact" }).format(
                  value
                )
              }
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="total_pendapatan"
              stroke="#ef4444"
              fill="url(#colorRevenue)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#ef4444" }}
              name="Pendapatan"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="jumlah_transaksi"
              stroke="#6b7280"
              fill="url(#colorTransactions)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#6b7280" }}
              name="Transaksi"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesTrendChart;
