// src/components/SalesTrendChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const SalesTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No sales data available for this period.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 h-[420px] flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Tren Penjualan</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)} tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value, name) => (name === 'Pendapatan' ? formatRupiah(value) : `${value} transaksi`)}
            />
            <Legend iconType="circle" />
            <Line yAxisId="left" type="monotone" dataKey="total_pendapatan" stroke="#22c55e" strokeWidth={2} dot={false} name="Pendapatan" />
            <Line yAxisId="right" type="monotone" dataKey="jumlah_transaksi" stroke="#3b82f6" strokeWidth={2} dot={false} name="Transaksi" />
            </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesTrendChart;
