// src/components/Pengeluaran/PengeluaranTable.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ReceiptText, Building, Eye, Edit, Trash2 } from "lucide-react";
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


export default function PengeluaranTable({ loading, filteredData, theme, openModal, setDeleteId, setShowConfirm }) {
    return (
        <AnimatePresence>
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className={`${theme.primaryAccent} mb-4`}>
                        <Loader2 size={48} />
                    </motion.div>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className={theme.lightBg}>
                                <tr>
                                    {["Tanggal", "Kategori", "Keterangan", "Cabang", "Jumlah", "Aksi"].map((h) => (
                                        <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredData.length > 0 ? filteredData.map((item, idx) => (
                                    <motion.tr key={item.id_pengeluaran} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">{formatTanggal(item.tanggal)}</td>
                                        <td className="px-6 py-4"><span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">{item.jenis_pengeluaran?.jenis_pengeluaran || "Umum"}</span></td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{item.keterangan}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600"><span className="flex items-center gap-1"><Building size={14}/> {item.cabang?.nama_cabang}</span></td>
                                        <td className={`px-6 py-4 text-sm font-bold text-right ${theme.primaryText}`}>
                                            {formatRupiah(item.jumlah)}
                                            {item.is_cicilan_harian === 1 && <div className="text-[10px] text-gray-400 font-normal mt-1">Cicilan Aktif</div>}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={() => openModal('view', item)} className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition" title="Detail"><Eye size={16}/></button>
                                                <button onClick={() => openModal('edit', item)} className="p-2 bg-gray-100 hover:bg-yellow-50 text-gray-500 hover:text-yellow-600 rounded-lg transition" title="Edit"><Edit size={16}/></button>
                                                <button onClick={() => { setDeleteId(item.id_pengeluaran); setShowConfirm(true); }} className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition" title="Hapus"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr><td colSpan="6" className="py-12 text-center text-gray-400"><ReceiptText size={48} className="mx-auto mb-3 opacity-30"/><p>Tidak ada data pengeluaran.</p></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}