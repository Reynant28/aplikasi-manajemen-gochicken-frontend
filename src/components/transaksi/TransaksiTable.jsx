import React from "react";
import { Eye, RefreshCw} from "lucide-react";

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { 
    style: "currency", 
    currency: "IDR", 
    maximumFractionDigits: 0 
}).format(value);

const TransaksiTable = ({ transaksi, loading, onDetail }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-md border border-gray-100">
                <div className="text-center">
                    <div className="flex items-center justify-center h-64 text-gray-500"><RefreshCw className="animate-spin h-6 w-6 mr-3" /> Memuat...</div>
                </div>
            </div>
        );
    }

    if (transaksi.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-md border border-gray-100">
                <div className="text-center text-gray-400">
                    <p className="text-lg font-medium">Tidak ada transaksi</p>
                    <p className="text-sm mt-1">Belum ada data transaksi untuk ditampilkan</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Kode Transaksi
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Tanggal & Waktu
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Pelanggan
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Metode
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                Total
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transaksi.map((t, index) => (
                            <tr 
                                key={t.id_transaksi} 
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                    {t.kode_transaksi}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {t.tanggal_waktu}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                    {t.nama_pelanggan || "-"}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                                        {t.metode_pembayaran}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-700 text-right">
                                    {formatRupiah(t.total_harga || 0)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => onDetail(t.id_transaksi)}
                                        className="inline-flex items-center gap-1 px-4 py-2 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition"
                                    >
                                        <Eye size={14} /> Detail
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransaksiTable;