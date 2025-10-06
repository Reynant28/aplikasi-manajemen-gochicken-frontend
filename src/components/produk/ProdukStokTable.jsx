import React, { useState, useMemo } from 'react';
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Search, PlusCircle, MinusCircle, ChevronLeft, ChevronRight, AlertTriangle, Eye } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

const ProdukStokTable = ({ produkList, pendingChanges, onStageChange, onImageClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProduk = useMemo(() => {
    return produkList.filter(p =>
      p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [produkList, searchTerm]);

  const totalPages = Math.ceil(filteredProduk.length / ITEMS_PER_PAGE);

  const paginatedProduk = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProduk.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProduk, currentPage]);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama produk..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Kategori</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {paginatedProduk.length > 0 ? (
                paginatedProduk.map((prod) => {
                  const change = pendingChanges[prod.id_stock_cabang] || 0;
                  const displayStok = prod.jumlah_stok + change;
                  const hasPendingChange = change !== 0;

                  return (
                    <motion.tr key={prod.id_produk} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`hover:bg-gray-50 ${hasPendingChange ? 'bg-green-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="relative flex-shrink-0 group">
                            <img 
                              src={prod.gambar_url || "https://placehold.co/100x100/e2e8f0/64748b?text=N/A"} 
                              alt={prod.nama_produk} 
                              className="w-12 h-12 rounded-md object-cover transition-all duration-300 group-hover:blur-sm group-hover:brightness-75"
                            />
                            <button onClick={() => onImageClick(prod.gambar_url)} className="absolute inset-0 flex items-center justify-center transition-all duration-300 rounded-md opacity-0 group-hover:opacity-100">
                              <Eye className="text-white h-6 w-6" />
                            </button>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{prod.nama_produk}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{prod.kategori}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className={`text-lg font-bold ${displayStok <= 5 ? 'text-red-500' : 'text-gray-800'}`}>
                          {displayStok}
                          {hasPendingChange && (<span className={`ml-2 text-sm font-semibold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>({change > 0 ? `+${change}` : change})</span>)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => onStageChange(prod.id_stock_cabang, -1)} disabled={displayStok <= 0} className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-300 transition-colors rounded-full hover:bg-red-100"><MinusCircle size={20} /></button>
                          <button onClick={() => onStageChange(prod.id_stock_cabang, 1)} className="p-2 text-green-600 hover:text-green-800 transition-colors rounded-full hover:bg-green-100"><PlusCircle size={20} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr><td colSpan="4" className="text-center py-12"><div className="flex flex-col items-center gap-3 text-gray-500"><AlertTriangle size={32} /><p className="font-semibold">Tidak ada produk yang cocok.</p></div></td></tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (<div className="flex items-center justify-between pt-4"><button onClick={handlePrevPage} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16} /> Sebelumnya</button><span className="text-sm text-gray-700"> Halaman <b>{currentPage}</b> dari <b>{totalPages}</b> </span><button onClick={handleNextPage} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50">Berikutnya <ChevronRight size={16} /></button></div>)}
    </div>
  );
};

export default ProdukStokTable;

