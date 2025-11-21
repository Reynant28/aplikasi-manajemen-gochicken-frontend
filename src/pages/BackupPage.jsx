// src/pages/super-admin/BackupPage.jsx
import React, { useState, useEffect } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Database,
  Clock,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText,
  User,
  Shield,
  Server,
  Trash2,
  X,
} from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const BackupPage = () => {
  const [loading, setLoading] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [backupHistory, setBackupHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const token = localStorage.getItem("token");

  // Load backup history on component mount
  useEffect(() => {
    loadBackupHistory();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBackupHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await axios.get(`${API_URL}/backup-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        setBackupHistory(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load backup history:", error);
      setMessage({
        type: "error",
        text: "Gagal memuat riwayat backup",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post(
        `${API_URL}/backup`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Get filename from content-disposition header
      const contentDisposition = response.headers["content-disposition"];
      let filename = "gochicken_backup.sql";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage({
        type: "success",
        text: "Backup database SQL berhasil didownload!",
      });

      // Reload backup history to include the new backup
      await loadBackupHistory();
    } catch (error) {
      console.error("Backup error:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal membuat backup database";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const openClearModal = () => {
    setShowClearModal(true);
  };

  const closeClearModal = () => {
    setShowClearModal(false);
  };

  const handleClearHistory = async () => {
    setClearingHistory(true);

    try {
      const response = await axios.delete(`${API_URL}/backup-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        setBackupHistory([]);
        setMessage({
          type: "success",
          text: "Riwayat backup berhasil dihapus!",
        });
        closeClearModal();
      }
    } catch (error) {
      console.error("Failed to clear backup history:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus riwayat backup";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setClearingHistory(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (success) => {
    return success ? "text-green-600" : "text-red-600";
  };

  const getStatusBgColor = (success) => {
    return success ? "bg-green-100" : "bg-red-100";
  };

  const getFileTypeIcon = (fileType) => {
    return fileType === "sql" ? <Database size={16} /> : <FileText size={16} />;
  };

  const getFileTypeColor = (fileType) => {
    return fileType === "sql" ? "text-blue-600" : "text-purple-600";
  };

  return (
    <>
      <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Backup Database
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Backup dan kelola data sistem GoChicken
            </p>
          </div>
        </div>

        {/* Message Display */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg flex items-center gap-3 text-sm font-semibold ${
                message.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backup Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Backup Information */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Database className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Backup Database GoChicken
                  </h2>
                  <p className="text-sm text-gray-500">Database: gochicken</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <HardDrive size={16} className="text-gray-400" />
                  <span>
                    Format file: <strong>SQL</strong> (MySQL Dump)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Server size={16} className="text-gray-400" />
                  <span>
                    Metode: <strong>mysqldump</strong> + fallback manual
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span>
                    Backup terakhir:{" "}
                    <strong>
                      {backupHistory.length > 0
                        ? formatDate(backupHistory[0].created_at)
                        : "Belum ada backup"}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-gray-400" />
                  <span>
                    Total backup: <strong>{backupHistory.length} file</strong>
                  </span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Penting:</strong> Backup database SQL berisi seluruh
                  struktur dan data database. File dapat digunakan untuk restore
                  database lengkap menggunakan MySQL atau phpMyAdmin.
                </p>
              </div>
            </div>

            {/* Backup Action */}
            <div className="lg:w-64 flex flex-col justify-center">
              <button
                onClick={handleBackup}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-red-400 w-full shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Membuat Backup...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Download Backup SQL
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                File SQL akan didownload secara otomatis
              </p>
            </div>
          </div>
        </div>

        {/* Backup History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Riwayat Backup
            </h3>
            <div className="flex gap-2">
              {backupHistory.length > 0 && (
                <button
                  onClick={openClearModal}
                  className="flex items-center gap-2 text-sm bg-red-500 text-white hover:bg-red-600 px-3 py-2 rounded-lg transition font-medium"
                >
                  <Trash2 size={16} />
                  Hapus Riwayat
                </button>
              )}
              <button
                onClick={loadBackupHistory}
                disabled={loadingHistory}
                className="flex items-center gap-2 text-sm bg-gray-500 text-white hover:bg-gray-600 px-3 py-2 rounded-lg transition font-medium disabled:bg-gray-300"
              >
                {loadingHistory ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <RefreshCw size={16} />
                )}
                {loadingHistory ? "Memuat..." : "Refresh"}
              </button>
            </div>
          </div>

          {loadingHistory ? (
            <div className="text-center py-8">
              <Loader2
                className="mx-auto animate-spin mb-3 text-gray-400"
                size={32}
              />
              <p className="text-gray-500">Memuat riwayat backup...</p>
            </div>
          ) : backupHistory.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {backupHistory.map((backup) => (
                <motion.div
                  key={backup.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    backup.success
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusBgColor(
                        backup.success
                      )}`}
                    >
                      <span className={getFileTypeColor(backup.file_type)}>
                        {getFileTypeIcon(backup.file_type)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {backup.filename}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock size={12} />
                        <span>{formatDate(backup.created_at)}</span>
                        <span>•</span>
                        <User size={12} />
                        <span>{backup.user?.name || "System"}</span>
                        <span>•</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {backup.file_type?.toUpperCase() || "SQL"}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {backup.user_role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {formatFileSize(backup.file_size)}
                    </p>
                    <p
                      className={`text-xs font-semibold ${getStatusColor(
                        backup.success
                      )}`}
                    >
                      {backup.success ? "Berhasil" : "Gagal"}
                    </p>
                    {backup.error_message && (
                      <p className="text-xs text-red-500 mt-1 max-w-xs">
                        {backup.error_message}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="mx-auto text-gray-400 mb-3" size={32} />
              <p className="text-gray-500">Belum ada riwayat backup</p>
              <p className="text-sm text-gray-400 mt-1">
                Backup database untuk melihat riwayat di sini
              </p>
            </div>
          )}
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <AlertCircle size={16} />
              Tips Backup SQL
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Backup database secara berkala (minimal 1x seminggu)</li>
              <li>
                • File SQL dapat di-restore menggunakan MySQL atau phpMyAdmin
              </li>
              <li>• Simpan file backup di lokasi yang aman dan terenkripsi</li>
              <li>
                • Test restore backup secara periodik untuk memastikan
                integritas
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <CheckCircle size={16} />
              Yang Tercakup dalam Backup
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Semua struktur tabel dan relationship</li>
              <li>• Semua data transaksi, produk, dan pengeluaran</li>
              <li>• Data karyawan, pengguna, dan cabang</li>
              <li>• Riwayat / History</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Clear History Confirmation Modal */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            onMouseDown={closeClearModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              onMouseDown={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Hapus Riwayat Backup
                </h2>
                <button
                  onClick={closeClearModal}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle
                    className="text-red-600 flex-shrink-0"
                    size={24}
                  />
                  <div>
                    <p className="font-semibold text-red-800">Peringatan</p>
                    <p className="text-sm text-red-700 mt-1">
                      Anda akan menghapus semua riwayat backup. Tindakan ini
                      tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Detail yang akan dihapus:</strong>
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• {backupHistory.length} entri riwayat backup</li>
                    <li>• Informasi file backup</li>
                    <li>• Data pengguna dan timestamp</li>
                    <li>• Status keberhasilan backup</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeClearModal}
                    disabled={clearingHistory}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold disabled:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleClearHistory}
                    disabled={clearingHistory}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-red-400 flex items-center justify-center gap-2"
                  >
                    {clearingHistory ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Menghapus...
                      </>
                    ) : (
                      "Hapus Semua"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BackupPage;
