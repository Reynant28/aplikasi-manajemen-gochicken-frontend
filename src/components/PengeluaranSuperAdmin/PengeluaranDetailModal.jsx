import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Layers } from "lucide-react";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// DIDEFINISIKAN ULANG (Sesuai dengan Helper di file induk)
const formatRupiah = (value) => {
    if (!value && value !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value);
};

const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    try {
        return format(new Date(dateString), 'dd MMM yyyy', { locale: id });
    } catch (error) {
        return dateString;
    }
};


export default function PengeluaranDetailModal({ isOpen, onClose, data, theme }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div onMouseDown={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div onMouseDown={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
                        <div className={`${theme.lightBg} px-6 py-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0`}>
                            <h3 className={`text-lg font-bold ${theme.primaryText}`}>Detail Pengeluaran</h3>
                            <button onClick={onClose}><X size={22} className="text-gray-400 hover:text-red-500"/></button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-4">
                            <div className="flex justify-between items-start">
                                <div><p className="text-xs text-gray-500">Tanggal</p><p className="font-medium text-gray-900">{formatTanggal(data?.tanggal)}</p></div>
                                <div className="text-right"><p className="text-xs text-gray-500">Total</p><p className={`text-xl font-bold ${theme.primaryText}`}>{formatRupiah(data?.jumlah)}</p></div>
                            </div>
                            <div><p className="text-xs text-gray-500">Keterangan</p><div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900 mt-1">{data?.keterangan}</div></div>
                            
                            {data?.details && data.details.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Layers size={16}/> Rincian Item</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 text-gray-500"><tr><th className="px-4 py-2 text-left">Item</th><th className="px-4 py-2 text-center">Qty</th><th className="px-4 py-2 text-right">Subtotal</th></tr></thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {data.details.map((d, i) => (
                                                    <tr key={i}><td className="px-4 py-2 text-gray-900">{d.bahan_baku?.nama_bahan_baku}</td><td className="px-4 py-2 text-center text-gray-900">{d.jumlah_item}</td><td className="px-4 py-2 text-right font-medium text-gray-900">{formatRupiah(d.total_harga)}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};