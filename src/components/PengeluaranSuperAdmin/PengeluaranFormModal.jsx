import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, X, Loader2, Layers, MinusCircle, PlusCircle } from "lucide-react";
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

export default function PengeluaranFormModal({
    isOpen, onClose, onSubmit, isSubmitting,
    formData, setFormData, jenisList, bahanBakuList, cabangList,
    selectedData, isCicilanHarian, setIsCicilanHarian, theme,
    formatRupiah: formatRupiahProp
}) {

    const [displayJumlah, setDisplayJumlah] = useState('Rp 0');

    useEffect(() => {
        if (isOpen) {
            const selectedJenis = jenisList.find(j => j.id_jenis == formData.id_jenis);
            const isBahanBaku = selectedJenis?.jenis_pengeluaran === 'Pembelian bahan baku';
            
            if (!isBahanBaku) {
                setDisplayJumlah(formatRupiah(formData.jumlah || 0).replace(/,00$/, ''));
            } else {
                setDisplayJumlah('Rp 0');
            }
        }
    }, [isOpen, formData.id_jenis, formData.jumlah, jenisList]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'id_jenis') {
            const selectedJenis = jenisList.find(j => j.id_jenis == value);
            const isBahanBaku = selectedJenis?.jenis_pengeluaran === 'Pembelian bahan baku';

            if (!isBahanBaku && formData.details?.length > 0) {
                setFormData(prev => ({ ...prev, details: [] }));
            }
        }
    };

    const quickAddValues = [1000, 10000, 100000, 1000000];
    const handleAddJumlah = (amount) => {
        const selectedJenis = jenisList.find(j => j.id_jenis == formData.id_jenis);
        if (selectedJenis?.jenis_pengeluaran === 'Pembelian bahan baku') return;

        const currentJumlah = Number(String(formData.jumlah || '0').replace(/[^0-9]/g, '')) || 0;
        const newJumlah = currentJumlah + amount;

        setFormData(prev => ({ ...prev, jumlah: newJumlah.toString() }));
        setDisplayJumlah(formatRupiah(newJumlah).replace(/,00$/, ''));
    };

    const handleJumlahChange = (e) => {
        const selectedJenis = jenisList.find(j => j.id_jenis == formData.id_jenis);
        if (selectedJenis?.jenis_pengeluaran === 'Pembelian bahan baku') return;

        const numericValue = e.target.value.replace(/[^0-9]/g, '');
        setFormData(prev => ({ ...prev, jumlah: numericValue }));
        setDisplayJumlah(numericValue ? formatRupiah(numericValue).replace(/,00$/, '') : '');
    };

    const handleDetailChange = (index, e) => {
        const { name, value } = e.target;
        const updatedDetails = [...formData.details];
        const item = { ...updatedDetails[index], [name]: value };

        if (name === 'id_bahan_baku') {
            const selected = bahanBakuList.find(b => b.id_bahan_baku == value);
            if (selected) item.harga_satuan = parseFloat(selected.harga_satuan) || 0;
        }

        updatedDetails[index] = item;
        setFormData(prev => ({ ...prev, details: updatedDetails }));
    };

    const addDetailItem = () => {
        setFormData(prev => ({
            ...prev,
            details: [...(prev.details || []), {
                id_bahan_baku: "",
                jumlah_item: 1,
                harga_satuan: ""
            }]
        }));
    };

    const removeDetailItem = (index) => {
        setFormData(prev => ({
            ...prev,
            details: prev.details.filter((_, i) => i !== index)
        }));
    };

    const totalDetails = useMemo(() => {
        if (!formData.details) return 0;
        return formData.details.reduce((sum, item) => {
            const qty = Number(item.jumlah_item) || 0;
            const price = Number(item.harga_satuan) || 0;
            return sum + qty * price;
        }, 0);
    }, [formData.details]);

    const selectedJenis = useMemo(
        () => jenisList.find(j => j.id_jenis == formData.id_jenis),
        [formData.id_jenis, jenisList]
    );

    const isPembelianBahanBaku = selectedJenis?.jenis_pengeluaran === "Pembelian bahan baku";

    const handleFormSubmit = (e) => {
        e.preventDefault();
        let finalJumlah = isPembelianBahanBaku ? totalDetails : Number(formData.jumlah);

        if (isPembelianBahanBaku) {
            if (!formData.details?.length) {
                alert("Harap tambahkan minimal satu item bahan baku");
                return;
            }
            for (let item of formData.details) {
                if (!item.id_bahan_baku) return alert("Pilih bahan baku");
                if (!item.jumlah_item || item.jumlah_item < 1)
                    return alert("Jumlah minimal 1");
            }
        }

        const payload = {
            id_cabang: formData.id_cabang,
            id_jenis: formData.id_jenis,
            tanggal: formData.tanggal,
            keterangan: formData.keterangan,
            jumlah: finalJumlah,
            is_cicilan_harian: isCicilanHarian ? 1 : 0,
            details: isPembelianBahanBaku ? formData.details : []
        };

        onSubmit(payload);
    };

    const inputClass =
        `w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 
        placeholder-gray-400 focus:bg-white focus:ring-2 ${theme.focusRing} 
        focus:outline-none transition`;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    onMouseDown={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        onMouseDown={(e) => e.stopPropagation()}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
                    >

                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h2 className={`text-2xl font-bold ${theme.primaryText}`}>
                                {selectedData ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="formPengeluaran" onSubmit={handleFormSubmit} className="space-y-6">

                                {/* Cabang + Tanggal */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Cabang</label>
                                        <select
                                            name="id_cabang"
                                            value={formData.id_cabang || ""}
                                            onChange={handleChange}
                                            className={inputClass}
                                            required
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Pilih Cabang...</option>
                                            {cabangList.map(c => (
                                                <option key={c.id_cabang} value={c.id_cabang}>
                                                    {c.nama_cabang}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal</label>
                                        <input
                                            type="date"
                                            name="tanggal"
                                            value={formData.tanggal || ""}
                                            onChange={handleChange}
                                            className={inputClass}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                {/* Jenis Pengeluaran */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Jenis Pengeluaran</label>

                                    {/* Tombol + DIHAPUS */}
                                    <select
                                        name="id_jenis"
                                        value={formData.id_jenis || ""}
                                        onChange={handleChange}
                                        className={inputClass}
                                        required
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Pilih Jenis...</option>
                                        {jenisList.map(j => (
                                            <option key={j.id_jenis} value={j.id_jenis}>
                                                {j.jenis_pengeluaran}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Keterangan */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Keterangan</label>
                                    <textarea
                                        name="keterangan"
                                        rows="3"
                                        value={formData.keterangan || ""}
                                        onChange={handleChange}
                                        className={`${inputClass} resize-none`}
                                        required
                                        disabled={isSubmitting}
                                    ></textarea>
                                </div>

                                {/* Pembelian Bahan Baku / Jumlah Manual */}
                                {isPembelianBahanBaku ? (
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-gray-700 flex items-center gap-2">
                                                <Layers size={18} /> Rincian Bahan Baku
                                            </h4>

                                            <button
                                                type="button"
                                                onClick={addDetailItem}
                                                className={`text-xs flex items-center gap-1 px-3 py-2 rounded-lg bg-white border shadow-sm hover:bg-gray-50 transition ${theme.primaryText}`}
                                            >
                                                <PlusCircle size={14} /> Tambah Item
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {formData.details?.map((item, index) => (
                                                <div key={index} className="flex gap-3 items-end bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] text-gray-500 uppercase font-semibold mb-1 block">Bahan</label>
                                                        <select
                                                            name="id_bahan_baku"
                                                            value={item.id_bahan_baku}
                                                            onChange={(e) => handleDetailChange(index, e)}
                                                            className="w-full p-2 text-sm border rounded-lg"
                                                            required
                                                        >
                                                            <option value="">Pilih Bahan...</option>
                                                            {bahanBakuList.map(b => (
                                                                <option key={b.id_bahan_baku} value={b.id_bahan_baku}>
                                                                    {b.nama_bahan_baku} - {formatRupiah(b.harga_satuan)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="w-20">
                                                        <label className="text-[10px] text-gray-500 uppercase font-semibold mb-1 block">Qty</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            name="jumlah_item"
                                                            value={item.jumlah_item}
                                                            onChange={(e) => handleDetailChange(index, e)}
                                                            className="w-full p-2 text-sm border rounded-lg text-center"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="w-28">
                                                        <label className="text-[10px] text-gray-500 uppercase font-semibold mb-1 block">Subtotal</label>
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={formatRupiah((item.jumlah_item || 0) * (item.harga_satuan || 0))}
                                                            className="w-full p-2 text-sm border rounded-lg bg-gray-100 text-right font-medium"
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeDetailItem(index)}
                                                        className="p-2 text-red-400 hover:text-red-600 transition"
                                                    >
                                                        <MinusCircle size={20} />
                                                    </button>
                                                </div>
                                            ))}

                                            {!formData.details?.length && (
                                                <p className="text-sm text-gray-400 italic text-center py-4">
                                                    Belum ada item. Klik "Tambah Item".
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Jumlah Pengeluaran</label>
                                        <input
                                            type="text"
                                            value={displayJumlah}
                                            onChange={handleJumlahChange}
                                            className={`${inputClass} text-lg font-medium`}
                                            placeholder="Rp 0"
                                            required
                                            disabled={isSubmitting}
                                        />

                                        <div className="mt-4 flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="cicilanHarian"
                                                checked={isCicilanHarian}
                                                onChange={(e) => setIsCicilanHarian(e.target.checked)}
                                                className="w-5 h-5 cursor-pointer"
                                            />
                                            <label htmlFor="cicilanHarian" className="text-sm text-gray-600 cursor-pointer">
                                                Cicilan harian (bagi rata jumlah per hari)
                                            </label>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {quickAddValues.map((v) => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => handleAddJumlah(v)}
                                                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${theme.buttonSoft}`}
                                                >
                                                    + {new Intl.NumberFormat("id-ID").format(v)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Total */}
                                <div className="text-right mt-6 pt-4 border-t border-gray-200">
                                    <p className="text-gray-600 mb-1">Total Pengeluaran:</p>
                                    <p className={`text-4xl font-bold ${theme.primaryText}`}>
                                        {isPembelianBahanBaku ? formatRupiah(totalDetails) : displayJumlah}
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-5 bg-gray-50 border-t flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl border text-gray-700 hover:bg-white font-semibold"
                                disabled={isSubmitting}
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                form="formPengeluaran"
                                className={`flex items-center gap-2 px-8 py-2.5 rounded-xl ${theme.primaryBg} text-white font-bold shadow-lg hover:shadow-xl`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                                {selectedData ? "Simpan Perubahan" : "Simpan Pengeluaran"}
                            </button>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
