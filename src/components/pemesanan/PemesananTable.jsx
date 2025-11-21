// src/components/pemesanan/PemesananTable.jsx
import React from "react";
//eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Eye, Edit, Trash2, Smartphone, Laptop } from "lucide-react";

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PemesananTable = ({ data, onView, onEdit, onDelete, isAndroidTransaction }) => {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Laptop size={48} className="mx-auto" />
        </div>
        <p className="text-gray-500 text-lg font-semibold">Tidak ada data pemesanan</p>
        <p className="text-gray-400 text-sm mt-2">
          Mulai dengan membuat pesanan baru atau sesuaikan filter Anda
        </p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    if (status === "Selesai") {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (status === "OnLoan") {
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kode Transaksi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sumber
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pelanggan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tanggal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.data.map((item, index) => (
            <motion.tr
              key={item.id_transaksi}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 font-mono">
                  {item.kode_transaksi}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {item.source === 'android' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    <Smartphone size={12} />
                    Android
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    <Laptop size={12} />
                    Manual
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{item.nama_pelanggan}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{formatDate(item.tanggal_waktu)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getStatusBadge(item.status_transaksi)}>
                  {item.status_transaksi === "OnLoan" ? "On Loan" : item.status_transaksi}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {formatRupiah(item.total_harga)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onView(item)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                    title="Lihat Detail"
                  >
                    <Eye size={16} />
                  </button>
                  
                  <button
                    onClick={() => onEdit(item)}
                    className={`p-1 rounded-full transition-colors ${
                      isAndroidTransaction(item)
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-orange-600 hover:text-orange-900 hover:bg-orange-50"
                    }`}
                    title={isAndroidTransaction(item) ? "Edit hanya tersedia untuk pesanan manual" : "Edit Pesanan"}
                    disabled={isAndroidTransaction(item)}
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={() => onDelete(item)}
                    className={`p-1 rounded-full transition-colors ${
                      isAndroidTransaction(item)
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-600 hover:text-red-900 hover:bg-red-50"
                    }`}
                    title={isAndroidTransaction(item) ? "Hapus hanya tersedia untuk pesanan manual" : "Hapus Pesanan"}
                    disabled={isAndroidTransaction(item)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      
      {/* Summary */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-600">
          <div>
            Menampilkan {data.from} - {data.to} dari {data.total} pesanan
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Android: {data.data.filter(item => item.source === 'android').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
              <span>Manual: {data.data.filter(item => item.source === 'manual').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PemesananTable;