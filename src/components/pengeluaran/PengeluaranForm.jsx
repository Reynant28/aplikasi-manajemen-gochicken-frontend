    import React, { useState, useEffect, useMemo } from "react";
    import { Plus, X, Calendar, Loader2 } from "lucide-react";

    const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { 
        style: "currency", 
        currency: "IDR", 
        maximumFractionDigits: 0 
    }).format(value);

    const PengeluaranForm = ({ 
        formData, 
        setFormData,
        onSubmit, 
        loading, 
        isEditing,
        jenisList,
        bahanBakuList,
        cabangList,
        onAddJenis,
        onClose
    }) => {
        const [displayJumlah, setDisplayJumlah] = useState('Rp 0');
        const [isCicilanHarian, setIsCicilanHarian] = useState(false);
        const [showAddJenis, setShowAddJenis] = useState(false);
        const [newJenis, setNewJenis] = useState("");
        const [isAddingJenis, setIsAddingJenis] = useState(false);

        useEffect(() => {
            const isBahanBaku = jenisList.find(j => j.id_jenis == formData.id_jenis)?.jenis_pengeluaran === 'Pembelian bahan baku';
            if (!isBahanBaku) {
                setDisplayJumlah(formatRupiah(formData.jumlah || 0).replace(/,00$/, ''));
            }
        }, [formData.id_jenis, formData.jumlah, jenisList]);

        const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        
        const handleAddJumlah = (amount) => {
            const currentJumlah = Number(String(formData.jumlah || '0').replace(/[^0-9]/g, '')) || 0;
            const newJumlah = currentJumlah + amount;
            setFormData(prev => ({ ...prev, jumlah: newJumlah.toString() }));
            setDisplayJumlah(formatRupiah(newJumlah).replace(/,00$/, ''));
        };
        
        const handleJumlahChange = (e) => {
            const numericValue = e.target.value.replace(/[^0-9]/g, '');
            setFormData(prev => ({ ...prev, jumlah: numericValue }));
            setDisplayJumlah(numericValue ? formatRupiah(numericValue).replace(/,00$/, '') : '');
        };
        
        const handleDetailChange = (index, e) => {
            const { name, value } = e.target;
            const updatedDetails = [...formData.details];
            const item = { ...updatedDetails[index], [name]: value };

            const selectedBahan = bahanBakuList.find(b => b.id_bahan_baku == item.id_bahan_baku);
            if (selectedBahan) {
                const hargaSatuan = parseFloat(selectedBahan.harga_satuan) || 0;
                const jumlah = parseFloat(item.jumlah_item) || 0;
                item.harga_satuan = hargaSatuan;
                item.subtotal = hargaSatuan * jumlah;
            }

            updatedDetails[index] = item;
            setFormData(prev => ({ ...prev, details: updatedDetails }));
        };
        
        const addDetailItem = () => setFormData(prev => ({ 
            ...prev, 
            details: [...(prev.details || []), { id_bahan_baku: '', jumlah_item: 1, harga_satuan: '' }] 
        }));
        
        const removeDetailItem = (index) => setFormData(prev => ({ 
            ...prev, 
            details: prev.details.filter((_, i) => i !== index) 
        }));
        
        const totalDetails = useMemo(() => {
            if (!formData.details || !Array.isArray(formData.details)) return 0;
            return formData.details.reduce((sum, item) => sum + (Number(item.jumlah_item) * Number(item.harga_satuan)), 0);
        }, [formData.details]);

        const selectedJenis = useMemo(() => jenisList.find(j => j.id_jenis == formData.id_jenis), [formData.id_jenis, jenisList]);
        const isPembelianBahanBaku = selectedJenis?.jenis_pengeluaran === 'Pembelian bahan baku';

        const handleFormSubmit = (e) => {
            e.preventDefault();
            let finalJumlah = isPembelianBahanBaku ? totalDetails : Number(formData.jumlah);
            const payload = {
                id_cabang: formData.id_cabang,
                id_jenis: formData.id_jenis,
                tanggal: formData.tanggal,
                keterangan: formData.keterangan,
                jumlah: finalJumlah,
                is_cicilan_harian: isCicilanHarian,
                details: isPembelianBahanBaku ? (formData.details || []) : []
            };
            onSubmit(payload);
        };

        const handleJenisSubmit = async () => {
            if (!newJenis) return;
            setIsAddingJenis(true);
            const success = await onAddJenis(newJenis);
            setIsAddingJenis(false);
            if (success) { 
                setNewJenis(""); 
                setShowAddJenis(false); 
            }
        };
        
        const quickAddValues = [1000, 10000, 100000, 1000000];

        return (
            <div className="relative">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 px-6 pt-6">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Plus className="text-gray-700" size={24} />
                    </div>
                    {isEditing ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
                </h2>

                <form onSubmit={handleFormSubmit} className="max-h-[70vh] overflow-y-auto px-6">
                    <div className="space-y-4 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Only show cabang dropdown for super admin */}
                            {cabangList && cabangList.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cabang
                                </label>
                                <select 
                                    name="id_cabang" 
                                    value={formData.id_cabang || ''} 
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                                    required 
                                    disabled={loading}
                                >
                                    <option value="">Pilih Cabang...</option>
                                    {cabangList.map(c => (
                                        <option key={c.id_cabang} value={c.id_cabang}>{c.nama_cabang}</option>
                                    ))}
                                </select>
                            </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal
                                </label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        name="tanggal" 
                                        value={formData.tanggal || ''} 
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                                        required 
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Jenis Pengeluaran
                            </label>
                            <div className="flex gap-2">
                                <select 
                                    name="id_jenis" 
                                    value={formData.id_jenis || ''} 
                                    onChange={handleChange}
                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                                    required 
                                    disabled={loading}
                                >
                                    <option value="">Pilih Jenis...</option>
                                    {jenisList.map(j => (
                                        <option key={j.id_jenis} value={j.id_jenis}>{j.jenis_pengeluaran}</option>
                                    ))}
                                </select>
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddJenis(true)}
                                    className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                >
                                    <Plus size={20}/>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Keterangan
                            </label>
                            <textarea 
                                name="keterangan" 
                                value={formData.keterangan || ''} 
                                onChange={handleChange}
                                rows="3"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 resize-none"
                                required 
                                disabled={loading}
                                placeholder="Masukkan keterangan pengeluaran"
                            />
                        </div>
                        
                        {isPembelianBahanBaku ? (
                            <div className="pt-2">
                                <h3 className="text-md font-semibold text-gray-800 mb-3">Detail Pembelian Bahan Baku</h3>
                                <div className="space-y-3">
                                    {formData.details && formData.details.map((item, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-12 gap-3 items-end">
                                                <div className="col-span-12 sm:col-span-5">
                                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Bahan Baku</label>
                                                    <select 
                                                        name="id_bahan_baku" 
                                                        value={item.id_bahan_baku} 
                                                        onChange={e => handleDetailChange(index, e)}
                                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-gray-500"
                                                    >
                                                        <option value="">Pilih Bahan...</option>
                                                        {bahanBakuList.map(b => (
                                                            <option key={b.id_bahan_baku} value={b.id_bahan_baku}>{b.nama_bahan}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-6 sm:col-span-2">
                                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Jumlah</label>
                                                    <input 
                                                        type="number" 
                                                        min="1" 
                                                        name="jumlah_item" 
                                                        value={item.jumlah_item} 
                                                        onChange={e => handleDetailChange(index, e)}
                                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-gray-500"
                                                    />
                                                </div>
                                                <div className="col-span-6 sm:col-span-4">
                                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Harga Satuan</label>
                                                    <p className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-100">
                                                        {formatRupiah(bahanBakuList.find(b => b.id_bahan_baku == item.id_bahan_baku)?.harga_satuan || 0)}
                                                    </p>
                                                </div>
                                                <div className="col-span-12 sm:col-span-1 flex justify-end">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeDetailItem(index)}
                                                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                                                    >
                                                        <X size={18}/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button 
                                        type="button" 
                                        onClick={addDetailItem}
                                        className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition text-sm"
                                    >
                                        + Tambah Item
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jumlah Pengeluaran
                                </label>
                                <input 
                                    type="text" 
                                    value={displayJumlah} 
                                    onChange={handleJumlahChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                                    placeholder="Masukkan jumlah, e.g., 150000"
                                    required={!isPembelianBahanBaku} 
                                    disabled={loading}
                                />
                                <div className="flex items-center gap-2 mt-3">
                                    <input 
                                        type="checkbox" 
                                        id="cicilanHarian" 
                                        checked={isCicilanHarian} 
                                        onChange={(e) => setIsCicilanHarian(e.target.checked)}
                                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                                    />
                                    <label htmlFor="cicilanHarian" className="text-sm text-gray-700">
                                        Cicilan harian (bagi rata jumlah per hari dalam bulan)
                                    </label>
                                </div>
                                <div className="flex gap-2 mt-3 flex-wrap">
                                    {quickAddValues.map(value => (
                                        <button 
                                            key={value} 
                                            type="button" 
                                            onClick={() => handleAddJumlah(value)}
                                            className="px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                        >
                                            + {new Intl.NumberFormat('id-ID').format(value)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="text-right pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Total Pengeluaran:</p>
                            <p className="text-2xl font-bold text-gray-700">
                                {isPembelianBahanBaku
                                    ? formatRupiah(totalDetails || 0)
                                    : formatRupiah(Number(formData.jumlah || 0))}
                            </p>
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button 
                            type="submit"
                            className="flex items-center justify-center min-w-[120px] px-6 py-2.5 text-sm font-semibold bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition disabled:bg-gray-400"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={16}/> 
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan"
                            )}
                        </button>
                    </div>
                </form>

                {/* Add Jenis Overlay */}
                {showAddJenis && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                        <div className="p-6 bg-white rounded-lg shadow-xl border border-gray-200 w-80">
                            <h4 className="font-semibold mb-3 text-gray-800">Tambah Jenis Baru</h4>
                            <input 
                                value={newJenis} 
                                onChange={e => setNewJenis(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 text-sm focus:ring-2 focus:ring-gray-500"
                                placeholder="e.g., Biaya Listrik"
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button 
                                    onClick={() => { setShowAddJenis(false); setNewJenis(""); }}
                                    className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    disabled={isAddingJenis}
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={handleJenisSubmit}
                                    className="flex items-center justify-center min-w-[80px] px-4 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                                    disabled={isAddingJenis}
                                >
                                    {isAddingJenis ? <Loader2 className="animate-spin" size={16}/> : "Simpan"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default PengeluaranForm;