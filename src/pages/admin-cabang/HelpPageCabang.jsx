import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ClipboardList,
  Package,
  Users,
  Wallet,
  PackagePlus,
  DollarSign
} from "lucide-react";

const HelpPageCabang = () => {
  const guides = [
    {
      icon: <BookOpen className="text-gray-600" size={22} />,
      title: "General Page",
      desc:
        "Menampilkan dashboard utama untuk cabang. Semua data yang muncul di sini berdasarkan cabang yang sedang login, sehingga setiap cabang memiliki tampilan dan statistik yang berbeda. Admin Cabang dapat melihat performa penjualan, aktivitas terbaru, serta ringkasan laporan operasional secara real-time.",
    },
    {
      icon: <ClipboardList className="text-gray-600" size={22} />,
      title: "Laporan Master",
      desc:
        "Menampilkan laporan data secara mendetail dengan diagram dan visualisasi untuk memudahkan analisis. Pengguna dapat melihat laporan penjualan, pengeluaran, dan performa karyawan yang dapat difilter atau diunduh.",
    },
    {
      icon: <Package className="text-gray-600" size={22} />,
      title: "Produk",
      desc:
        "Digunakan untuk memantau dan mengelola stok produk di cabang. Admin dapat menambahkan stok baru, mengurangi stok yang sudah terpakai, serta memastikan data persediaan selalu akurat. Dengan fitur ini, kontrol bahan dan ketersediaan produk dapat dilakukan lebih cepat dan efisien.",
    },
    {
      icon: <Users className="text-gray-600" size={22} />,
      title: "Manajemen Karyawan",
      desc:
        "Digunakan untuk mengelola data karyawan di cabang, termasuk informasi personal dan rincian gaji. Admin Cabang dapat menambah karyawan baru sesuai kebutuhan operasional, namun setiap penambahan akan melalui persetujuan dari Super Admin agar tetap transparan dan terkontrol.",
    },
    {
      icon: <Users className="text-gray-600" size={22} />,
      title: "Manajemen Kasir",
      desc:
        "Digunakan untuk mengelola data kasir di cabang, pengguna bisa menambah, memperbarui, atau menghapus data kasir sesuai kebutuhan operasional cabang.",
    },
    {
      icon: <PackagePlus className="text-gray-600" size={22} />,
      title: "Pemesanan",
      desc:
        "Digunakan untuk mencatat dan mengelola setiap pesanan yang masuk di cabang. Admin Cabang dapat melihat detail pesanan, dan status pemesanan. Fitur ini membantu Admin Cabang dalam memantau dan mengelola pesanan dengan lebih baik.",
    },
    {
      icon: <Wallet className="text-gray-600" size={22} />,
      title: "Pengeluaran",
      desc:
        "Menampilkan seluruh data pengeluaran yang tercatat di cabang. Setiap transaksi pengeluaran berisi informasi rinci seperti tanggal, jumlah, dan deskripsi penggunaan dana. Fitur ini membantu Admin Cabang dalam mencatat dan mengontrol keuangan operasional harian dengan lebih akurat.",
    },
    {
      icon: <DollarSign className="text-gray-600" size={22} />,
      title: "Transaksi",
      desc:
        "Riwayat dan detail semua transaksi penjualan yang terjadi di cabang. Admin Cabang dapat melihat informasi lengkap setiap transaksi, termasuk metode pembayaran, item yang dibeli, dan total penjualan. Fitur ini memudahkan pemantauan performa penjualan harian dan analisis tren pembelian pelanggan.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Help Center — Panduan Umum
        </h1>
        <p className="text-gray-600 text-sm max-w-2xl">
          Berikut panduan penggunaan setiap halaman dalam sistem GoChicken
          Management untuk Admin Cabang. Panduan ini membantu memahami fungsi
          utama dari masing-masing fitur operasional di cabang Anda.
        </p>
      </motion.div>

      {/* Guides Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="bg-gray-100 p-3 rounded-full">{item.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HelpPageCabang;