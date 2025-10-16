// src/components/produk/ProdukStokTable.jsx
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

  const getStockColor = (stock) => {
    if (stock <= 5) return 'text-red-500';
    if (stock <= 20) return 'text-amber-500';
    return 'text-green-600';
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama produk..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* ✨ REVISED: Changed table to a responsive grid layout */}
      <AnimatePresence>
        {paginatedProduk.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedProduk.map((prod, index) => {
              const change = pendingChanges[prod.id_stock_cabang] || 0;
              const displayStok = prod.jumlah_stok + change;
              const hasPendingChange = change !== 0;

              return (
                <motion.div 
                  key={prod.id_produk} 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl shadow-md border overflow-hidden flex flex-col transition-all duration-300 ${hasPendingChange ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'}`}
                >
                  <div className="relative group">
                    <img 
                      src={prod.gambar_url || "https://placehold.co/400x300/e2e8f0/64748b?text=N/A"} 
                      alt={prod.nama_produk} 
                      className="w-full h-40 object-cover transition-all duration-300 group-hover:brightness-75"
                    />
                    <button onClick={() => onImageClick(prod.gambar_url)} className="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black/20 opacity-0 group-hover:opacity-100">
                      <Eye className="text-white h-8 w-8" />
                    </button>
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-xs text-gray-500">{prod.kategori}</p>
                    <h3 className="font-bold text-gray-800 truncate" title={prod.nama_produk}>{prod.nama_produk}</h3>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex-grow flex flex-col justify-end">
                       <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500">Stok Saat Ini</p>
                            <div className="flex items-baseline gap-2">
                               <p className={`text-3xl font-bold ${getStockColor(displayStok)}`}>{displayStok}</p>
                               {hasPendingChange && (<p className={`text-sm font-semibold ${change > 0 ? 'text-green-600' : 'text-red-500'}`}>({change > 0 ? `+${change}` : change})</p>)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => onStageChange(prod.id_stock_cabang, -1)} disabled={displayStok <= 0} className="p-2 text-red-600 hover:bg-red-100 disabled:text-gray-300 disabled:hover:bg-transparent rounded-full transition-colors"><MinusCircle size={24} /></button>
                            <button onClick={() => onStageChange(prod.id_stock_cabang, 1)} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"><PlusCircle size={24} /></button>
                          </div>
                       </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 col-span-full"><div className="flex flex-col items-center gap-3 text-gray-500"><AlertTriangle size={32} /><p className="font-semibold">Tidak ada produk yang cocok.</p></div></div>
        )}
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
            <button onClick={handlePrevPage} disabled={currentPage === 1} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                <ChevronLeft size={16} /> 
                <span className="hidden sm:inline">Sebelumnya</span>
            </button>
            <span className="text-sm text-gray-700"> Halaman <b>{currentPage}</b> dari <b>{totalPages}</b> </span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight size={16} />
            </button>
        </div>
      )}
    </div>
  );
};

export default ProdukStokTable;