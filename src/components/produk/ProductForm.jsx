  // components/Form/ProductForm.jsx
  import { motion } from "framer-motion";
  import { Package } from "lucide-react";

  const ProductForm = ({
    editingProduk,
    formData,
    handleChange,
    handleSubmit,
    loading,
    currentImageUrl,
    message,
  }) => {
    return (
      <form
        onSubmit={handleSubmit}
        className={`space-y-3 ${editingProduk ? "grid grid-cols-2 gap-4 space-y-0" : ""}`}
      >
        {/* Kiri */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk
            </label>
            <input
              type="text"
              name="nama_produk"
              placeholder="Masukkan nama produk"
              value={formData.nama_produk}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga
            </label>
            <input
              type="number"
              name="harga"
              placeholder="50000"
              value={formData.harga}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <input
              type="text"
              name="kategori"
              placeholder="Minuman, Makanan, dll"
              value={formData.kategori}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 text-sm"
              required
            />
          </div>
        </div>

        {/* Kanan */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="deskripsi"
              placeholder="Deskripsi produk"
              value={formData.deskripsi}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 h-24 resize-none text-sm"
              required
            ></textarea>
          </div>

          {editingProduk && currentImageUrl && (
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm">
              <p className="text-gray-600">
                <span className="font-semibold">Gambar saat ini:</span>{" "}
                <span className="text-gray-500">
                  {currentImageUrl.split("/").pop()}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Upload gambar baru untuk mengganti
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gambar Produk {!editingProduk && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              name="gambar_produk"
              accept="image/*"
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-lg text-gray-900 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer text-sm"
              required={!editingProduk}
            />
          </div>
        </div>

        {/* Tombol Submit */}
        <div className="col-span-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gray-700 text-white py-2.5 rounded-lg hover:bg-gray-800 transition font-semibold text-sm disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
          >
            {loading
              ? "Menyimpan..."
              : editingProduk
              ? "Simpan Perubahan"
              : "Tambah Produk"}
          </motion.button>
        </div>

        {/* Pesan */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 p-2.5 rounded-lg text-xs font-medium ${
              message.includes("❌")
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-green-50 text-green-600 border border-green-200"
            }`}
          >
            {message}
          </motion.div>
        )}
      </form>
    );
  };

  export default ProductForm;
