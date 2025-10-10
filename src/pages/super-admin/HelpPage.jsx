// src/pages/HelpPage.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  BarChart2,
  Layers,
  Users,
  Building2,
  UserCog,
  Wallet,
  Receipt,
  Package,
} from "lucide-react";

const HelpPage = () => {
  const guides = [
    {
      icon: <BookOpen className="text-green-600" size={22} />,
      title: "General Page",
      desc:
        "Menampilkan ringkasan aktivitas operasional, statistik utama, dan aktivitas terbaru. Super Admin dan Admin Cabang dapat memantau performa sistem, penjualan, serta aktivitas harian melalui grafik dan daftar aktivitas.",
    },
    {
      icon: <BarChart2 className="text-green-600" size={22} />,
      title: "Reports Page",
      desc:
        "Menampilkan laporan data secara mendetail dengan diagram dan visualisasi untuk memudahkan analisis. Pengguna dapat melihat laporan penjualan, pengeluaran, dan performa karyawan yang dapat difilter atau diunduh.",
    },
    {
      icon: <Building2 className="text-green-600" size={22} />,
      title: "Kelola Cabang Page",
      desc:
        "Digunakan untuk mengelola data seluruh cabang di sistem. Super Admin dapat menambah, memperbarui, atau menghapus cabang yang tidak aktif.",
    },
    {
      icon: <Layers className="text-green-600" size={22} />,
      title: "Kelola Produk Page",
      desc:
        "Berfungsi untuk menambah, mengubah, dan menghapus produk yang tersedia. Setiap produk dapat memiliki deskripsi, harga, dan gambar untuk tampilan yang menarik.",
    },
    {
      icon: <Users className="text-green-600" size={22} />,
      title: "Karyawan Page",
      desc:
        "Menampilkan daftar seluruh karyawan yang bekerja di setiap cabang. Admin Cabang dapat menambahkan, memperbarui, atau menghapus data karyawan sesuai kebutuhan.",
    },
    {
      icon: <UserCog className="text-green-600" size={22} />,
      title: "Admin Cabang Page",
      desc:
        "Fitur khusus untuk Super Admin dalam menambah dan mengelola akun Admin Cabang. Setiap Admin Cabang bertanggung jawab atas aktivitas di cabangnya masing-masing.",
    },
    {
      icon: <Wallet className="text-green-600" size={22} />,
      title: "Pengeluaran Page",
      desc:
        "Digunakan untuk mencatat semua jenis pengeluaran di cabang. Setiap transaksi pengeluaran harus disertai keterangan rinci agar memudahkan evaluasi keuangan.",
    },
    {
      icon: <Receipt className="text-green-600" size={22} />,
      title: "Transaksi Page",
      desc:
        "Menampilkan seluruh riwayat transaksi yang terjadi di sistem. Pengguna dapat meninjau detail transaksi, status pembayaran, dan mengekspor data ke PDF atau Excel.",
    },
    {
      icon: <Package className="text-green-600" size={22} />,
      title: "Daftar Bahan Baku Page",
      desc:
        "Berfungsi untuk mengelola data bahan baku yang digunakan dalam operasional. Super Admin dapat menambah, memperbarui, atau menghapus bahan baku sesuai kebutuhan stok produksi.",
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
          Management. Panduan ini membantu memahami fungsi utama dari masing-masing fitur.
        </p>
      </motion.div>

      {/* Cards */}
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
              <div className="bg-green-100 p-3 rounded-full">
                {item.icon}
              </div>
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

export default HelpPage;