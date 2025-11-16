// components/Card/ProductCard.jsx
import { motion } from "framer-motion";
import { Package, Edit, Trash2 } from "lucide-react";

const ProductCard = ({ product, index, onDetail, onEdit, onDelete }) => {
  return (
    <motion.div
      key={product.id_produk}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100"
    >
      {/* Product Image */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden group">
        {product.gambar_produk_url ? (
          <img
            src={product.gambar_produk_url}
            alt={product.nama_produk}
            className="w-full h-full object-cover object-center transform group-hover:scale-110 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} className="text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-gray-700 bg-opacity-90 text-white text-xs font-semibold rounded-full">
            {product.kategori}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-800 line-clamp-2">
            {product.nama_produk}
          </h2>
          <p className="text-gray-700 font-bold text-xl">
            Rp {parseInt(product.harga).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 line-clamp-2">{product.deskripsi}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onDetail(product)}
            className="flex-1 text-xs px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Detail
          </button>
          <button
            onClick={() => onEdit(product)}
            className="flex-1 text-xs px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium flex items-center justify-center gap-1"
          >
            <Edit size={14} /> Edit
          </button>
          <button
            onClick={() => onDelete(product.id_produk)}
            className="flex-1 text-xs px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-1"
          >
            <Trash2 size={14} /> Hapus
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;