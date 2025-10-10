import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash, FileText } from "lucide-react"; 
import { useNotification } from "../../components/context/NotificationContext"; 
import { motion } from "framer-motion";
import {
  ConfirmDeletePopup,
  SuccessPopup,
  Button,
  Modal,
} from "../../components/ui";

const API_URL = "http://localhost:8000/api";

const PengeluaranPage = () => {
  const [pengeluaran, setPengeluaran] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ HOOK NOTIFIKASI
  const { addNotification } = useNotification(); 
  
  // --- STATE LAINNYA (Tidak Berubah) ---
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const [formData, setFormData] = useState({
    id_jenis: "",
    tanggal: "",
    jumlah: "",
    keterangan: "",
  });

  const [editPengeluaran, setEditPengeluaran] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const cabang = JSON.parse(localStorage.getItem("cabang"));

  // Ambil data pengeluaran
  const fetchPengeluaran = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/pengeluaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPengeluaran(data.data || []);
    } catch (err) {
      console.error("Fetch pengeluaran error:", err);
      setPengeluaran([]);
    } finally {
        setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchPengeluaran();
  }, [token, fetchPengeluaran]);

  // Tambah pengeluaran
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/pengeluaran`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          id_cabang: cabang?.id_cabang || 1, // ambil dari localStorage
        }),
      });

      const data = await res.json();
      if (res.status === 201 || data.status === "success") {
        setSuccessMessage(data.message || "Pengeluaran berhasil ditambahkan!");
        setShowSuccess(true);
        // ✅ TAMBAH NOTIFIKASI
        addNotification(`[Pengeluaran] Berhasil menambah data pengeluaran ${formData.keterangan}`, 'success');

        setFormData({ id_jenis: "", tanggal: "", jumlah: "", keterangan: "" });
        setShowForm(false);
        fetchPengeluaran();
      } else {
        // ✅ TAMBAH NOTIFIKASI JIKA GAGAL
        addNotification(`[Pengeluaran] Gagal menambah data: ${data.message || 'Error'}`, 'error');
        alert("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Add pengeluaran error:", err);
    }

    setLoading(false);
  };

  // Update pengeluaran
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${API_URL}/pengeluaran/${editPengeluaran.id_pengeluaran}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...editPengeluaran,
            id_cabang: cabang?.id_cabang || 1,
            id_jenis: editPengeluaran.id_jenis || 1,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || "Pengeluaran berhasil diupdate!");
        setShowSuccess(true);
        // ✅ TAMBAH NOTIFIKASI
        addNotification(`[Pengeluaran] Berhasil mengubah data pengeluaran ID ${editPengeluaran.id_pengeluaran}`, 'success');
        fetchPengeluaran();
        setEditPengeluaran(null);
      } else {
        // ✅ TAMBAH NOTIFIKASI JIKA GAGAL
        addNotification(`[Pengeluaran] Gagal mengubah data: ${data.message || 'Error'}`, 'error');
        alert("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      console.error("Update pengeluaran error:", err);
    }
  };

  // Hapus pengeluaran
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/pengeluaran/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSuccessMessage("Pengeluaran berhasil dihapus!");
        setShowSuccess(true);
        // ✅ TAMBAH NOTIFIKASI
        addNotification(`[Pengeluaran] Data pengeluaran ID ${deleteId} telah dihapus.`, 'error');
        fetchPengeluaran();
      } else {
        // Coba ambil pesan error jika ada
        const data = await res.json();
        // ✅ TAMBAH NOTIFIKASI JIKA GAGAL
        addNotification(`[Pengeluaran] Gagal menghapus data: ${data.message || 'Unknown Error'}`, 'error');
      }
    } catch (err) {
      console.error("Delete pengeluaran error:", err);
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  // ... (Sisa fungsi dan render komponen tidak berubah) ...
  const closeSuccessPopup = () => setShowSuccess(false);

  // --- LOGIKA FILTER DAN PAGINATION BARU ---
  
  // Filter berdasarkan tanggal
  const filteredData = pengeluaran.filter(
    (p) => !selectedDate || p.tanggal.startsWith(selectedDate)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(
        2,
        currentPage - Math.floor((maxPagesToShow - 3) / 2)
      );
      const endPage = Math.min(
        totalPages - 1,
        currentPage + Math.ceil((maxPagesToShow - 3) / 2)
      );

      pages.push(1);

      if (startPage > 2) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    if (pages[0] === "...") {
      pages.shift();
    }
    if (pages[pages.length - 1] === "...") {
      pages.pop();
    }

    return pages.filter((value, index, self) => self.indexOf(value) === index);
  };
  // ----------------------------------------

  /**
   * ✅ FUNGSI BARU: Export Laporan (Buka Tab Baru)
   */
  const handleExportReport = () => {
    if (filteredData.length === 0) {
      addNotification("Tidak ada data untuk diekspor!", 'info');
      return;
    }

    // Buat konten HTML untuk laporan
    const reportHTML = generateReportHTML(filteredData, selectedDate);
    
    // Buka tab baru dan tuliskan konten HTML
    const newWindow = window.open("", "_blank");
    newWindow.document.write(reportHTML);
    newWindow.document.close();
    
    addNotification("Laporan Pengeluaran berhasil diekspor (Web View)", 'info');
  };

  /**
   * FUNGSI HELPER: Membuat HTML untuk Laporan
   * Ini adalah bagian di mana Anda bisa mendesain tampilan tabel
   */
  const generateReportHTML = (data, dateFilter) => {
    const tableRows = data.map((item, index) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; text-align: left;">${index + 1}</td>
        <td style="padding: 10px; text-align: left;">${item.id_jenis || '-'}</td>
        <td style="padding: 10px; text-align: left;">${item.keterangan}</td>
        <td style="padding: 10px; text-align: right; color: #dc2626; font-weight: bold;">Rp ${parseInt(item.jumlah).toLocaleString('id-ID')}</td>
        <td style="padding: 10px; text-align: left;">${item.tanggal}</td>
      </tr>
    `).join('');

    const totalPengeluaran = data.reduce((sum, item) => sum + parseInt(item.jumlah), 0);
    const dateDisplay = dateFilter ? `Tanggal ${dateFilter}` : 'Semua Tanggal';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Data Pengeluaran</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 20px; color: #333; }
          h1 { color: #16a34a; border-bottom: 3px solid #16a34a; padding-bottom: 10px; }
          p { margin-bottom: 20px; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          th { background-color: #f0fdf4; color: #16a34a; padding: 12px; text-align: left; border-bottom: 2px solid #a7f3d0; }
          td { padding: 12px; border-bottom: 1px solid #eee; }
          tr:nth-child(even) { background-color: #fafafa; }
          .total-row td { background-color: #dcfce7; font-weight: bold; border-top: 3px solid #16a34a; }
          .export-button {
            background-color: #10b981;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 20px;
            font-size: 16px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: background-color 0.3s;
          }
          .export-button:hover { background-color: #059669; }
          @media print {
            .export-button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Laporan Data Pengeluaran GoChicken</h1>
        <p>Periode: ${dateDisplay}</p>
        
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">No</th>
              <th style="width: 15%;">Jenis</th>
              <th style="width: 45%;">Keterangan</th>
              <th style="width: 15%; text-align: right;">Jumlah</th>
              <th style="width: 20%;">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">TOTAL PENGELUARAN</td>
              <td style="text-align: right; color: #dc2626;">Rp ${totalPengeluaran.toLocaleString('id-ID')}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
        
        <button class="export-button" onclick="window.print()">Cetak Laporan</button>
      </body>
      </html>
    `;
  };
  
  // ----------------------------------------

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 via-white to-green-100">
      <motion.h1
        className="text-4xl font-extrabold text-green-700 mb-8 drop-shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Kelola Pengeluaran
      </motion.h1>

      <div className="mb-6 flex justify-between items-start">
        <Button onClick={() => setShowForm(true)}>
          <Plus size={18} /> Tambah Pengeluaran
        </Button>
        
        {/* ✅ FILTER TANGGAL DAN PAGINATION */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex flex-col items-end">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Pilih Tanggal
            </label>
            <input
              type="date"
              placeholder="hh/bb/tttt"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded-xl px-4 py-2 w-48 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-700"
            />
          </div>

          {/* Pagination Component */}
          {totalPages > 1 && (
            <div className="flex items-center border border-gray-200 rounded-xl shadow-md divide-x divide-gray-200">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-3 rounded-l-xl transition duration-150 ease-in-out ${
                  currentPage === 1
                    ? "bg-gray-100 cursor-not-allowed text-gray-400"
                    : "bg-white hover:bg-green-50 hover:text-green-600 text-gray-700"
                }`}
              >
                <span className="text-gray-600">
                  &lt;
                </span>
              </button>
              {getPageNumbers().map((page, i) => (
                <button
                  key={i}
                  onClick={() => typeof page === "number" && changePage(page)}
                  disabled={page === "..."}
                  className={`px-4 py-2 text-sm font-medium transition duration-150 ease-in-out ${
                    currentPage === page
                      ? "bg-green-600 text-white shadow-inner shadow-green-800/20"
                      : page === "..."
                      ? "bg-white text-gray-400 cursor-default"
                      : "bg-white text-gray-700 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-3 rounded-r-xl transition duration-150 ease-in-out ${
                  currentPage === totalPages
                    ? "bg-gray-100 cursor-not-allowed text-gray-400"
                    : "bg-white hover:bg-green-50 hover:text-green-600 text-gray-700"
                }`}
              >
                <span className="text-gray-600">
                  &gt;
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Tabel Pengeluaran --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-hidden bg-white shadow-md rounded-xl"
      >
        {loading ? (
          <p className="p-4 text-center text-gray-500">⏳ Memuat data...</p>
        ) : currentData.length === 0 ? (
          <p className="p-4 text-center text-gray-600">❌ Tidak ada data pengeluaran yang sesuai dengan filter.</p>
        ) : (
          <table className="min-w-full text-sm text-gray-700 border-separate border-spacing-0">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left font-semibold border-b border-gray-200">
                  No
                </th>
                <th className="px-6 py-4 text-left font-semibold border-b border-gray-200">
                  Jenis
                </th>
                <th className="px-6 py-4 text-left font-semibold border-b border-gray-200">
                  Keterangan
                </th>
                <th className="px-6 py-4 text-left font-semibold border-b border-gray-200">
                  Jumlah
                </th>
                <th className="px-6 py-4 text-left font-semibold border-b border-gray-200">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-center font-semibold border-b border-gray-200">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.id_pengeluaran} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold text-gray-800 border-b border-gray-200">
                    {indexOfFirst + index + 1} {/* Nomor urut berdasarkan halaman */}
                  </td>
                  <td className="px-6 py-4 text-gray-700 border-b border-gray-200">
                    {/* Mengganti ID Jenis menjadi Label Jenis (Asumsi mapping sederhana) */}
                    {item.id_jenis == 1 ? "Bahan Baku" : item.id_jenis == 2 ? "Operasional" : "Lain-lain"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 italic border-b border-gray-200">
                    {item.keterangan}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        parseInt(item.jumlah) > 500000
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      Rp {parseInt(item.jumlah).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 border-b border-gray-200">
                    {item.tanggal}
                  </td>
                  <td className="px-6 py-4 text-center border-b border-gray-200">
                    <div className="flex justify-center gap-3">
                      <button
                        className="text-green-600 hover:text-green-800"
                        onClick={() => setEditPengeluaran(item)}
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => confirmDelete(item.id_pengeluaran)}
                        title="Hapus"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
      
      {/* ✅ TOMBOL EXPORT LAPORAN */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleExportReport}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition font-semibold transform hover:scale-[1.01]"
        >
          <FileText size={18} /> Ekspor Laporan (Web View)
        </button>
        
      </div>

      {/* --- Modal Tambah Pengeluaran --- (Tidak Berubah) */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
          <Plus size={18} /> Tambah Pengeluaran
        </h2>
        <form onSubmit={handleAdd}>
          <label className="text-sm font-medium text-gray-700">Jenis Pengeluaran</label>
          <select
            value={formData.id_jenis}
            onChange={(e) =>
              setFormData({ ...formData, id_jenis: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
            required
          >
            <option value="">-- Pilih Jenis Pengeluaran --</option>
            <option value="1">Bahan Baku</option>
            <option value="2">Operasional</option>
            <option value="3">Lain-lain</option>
          </select>

          <label className="text-sm font-medium text-gray-700">Keterangan</label>
          <textarea
            value={formData.keterangan}
            onChange={(e) =>
              setFormData({ ...formData, keterangan: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
            rows="3"
            placeholder="Deskripsi penggunaan"
            required
          />

          <label className="text-sm font-medium text-gray-700">Jumlah</label>
          <input
            type="number"
            value={formData.jumlah}
            onChange={(e) =>
              setFormData({ ...formData, jumlah: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
            placeholder="Nominal"
            required
          />

          <label className="text-sm font-medium text-gray-700">Tanggal</label>
          <input
            type="date"
            value={formData.tanggal}
            onChange={(e) =>
              setFormData({ ...formData, tanggal: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
            required
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- Modal Edit Pengeluaran --- (Tidak Berubah) */}
      <Modal
        isOpen={!!editPengeluaran}
        onClose={() => setEditPengeluaran(null)}
      >
        <h2 className="text-xl font-semibold mb-4 text-green-700">
          ✏️ Edit Pengeluaran
        </h2>

        <label className="text-sm font-medium text-gray-700">Jenis Pengeluaran</label>
        <select
          value={editPengeluaran?.id_jenis || ""}
          onChange={(e) =>
            setEditPengeluaran({
              ...editPengeluaran,
              id_jenis: e.target.value,
            })
          }
          className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
        >
          <option value="">-- Pilih Jenis Pengeluaran --</option>
          <option value="1">Bahan Baku</option>
          <option value="2">Operasional</option>
          <option value="3">Lain-lain</option>
        </select>

        <label className="text-sm font-medium text-gray-700">Tanggal</label>
        <input
          type="date"
          value={editPengeluaran?.tanggal || ""}
          onChange={(e) =>
            setEditPengeluaran({ ...editPengeluaran, tanggal: e.target.value })
          }
          className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
        />

        <label className="text-sm font-medium text-gray-700">Jumlah</label>
        <input
          type="number"
          value={editPengeluaran?.jumlah || ""}
          onChange={(e) =>
            setEditPengeluaran({ ...editPengeluaran, jumlah: e.target.value })
          }
          className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
        />

        <label className="text-sm font-medium text-gray-700">Keterangan</label>
        <textarea
          value={editPengeluaran?.keterangan || ""}
          onChange={(e) =>
            setEditPengeluaran({
              ...editPengeluaran,
              keterangan: e.target.value,
            })
          }
          className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-800"
          rows="3"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setEditPengeluaran(null)}
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            onClick={handleUpdate}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Simpan
          </button>
        </div>
      </Modal>

      {/* --- Popup Hapus --- (Tidak Berubah) */}
      <ConfirmDeletePopup
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />

      {/* --- Popup Sukses --- (Tidak Berubah) */}
      <SuccessPopup
        isOpen={showSuccess}
        onClose={closeSuccessPopup}
        title="Aksi Berhasil 🎉"
        message={successMessage}
      />
    </div>
  );
};

export default PengeluaranPage;