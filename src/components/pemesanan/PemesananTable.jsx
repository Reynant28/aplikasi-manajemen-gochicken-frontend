import React, { useState, useMemo } from 'react';
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit, Trash2, AlertTriangle, Eye, Wallet, QrCode, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const StatusBadge = ({ status }) => {
  const isSelesai = status === 'Selesai';
  const displayText = status === 'OnLoan' ? 'On Loan' : status;
  return <span className={`px-2 py-1 text-xs font-semibold rounded-md ${isSelesai ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{displayText}</span>;
};

const PaymentIcon = ({ method }) => {
    switch (method?.toLowerCase()) {
        case 'cash': return <Wallet size={14} className="mr-2 text-gray-400" />;
        case 'qris': return <QrCode size={14} className="mr-2 text-gray-400" />;
        case 'transfer':
        case 'debit': return <CreditCard size={14} className="mr-2 text-gray-400" />;
        default: return null;
    }
};

const PemesananTable = ({ data, onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter(p =>
      p.nama_pelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kode_transaksi.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama pelanggan atau kode transaksi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pelanggan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Metode</th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {filteredData.length > 0 ? (
                filteredData.map((p) => (
                  <motion.tr key={p.id_transaksi} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="even:bg-gray-50/50 hover:bg-red-50/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900">{p.nama_pelanggan}</p>
                      <p className="text-xs text-gray-500 font-mono">{p.kode_transaksi}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                      {format(new Date(p.tanggal_waktu), 'd MMM yyyy, HH:mm', { locale: id })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        <div className="flex items-center">
                            <PaymentIcon method={p.metode_pembayaran} />
                            {p.metode_pembayaran}
                        </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 text-right">{formatRupiah(p.total_harga)}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center"><StatusBadge status={p.status_transaksi} /></td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-1 sm:gap-2">
                        <button onClick={() => onView(p)} className="p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-blue-100" title="Lihat Detail"><Eye size={16} /></button>
                        <button onClick={() => onEdit(p)} className="p-2 text-yellow-600 hover:text-yellow-800 transition-colors rounded-full hover:bg-yellow-100" title="Edit Status"><Edit size={16} /></button>
                        <button onClick={() => onDelete(p)} className="p-2 text-red-600 hover:text-red-800 transition-colors rounded-full hover:bg-red-100" title="Hapus"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-12"><div className="flex flex-col items-center gap-3 text-gray-500"><AlertTriangle size={32} /><p className="font-semibold">Tidak ada data pemesanan.</p></div></td></tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PemesananTable;