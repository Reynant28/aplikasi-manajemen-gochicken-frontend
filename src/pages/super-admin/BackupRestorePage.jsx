import { useState, useEffect, useCallback } from "react";
import { 
  Download, 
  Upload, 
  Database, 
  FileText, 
  Calendar,
  HardDrive,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle
} from "lucide-react"; 
import { motion } from "framer-motion";
import {
  ConfirmDeletePopup,
  SuccessPopup,
  Modal,
  DataTable
} from "../../components/ui";

const API_URL = "http://localhost:8000/api";

const BackupRestorePage = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // States for modals and popups
  const [showImportModal, setShowImportModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteBackup, setDeleteBackup] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch backups list
  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/backup/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBackups(data.data || []);
      }
    } catch (err) {
      console.error("Fetch backups error:", err);
      setBackups([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchBackups();
  }, [token, fetchBackups]);

  // Export database
  const handleExport = async () => {
    try {
        setExporting(true);
        
        const response = await fetch(`${API_URL}/backup/export`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `backup_${new Date().toISOString().split('T')[0]}.sql`;
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setSuccessMessage(`Backup database berhasil diexport!`);
            setShowSuccess(true);
            fetchBackups(); // Refresh list
        } else {
            // Try to get detailed error message
            const errorData = await response.json();
            throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
        }
    } catch (err) {
        console.error("Export error:", err);
        alert(`❌ Gagal export database: ${err.message}`);
    } finally {
        setExporting(false);
    }
};

  // Import database
  const handleImport = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("❌ Pilih file backup terlebih dahulu!");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('backup_file', selectedFile);

      const response = await fetch(`${API_URL}/backup/import`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message || "Database berhasil diimport!");
        setShowSuccess(true);
        setShowImportModal(false);
        setSelectedFile(null);
        fetchBackups();
      } else {
        throw new Error(data.message || 'Import failed');
      }
    } catch (err) {
      console.error("Import error:", err);
      alert(`❌ Gagal import database: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Delete backup
  const confirmDelete = (backup) => {
    setDeleteBackup(backup);
    setShowConfirm(true);
  };

  const handleDeleteBackup = async () => {
    try {
      const response = await fetch(`${API_URL}/backup/delete/${encodeURIComponent(deleteBackup.name)}`, {
          method: 'DELETE',
          headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
      });

      const data = await response.json();

      if (data.success) {
          setSuccessMessage(data.message || 'Backup berhasil dihapus!');
          setShowSuccess(true);
          setShowConfirm(false);
          fetchBackups(); // Refresh the list
      } else {
          throw new Error(data.message || 'Gagal menghapus backup');
      }
    } catch (err) {
        console.error("Delete backup error:", err);
        alert(`❌ Gagal menghapus backup: ${err.message}`);
    }
  };

  const closeSuccessPopup = () => setShowSuccess(false);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Define columns configuration for the reusable DataTable
  const backupColumns = [
    { 
      key: 'name', 
      header: 'Nama File',
      bold: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <FileText size={16} className="text-gray-500" />
          <span className="font-medium">{item.name}</span>
        </div>
      )
    },
    { 
      key: 'size', 
      header: 'Ukuran',
      align: 'center',
      render: (item) => formatFileSize(item.size)
    },
    { 
      key: 'modified', 
      header: 'Tanggal Dibuat',
      align: 'center',
      render: (item) => new Date(item.modified).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
  ];

  // Define action buttons for the table
  const renderAction = (item) => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => window.open(`${API_URL}/backup/download?file=${encodeURIComponent(item.name)}`, '_blank')}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
        title="Download Backup"
      >
        <Download size={14} />
      </button>
      <button
        onClick={() => confirmDelete(item)}
        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
        title="Hapus Backup"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  // Pagination calculations
  const totalPages = Math.ceil(backups.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = backups.slice(indexOfFirst, indexOfLast);

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(2, currentPage - Math.floor((maxPagesToShow - 3) / 2));
      const endPage = Math.min(totalPages - 1, currentPage + Math.ceil((maxPagesToShow - 3) / 2));

      pages.push(1);
      if (startPage > 2) pages.push("...");
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < totalPages - 1) pages.push("...");
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages.filter((value, index, self) => self.indexOf(value) === index);
  };

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-800">Backup & Restore Database</h1>
                <p className="text-gray-600">Kelola backup dan restore database sistem</p>
            </div>
          
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button 
                onClick={handleExport}
                disabled={exporting}
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
              >
                {exporting ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <Download size={20} />
                )}
                {exporting ? 'Mengexport...' : 'Export Database'}
              </motion.button>

              <motion.button 
                onClick={() => setShowImportModal(true)}
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 font-semibold"
              >
                <Upload size={20} />
                Import Database
              </motion.button>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Backup</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{backups.length}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Database className="text-gray-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ukuran</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {formatFileSize(backups.reduce((total, backup) => total + backup.size, 0))}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <HardDrive className="text-gray-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Backup Terbaru</p>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {backups.length > 0 ? new Date(backups[0]?.modified).toLocaleDateString('id-ID') : '-'}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Calendar className="text-gray-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status Sistem</p>
                <p className="text-lg font-bold text-gray-600 mt-1">Aman</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <CheckCircle className="text-gray-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-md border border-gray-100">
          {/* Data Info */}
          <div className="text-sm text-gray-600">
            Menampilkan {indexOfFirst + 1}-{Math.min(indexOfLast, backups.length)} dari {backups.length} file backup
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchBackups}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ←
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, i) => (
                  <button
                    key={i}
                    onClick={() => typeof page === "number" && changePage(page)}
                    disabled={page === "..."}
                    className={`min-w-[36px] px-3 py-2 text-sm font-medium rounded-lg transition ${
                      currentPage === page
                        ? "bg-gray-700 text-white"
                        : page === "..."
                        ? "text-gray-400 cursor-default"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* Table Section - Using Reusable DataTable */}
        <DataTable
          data={currentData}
          columns={backupColumns}
          loading={loading}
          emptyMessage="Tidak ada backup"
          emptyDescription="Belum ada file backup untuk ditampilkan"
          onRowAction={renderAction}
          showActions={true}
          actionLabel="Aksi"
        />
      </motion.div>

      {/* Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Import Database</h2>
              <p className="text-gray-500 text-sm mt-1">Upload file backup database</p>
            </div>
          </div>

          <form onSubmit={handleImport} className="space-y-4">
            {/* File Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Backup (.sql)
              </label>
              <input
                type="file"
                accept=".sql,.txt"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                required
                className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                Hanya file SQL dengan format backup yang valid
              </p>
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-red-600 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <p className="text-sm font-medium text-red-800">Peringatan!</p>
                  <p className="text-xs text-red-700 mt-1">
                    Import database akan menggantikan semua data saat ini. 
                    Pastikan Anda telah membuat backup terlebih dahulu.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex-1"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-1"
              >
                {uploading ? "Mengimport..." : "Import Database"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Popup */}
      <ConfirmDeletePopup
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDeleteBackup}
        title="Hapus Backup"
        message={`Apakah Anda yakin ingin menghapus backup "${deleteBackup?.name}"?`}
      />

      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccess}
        onClose={closeSuccessPopup}
        title="Berhasil"
        message={successMessage}
      />
    </div>
  );
};

export default BackupRestorePage;