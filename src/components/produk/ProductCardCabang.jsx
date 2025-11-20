// components/produk/ProductCardCabang.jsx
import React from "react";
import { motion } from "framer-motion";
import { Package, Plus, Minus } from "lucide-react";

const ProductCardCabang = ({ product, pendingChange, onStockChange, onImageClick }) => {
  const getStokStatus = (stok) => {
    if (stok < 5) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (stok < 10) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  };

  const stokStatus = getStokStatus(product.jumlah_stok);
  const newStok = product.jumlah_stok + pendingChange;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-200 hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden group cursor-pointer">
        {product.gambar_url ? (
          <img
            src={product.gambar_url}
            alt={product.nama_produk}
            className="w-full h-full object-cover object-center transform group-hover:scale-110 transition duration-500"
            onClick={() => onImageClick(product.gambar_url)}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            onClick={() => onImageClick(null)}
          >
            <Package size={48} className="text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-gray-800 bg-opacity-90 text-white text-xs font-semibold rounded-full border border-gray-700">
            {product.kategori}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800 line-clamp-2">
            {product.nama_produk}
          </h2>
          <p className="text-gray-700 font-bold text-xl">
            Rp {parseInt(product.harga).toLocaleString()}
          </p>
          
          {/* Stock Information */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Stok Saat Ini:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${stokStatus.bg} ${stokStatus.color} ${stokStatus.border}`}>
                {product.jumlah_stok}
              </span>
            </div>
            
            {pendingChange !== 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Stok Baru:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  newStok < 5 ? 'bg-red-50 text-red-600 border-red-200' : 
                  newStok < 10 ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 
                  'bg-green-50 text-green-600 border-green-200'
                }`}>
                  {newStok}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stock Controls */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Kelola Stok:</span>
            {pendingChange !== 0 && (
              <span className={`text-sm font-bold ${pendingChange > 0 ? 'text-gray-700' : 'text-gray-700'}`}>
                {pendingChange > 0 ? `+${pendingChange}` : pendingChange}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onStockChange(product.id_stock_cabang, -1)}
              disabled={newStok <= 0}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-xs font-medium"
            >
              <Minus size={14} /> Kurang
            </button>
            <button
              onClick={() => onStockChange(product.id_stock_cabang, 1)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition text-xs font-medium"
            >
              <Plus size={14} /> Tambah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardCabang;