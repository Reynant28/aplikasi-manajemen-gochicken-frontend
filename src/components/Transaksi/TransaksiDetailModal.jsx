import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Calendar, CreditCard, Package, LoaderCircle } from "lucide-react";

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { 
    style: "currency", 
    currency: "IDR", 
    maximumFractionDigits: 0 
}).format(value);

const TransaksiDetailModal = ({ isOpen, onClose, data, loading, theme }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white shadow-2xl rounded-xl w-full max-w-xl mx-auto relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                        >
                            <X size={20} />
                        </button>

                        <div className={`p-6 border-b ${theme?.primaryBorder || 'border-gray-200'}`}>
                            <h2 className="text-2xl font-bold text-gray-800">Detail Transaksi</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {data?.kode_transaksi}
                            </p>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center text-gray-500">
                                            <LoaderCircle className="animate-spin h-6 w-6 mr-3" /> Memuat...
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Info Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className={`flex items-center gap-3 p-3 ${theme?.primaryLight || 'bg-gray-50'} rounded-lg`}>
                                            <User size={20} className={`${theme?.iconColor || 'text-gray-400'}`} />
                                            <div>
                                                <p className="text-xs text-gray-500">Pelanggan</p>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {data?.nama_pelanggan || "-"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-3 p-3 ${theme?.primaryLight || 'bg-gray-50'} rounded-lg`}>
                                            <Calendar size={20} className={`${theme?.iconColor || 'text-gray-400'}`} />
                                            <div>
                                                <p className="text-xs text-gray-500">Tanggal & Waktu</p>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {data?.tanggal_waktu}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                                            <CreditCard size={20} className="text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">Metode Pembayaran</p>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {data?.metode_pembayaran}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Products Table */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Package size={20} className="text-gray-400" />
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Detail Produk
                                            </h3>
                                        </div>
                                        <div className={`border ${theme?.primaryBorder || 'border-gray-200'} rounded-lg overflow-hidden`}>
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-100 border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                            Produk
                                                        </th>
                                                        <th className="px-4 py-3 text-center font-semibold text-slate-600">
                                                            Qty
                                                        </th>
                                                        <th className="px-4 py-3 text-right font-semibold text-slate-600">
                                                            Harga
                                                        </th>
                                                        <th className="px-4 py-3 text-right font-semibold text-slate-600">
                                                            Subtotal
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {data?.details?.map((d, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-gray-800">
                                                                {d.produk?.nama_produk || "Produk"}
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-gray-600">
                                                                {d.jumlah_produk}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-gray-600">
                                                                {formatRupiah(parseInt(d.harga_item))}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-medium text-gray-800">
                                                                {formatRupiah(parseInt(d.subtotal))}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-800">
                                                Total Pembayaran
                                            </span>
                                            <span className={`text-2xl font-bold ${theme?.primaryText || 'text-gray-800'}`}>
                                                {formatRupiah(parseInt(data?.total_harga || 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={onClose}
                                className={`px-6 py-2.5 ${theme?.primary || 'bg-gray-600'} text-white text-sm font-medium rounded-lg transition shadow-sm`}
                            >
                                Tutup
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TransaksiDetailModal;