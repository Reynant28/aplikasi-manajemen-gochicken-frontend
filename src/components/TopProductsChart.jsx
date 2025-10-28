// src/components/TopProductsChart.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const TopProductsChart = ({ data, filter }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No product data available.</div>;
  }

const filterLabel =
    filter === "minggu"
      ? "Minggu Ini"
      : filter === "tahun"
      ? "Tahun Ini"
      : "Bulan Ini"; // default

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 h-[550px] flex flex-col shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">5 Produk Terlaris <span className="text-green-600">{filterLabel}</span></h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="nama_produk" 
              width={100}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip cursor={{ fill: '#f3f4f6' }} formatter={(value) => [`${value} terjual`, 'Jumlah']} />
            <Bar dataKey="total_terjual" fill="#22c55e" barSize={20} radius={[0, 10, 10, 0]}>
               <LabelList dataKey="total_terjual" position="right" style={{ fill: '#374151', fontSize: 12 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopProductsChart;
