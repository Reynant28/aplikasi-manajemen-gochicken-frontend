// src/pages/super-admin/AuditLogPage.jsx
import React, { useState, useEffect } from "react";
//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { 
    FileText, 
    User, 
    Calendar, 
    Database, 
    Search, 
    RefreshCw,
    Loader2,
    Eye,
    ChevronDown,
    ChevronUp,
    Shield,
    Edit,
    Plus,
    Trash2,
    Filter,
    X,
    Download,
    Building
} from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const AuditLogPage = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTable, setSelectedTable] = useState("all");
    const [selectedAction, setSelectedAction] = useState("all");
    //eslint-disable-next-line no-unused-vars
    const [expandedLogs, setExpandedLogs] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [dateFilter, setDateFilter] = useState({
        startDate: "",
        endDate: ""
    });
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [clearingLogs, setClearingLogs] = useState(false);
    const [exporting, setExporting] = useState(false);

    const token = localStorage.getItem("token");

    const tables = [
        { value: "all", label: "Semua Tabel" },
        { value: "users", label: "Users" },
        { value: "cabang", label: "Cabang" },
        { value: "karyawan", label: "Karyawan" },
        { value: "produk", label: "Produk" },
        { value: "bahan_baku", label: "Bahan Baku" },
        { value: "transaksi", label: "Transaksi" },
        { value: "pengeluaran", label: "Pengeluaran" },
        { value: "stok_cabang", label: "Stok Cabang" }
    ];

    const actions = [
        { value: "all", label: "Semua Aksi" },
        { value: "CREATE", label: "Buat Data" },
        { value: "UPDATE", label: "Update Data" },
        { value: "DELETE", label: "Hapus Data" }
    ];

    useEffect(() => {
        loadAuditLogs(true);
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadAuditLogs = async (reset = false) => {
        try {
            if (reset) {
                setLoading(true);
                setCurrentPage(1);
            } else {
                setLoadingMore(true);
            }

            const page = reset ? 1 : currentPage + 1;
            
            // Build query parameters
            const params = new URLSearchParams({
                page: page.toString()
            });

            if (dateFilter.startDate) {
                params.append('start_date', dateFilter.startDate);
            }
            if (dateFilter.endDate) {
                params.append('end_date', dateFilter.endDate);
            }

            const response = await axios.get(`${API_URL}/audit-logs?${params.toString()}`, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });
            
            if (response.data.status === 'success') {
                const newLogs = response.data.data.data;
                if (reset) {
                    setAuditLogs(newLogs);
                } else {
                    setAuditLogs(prev => [...prev, ...newLogs]);
                }
                
                setCurrentPage(page);
                setHasMore(response.data.data.next_page_url !== null);
            }
        } catch (error) {
            console.error("Failed to load audit logs:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const showLogDetails = (log) => {
        setSelectedLog(log);
        setShowDetailModal(true);
    };

    const clearAuditLogs = async () => {
        try {
            setClearingLogs(true);
            await axios.delete(`${API_URL}/audit-logs/clear`, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });
            
            // Close modal and reload data
            setShowClearConfirm(false);
            await loadAuditLogs(true);
            
        } catch (error) {
            console.error("Failed to clear audit logs:", error);
            alert('Gagal membersihkan audit log');
        } finally {
            setClearingLogs(false);
        }
    };

    const exportToExcel = async () => {
        try {
            setExporting(true);
            
            // Get all audit logs for export
            const params = new URLSearchParams();
            
            if (dateFilter.startDate) {
                params.append('start_date', dateFilter.startDate);
            }
            if (dateFilter.endDate) {
                params.append('end_date', dateFilter.endDate);
            }
            if (selectedTable !== 'all') {
                params.append('table', selectedTable);
            }
            if (selectedAction !== 'all') {
                params.append('action', selectedAction);
            }

            const response = await axios.get(`${API_URL}/audit-logs?${params.toString()}&per_page=1000`, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });

            if (response.data.status === 'success') {
                const logs = response.data.data.data;
                
                // Create structured Excel content
                const headers = [
                    'NO',
                    'TANGGAL & WAKTU',
                    'USER',
                    'ROLE', 
                    'CABANG',
                    'AKSI',
                    'TABEL',
                    'ID RECORD',
                    'DESKRIPSI',
                    'IP ADDRESS'
                ];

                const data = logs.map((log, index) => [
                    index + 1,
                    formatDateForExcel(log.created_at),
                    log.user?.nama || 'System',
                    formatRoleForExcel(log.user_role),
                    log.user?.cabang?.nama_cabang || '-',
                    formatActionForExcel(log.action),
                    log.table_name,
                    log.record_id,
                    log.description || '-',
                    log.ip_address || '-'
                ]);

                // Create CSV content with proper formatting
                const csvContent = [
                    'LAPORAN AUDIT LOG SYSTEM GOCHICKEN',
                    `Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`,
                    `Total Data: ${logs.length} log`,
                    '',
                    headers.join(','),
                    ...data.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
                ].join('\n');

                // Create and download file
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `Audit-Log-GoChicken-${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
            }
        } catch (error) {
            console.error("Failed to export audit logs:", error);
            alert('Gagal mengekspor audit log');
        } finally {
            setExporting(false);
        }
    };

    const formatDateForExcel = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatRoleForExcel = (role) => {
        switch (role) {
            case 'super admin': return 'Super Admin';
            case 'admin cabang': return 'Admin Cabang';
            case 'kasir': return 'Kasir';
            default: return role;
        }
    };

    const formatActionForExcel = (action) => {
        switch (action) {
            case 'CREATE': return 'Buat Data';
            case 'UPDATE': return 'Update Data';
            case 'DELETE': return 'Hapus Data';
            default: return action;
        }
    };

    const applyDateFilter = () => {
        loadAuditLogs(true);
        setShowDateFilter(false);
    };

    const clearDateFilter = () => {
        setDateFilter({ startDate: "", endDate: "" });
        loadAuditLogs(true);
        setShowDateFilter(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'CREATE':
                return <Plus size={14} className="text-green-600" />;
            case 'UPDATE':
                return <Edit size={14} className="text-blue-600" />;
            case 'DELETE':
                return <Trash2 size={14} className="text-red-600" />;
            default:
                return <FileText size={14} />;
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE':
                return "bg-green-100 text-green-800 border-green-200";
            case 'UPDATE':
                return "bg-blue-100 text-blue-800 border-blue-200";
            case 'DELETE':
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // FIXED: Added safe access to user properties
    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = 
            log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesTable = selectedTable === "all" || log.table_name === selectedTable;
        const matchesAction = selectedAction === "all" || log.action === selectedAction;
        
        return matchesSearch && matchesTable && matchesAction;
    });

    const formatUserDisplay = (log) => {
        return log.user?.nama || 'System';
    };

    const formatRoleDisplay = (log) => {
        switch (log.user_role) {
            case 'super admin':
                return 'Super Admin';
            case 'admin cabang':
                return 'Admin Cabang';
            case 'kasir':
                return 'Kasir';
            default:
                return log.user_role || 'Unknown';
        }
    };

    const formatCabangDisplay = (log) => {
        if (log.user_role === 'super admin') {
            return 'Super Admin';
        }
        return log.user?.cabang?.nama_cabang || 'Tidak ada cabang';
    };

    const getDetailModalFields = (log) => {
        if (log.user_role === 'super admin') {
            return [
                { label: 'User', value: formatUserDisplay(log), icon: User },
                { label: 'Role', value: formatRoleDisplay(log), icon: Shield },
                { label: 'Waktu', value: formatDate(log.created_at), icon: Calendar }
            ];
        } else {
            return [
                { label: 'Role', value: formatRoleDisplay(log), icon: Shield },
                { label: 'Cabang', value: formatCabangDisplay(log), icon: Building },
                { label: 'Waktu', value: formatDate(log.created_at), icon: Calendar }
            ];
        }
    };

    const getChanges = (oldData, newData) => {
        if (!oldData || !newData) return null;

        const old = typeof oldData === 'string' ? JSON.parse(oldData) : oldData;
        const new_ = typeof newData === 'string' ? JSON.parse(newData) : newData;

        const changes = [];
        
        Object.keys(new_).forEach(key => {
            if (old[key] !== new_[key]) {
                changes.push({
                    field: key,
                    oldValue: old[key],
                    newValue: new_[key]
                });
            }
        });

        return changes;
    };

    const renderDataAsTable = (data, title) => {
        if (!data) return null;

        let parsedData = data;
        if (typeof data === 'string') {
            try {
                parsedData = JSON.parse(data);
                //eslint-disable-next-line no-unused-vars
            } catch (e) {
                return (
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">{title}:</h4>
                        <pre className="json-view p-3 text-gray-600 bg-gray-50 rounded-lg overflow-x-auto">
                            {data}
                        </pre>
                    </div>
                );
            }
        }

        return (
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">{title}:</h4>
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-gray-600">
                        <tbody>
                            {Object.entries(parsedData).map(([key, value]) => (
                                <tr key={key} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-100 transition-colors">
                                    <td className="py-3 px-4 font-medium text-gray-700 align-top w-1/3 bg-gray-50">
                                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </td>
                                    <td className="py-3 px-4 align-top break-words">
                                        {typeof value === 'object' && value !== null ? 
                                            <pre className="text-xs whitespace-pre-wrap bg-white p-2 rounded border">
                                                {JSON.stringify(value, null, 2)}
                                            </pre> : 
                                            <span className="text-gray-800">{String(value)}</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Reusable Modal Component
    const Modal = ({ isOpen, onClose, children, maxWidth = "max-w-2xl" }) => {
        if (!isOpen) return null;

        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    {/* Blurry Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    
                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className={`relative bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    };

    // Modal Header Component
    const ModalHeader = ({ title, onClose }) => (
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
                <X size={24} className="text-gray-500" />
            </button>
        </div>
    );

    // Modal Footer Component
    const ModalFooter = ({ children }) => (
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            {children}
        </div>
    );

    return (
        <>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: #cbd5e1; 
                    border-radius: 10px; 
                    transition: background 0.2s;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                
                .modal-scrollbar::-webkit-scrollbar { width: 4px; }
                .modal-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .modal-scrollbar::-webkit-scrollbar-thumb { 
                    background: #d1d5db; 
                    border-radius: 4px; 
                }
                .modal-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
                
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* Detail Modal */}
            <Modal 
                isOpen={showDetailModal} 
                onClose={() => setShowDetailModal(false)}
                maxWidth="max-w-6xl"
            >
                <ModalHeader 
                    title="Detail Audit Log" 
                    onClose={() => setShowDetailModal(false)} 
                />
                
                <div className="flex-1 overflow-y-auto modal-scrollbar p-6">
                    {selectedLog && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-xl">
                                {getDetailModalFields(selectedLog).map((field, index) => (
                                    <div key={index}>
                                        <span className="text-sm font-medium text-blue-700 mb-1 flex items-center gap-2">
                                            <field.icon size={14} />
                                            {field.label}:
                                        </span>
                                        <p className="text-blue-900 font-semibold">{field.value}</p>
                                    </div>
                                ))}
                            </div>

                            {selectedLog.description && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                                    <span className="block text-sm font-medium text-gray-700 mb-2">Deskripsi:</span>
                                    <p className="text-gray-600">{selectedLog.description}</p>
                                </div>
                            )}

                            {/* Changes Summary for UPDATE actions */}
                            {selectedLog.action === 'UPDATE' && selectedLog.old_data && selectedLog.new_data && (
                                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                    <h4 className="text-sm font-medium text-yellow-800 mb-3 flex items-center gap-2">
                                        <Edit size={16} />
                                        Ringkasan Perubahan
                                    </h4>
                                    <div className="space-y-2">
                                        {getChanges(selectedLog.old_data, selectedLog.new_data)?.map((change, index) => (
                                            <div key={index} className="flex items-start gap-3 text-sm">
                                                <span className="font-medium text-yellow-700 min-w-24">
                                                    {change.field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                                </span>
                                                <div className="flex-1">
                                                    <div className="text-red-600 line-through">
                                                        {String(change.oldValue)}
                                                    </div>
                                                    <div className="text-green-600 font-medium">
                                                        {String(change.newValue)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {selectedLog.old_data && renderDataAsTable(selectedLog.old_data, "Data Lama")}
                                {selectedLog.new_data && renderDataAsTable(selectedLog.new_data, "Data Baru")}
                                
                                {!selectedLog.old_data && !selectedLog.new_data && (
                                    <div className="text-center py-8">
                                        <FileText className="mx-auto text-gray-400 mb-3" size={48} />
                                        <p className="text-gray-500">Tidak ada data tambahan</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Date Filter Modal */}
            <Modal 
                isOpen={showDateFilter} 
                onClose={() => setShowDateFilter(false)}
                maxWidth="max-w-md"
            >
                <ModalHeader 
                    title="Filter Tanggal" 
                    onClose={() => setShowDateFilter(false)} 
                />
                
                <div className="flex-1 p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal Mulai
                            </label>
                            <input
                                type="date"
                                value={dateFilter.startDate}
                                onChange={(e) => setDateFilter(prev => ({...prev, startDate: e.target.value}))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal Akhir
                            </label>
                            <input
                                type="date"
                                value={dateFilter.endDate}
                                onChange={(e) => setDateFilter(prev => ({...prev, endDate: e.target.value}))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <ModalFooter>
                    <button
                        onClick={clearDateFilter}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                        Hapus Filter
                    </button>
                    <button
                        onClick={applyDateFilter}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                        Terapkan
                    </button>
                </ModalFooter>
            </Modal>

            {/* Clear Confirmation Modal */}
            <Modal 
                isOpen={showClearConfirm} 
                onClose={() => setShowClearConfirm(false)}
                maxWidth="max-w-md"
            >
                <ModalHeader 
                    title="Hapus Semua Log" 
                    onClose={() => setShowClearConfirm(false)} 
                />
                
                <div className="flex-1 p-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="text-red-600" size={24} />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                            Konfirmasi Penghapusan
                        </h4>
                        <p className="text-gray-600">
                            Apakah Anda yakin ingin menghapus semua audit log? Tindakan ini tidak dapat dibatalkan dan semua riwayat perubahan data akan hilang.
                        </p>
                    </div>
                </div>

                <ModalFooter>
                    <button
                        onClick={() => setShowClearConfirm(false)}
                        disabled={clearingLogs}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Batal
                    </button>
                    <button
                        onClick={clearAuditLogs}
                        disabled={clearingLogs}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {clearingLogs ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Menghapus...
                            </>
                        ) : (
                            'Ya, Hapus Semua'
                        )}
                    </button>
                </ModalFooter>
            </Modal>

            <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Audit Log</h1>
                        <p className="text-gray-500 text-sm sm:text-base">Monitor semua perubahan data dalam sistem GoChicken</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Shield size={16} />
                        <span>Hanya dapat diakses oleh Super Admin</span>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari log..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            />
                        </div>

                        {/* Table Filter */}
                        <div>
                            <select
                                value={selectedTable}
                                onChange={(e) => setSelectedTable(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            >
                                {tables.map(table => (
                                    <option key={table.value} value={table.value}>
                                        {table.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Action Filter */}
                        <div>
                            <select
                                value={selectedAction}
                                onChange={(e) => setSelectedAction(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            >
                                {actions.map(action => (
                                    <option key={action.value} value={action.value}>
                                        {action.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={() => loadAuditLogs(true)}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition font-medium"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <RefreshCw size={18} />
                            )}
                            {loading ? 'Memuat...' : 'Refresh'}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={() => setShowDateFilter(true)}
                            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition font-medium"
                        >
                            <Filter size={18} />
                            Filter Tanggal
                        </button>
                        <button
                            onClick={exportToExcel}
                            disabled={exporting}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {exporting ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <Download size={18} />
                            )}
                            {exporting ? 'Mengekspor...' : 'Export Excel'}
                        </button>
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-medium"
                        >
                            <Trash2 size={18} />
                            Hapus Semua Log
                        </button>
                    </div>

                    {/* Active Filters Info */}
                    {(dateFilter.startDate || dateFilter.endDate) && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-blue-700">
                                    Filter aktif: Tanggal {dateFilter.startDate} - {dateFilter.endDate}
                                </div>
                                <button
                                    onClick={clearDateFilter}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Audit Logs List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Riwayat Perubahan Data
                            </h3>
                            <span className="text-sm text-gray-500">
                                {filteredLogs.length} log ditemukan
                            </span>
                        </div>
                    </div>

                    {/* Logs List */}
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar no-scrollbar">
                        {loading ? (
                            <div className="text-center py-12">
                                <Loader2 className="mx-auto animate-spin mb-3 text-gray-400" size={32} />
                                <p className="text-gray-500">Memuat audit log...</p>
                            </div>
                        ) : filteredLogs.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {filteredLogs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                {/* Action Icon */}
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActionColor(log.action)}`}>
                                                    {getActionIcon(log.action)}
                                                </div>

                                                {/* Log Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                                                            {log.action}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                                            {log.table_name}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            ID: {log.record_id}
                                                        </span>
                                                    </div>

                                                    <p className="text-gray-700 mb-2">
                                                        {log.description || `Data ${log.table_name} di${log.action === 'CREATE' ? 'buat' : log.action === 'UPDATE' ? 'perbarui' : 'hapus'}`}
                                                    </p>

                                                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                                                        <div className="flex items-center gap-1">
                                                            <User size={14} />
                                                            <span>{formatUserDisplay(log)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Shield size={14} />
                                                            <span>{formatRoleDisplay(log)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Building size={14} />
                                                            <span>{formatCabangDisplay(log)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            <span>{formatDate(log.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Detail Button */}
                                            <button
                                                onClick={() => showLogDetails(log)}
                                                className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition-colors ml-4 shrink-0"
                                                title="Lihat detail"
                                            >
                                                <Eye size={18} />
                                                <span className="text-sm font-medium">Detail</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="mx-auto text-gray-400 mb-3" size={48} />
                                <p className="text-gray-500 text-lg mb-2">Tidak ada log ditemukan</p>
                                <p className="text-sm text-gray-400">
                                    {searchTerm || selectedTable !== 'all' || selectedAction !== 'all' || dateFilter.startDate || dateFilter.endDate
                                        ? 'Coba ubah filter pencarian Anda' 
                                        : 'Belum ada perubahan data yang tercatat'
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Load More Button */}
                    {hasMore && !loading && filteredLogs.length > 0 && (
                        <div className="p-6 border-t border-gray-200">
                            <button
                                onClick={() => loadAuditLogs(false)}
                                disabled={loadingMore}
                                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition font-medium"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Memuat lebih banyak...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw size={18} />
                                        Muat Lebih Banyak
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Information Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                            <Database size={16} />
                            Tentang Audit Log
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Mencatat semua perubahan data secara real-time</li>
                            <li>• Menyimpan data sebelum dan sesudah perubahan</li>
                            <li>• Melacak user dan waktu setiap operasi</li>
                            <li>• Data disimpan selama 1 tahun</li>
                        </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                            <Shield size={16} />
                            Keamanan & Compliance
                        </h4>
                        <ul className="text-sm text-green-700 space-y-1">
                            <li>• Hanya Super Admin yang dapat mengakses</li>
                            <li>• Data log tidak dapat diubah atau dihapus</li>
                            <li>• Memenuhi standar audit keamanan data</li>
                            <li>• Backup log dilakukan secara berkala</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default AuditLogPage;