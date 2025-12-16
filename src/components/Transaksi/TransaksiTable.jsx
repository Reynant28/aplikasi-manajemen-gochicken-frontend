import React from "react";
import { Eye, LoaderCircle } from "lucide-react";

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { 
    style: "currency", 
    currency: "IDR", 
    maximumFractionDigits: 0 
}).format(value);

const TransaksiTable = ({ transaksi, loading, onDetail, theme }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-md border border-gray-200">
                <div className="text-center">
                    <div className="flex items-center justify-center text-gray-500">
                        <LoaderCircle className="animate-spin h-6 w-6 mr-3" /> Memuat...
                    </div>
                </div>
            </div>
        );
    }

    if (transaksi.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-md border border-gray-200">
                <div className="text-center text-gray-400">
                    <p className="text-lg font-medium">Tidak ada transaksi</p>
                    <p className="text-sm mt-1">Belum ada data transaksi untuk ditampilkan</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-md border ${theme?.primaryBorder || 'border-gray-200'} overflow-hidden`}>
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
                        {transaksi.map((t) => (
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
                                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                                        {t.metode_pembayaran}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-sm font-bold ${theme?.primaryText || 'text-gray-700'} text-right`}>
                                    {formatRupiah(t.total_harga || 0)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => onDetail(t.id_transaksi)}
                                        className={`inline-flex items-center gap-1 px-4 py-2 ${theme?.primary || 'bg-gray-600'} text-white text-xs font-medium rounded-lg shadow-sm transition`}
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