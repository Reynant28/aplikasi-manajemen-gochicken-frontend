// src/components/pengeluaran/PengeluaranTable.jsx

import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const PengeluaranTable = ({ 
    pengeluaranList, 
    onEdit, 
    onDelete, 
    onView, 
    // Props Pagination
    currentPage, 
    totalPages, 
    totalItems, 
    itemsPerPage, 
    onPageChange 
}) => {

    // Menghitung indeks data yang ditampilkan
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + pengeluaranList.length;

    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Pengeluaran</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pengeluaranList.length > 0 ? (
                            pengeluaranList.map((data, index) => (
                                <tr key={data.id_pengeluaran} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {data.tanggal ? format(new Date(data.tanggal), 'dd MMM yyyy', { locale: id }) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {data.jenis_pengeluaran?.jenis_pengeluaran || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {data.keterangan}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-red-600">
                                        {formatRupiah(data.jumlah)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-center space-x-2">
                                            <button onClick={() => onView(data)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition duration-150" title="Lihat Detail"><Eye size={18} /></button>
                                            <button onClick={() => onEdit(data)} className="text-amber-600 hover:text-amber-900 p-1 rounded-full hover:bg-amber-50 transition duration-150" title="Edit"><Edit size={18} /></button>
                                            <button onClick={() => onDelete(data)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition duration-150" title="Hapus"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-lg">
                                    Tidak ada data pengeluaran.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- PAGINATION BARU YANG LEBIH BAGUS (RESPONSIF) --- */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-4 border-t bg-gray-50 rounded-b-lg">
                    
                    {/* Status Halaman (Diperbarui) */}
                    <div className="text-sm font-medium text-gray-700 mb-3 sm:mb-0 flex items-center gap-1">
                        Menampilkan
                        <span className="font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            {startIndex + 1} - {endIndex}
                        </span>
                        dari
                        <span className="font-bold text-gray-800">
                            {totalItems}
                        </span>
                        pengeluaran
                    </div>

                    {/* Tombol Navigasi */}
                    <div className="flex gap-2">
                        
                        {/* Tombol Sebelumnya */}
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            Sebelumnya
                        </button>

                        {/* Teks Status di Tengah (Hanya terlihat di mobile jika tombol disamping) */}
                        {/* Ini adalah fallback jika status panjang di atas tidak muat */}
                        <div className="sm:hidden flex items-center px-3 text-sm text-gray-600">
                             <span className="font-semibold text-gray-800">{currentPage}</span> / <span className="font-semibold text-gray-800">{totalPages}</span>
                        </div>
                        
                        {/* Tombol Berikutnya */}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            Berikutnya
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>
            )}
            {/* --- AKHIR PAGINATION BARU --- */}
        </div>
    );
};

export default PengeluaranTable;