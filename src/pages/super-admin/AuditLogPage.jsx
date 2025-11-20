
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Filter, RefreshCw, Activity, Clock, FileText } from 'lucide-react';
import axios from 'axios';

import AuditLogTable from '../../components/audit-log/AuditLogTable';
import AuditLogFilter from '../../components/audit-log/AuditLogFilter';
import AuditLogDetail from '../../components/audit-log/AuditLogDetail';
import { SuccessPopup } from "../../components/ui";

const API_URL = "http://localhost:8000/api";

const AuditLogPage = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    model: 'all',
    user_id: 'all',
    start_date: '',
    end_date: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });
  const [filterOptions, setFilterOptions] = useState({
    types: [],
    models: [],
    users: [],
    date_range: {}
  });
  
  const [selectedLog, setSelectedLog] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.role === 'super admin') {
      fetchAuditLogs();
      fetchFilterOptions();
    }
  }, [pagination.current_page, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...filters
      });

      const response = await axios.get(`${API_URL}/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setAuditLogs(response.data.data);
        setPagination(response.data.meta);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setSuccessMessage("Gagal memuat data audit log");
      setShowSuccess(true);
    } finally {
      setLoading(false);
      setError(true);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(`${API_URL}/audit-logs/filters`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setFilterOptions(response.data.data);
      } else {
        console.error('Failed to fetch filter options:', response.data.message);
        setSuccessMessage("Gagal memuat opsi filter");
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
      setSuccessMessage("Terjadi kesalahan saat memuat opsi filter");
      setShowSuccess(true);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (value) => {
    setPagination(prev => ({ ...prev, current_page: value }));
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetail(true);
  };

  const resetFilters = () => {
    setFilters({
      type: 'all',
      model: 'all',
      user_id: 'all',
      start_date: '',
      end_date: '',
      search: ''
    });
    setSuccessMessage("Filter berhasil direset");
    setShowSuccess(true);
  };

  const closeSuccessPopup = () => setShowSuccess(false);

  // Calculate stats
  const totalLogs = pagination.total;
  const todayLogs = auditLogs.filter(log => {
    const today = new Date().toDateString();
    const logDate = new Date(log.timestamp).toDateString();
    return today === logDate;
  }).length;

  if (user?.role !== 'super admin') {
    return (
      <div className="p-6 space-y-6">
        <motion.div 
          className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-md border border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <History size={64} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
          <p className="text-gray-500">Hanya Super Admin yang dapat mengakses halaman ini.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800">Audit Log</h1>
          <p className="text-gray-500 mt-1">Riwayat aktivitas dan perubahan data sistem</p>
        </motion.div>
        
        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium shadow-sm"
          >
            <Filter size={18} />
            Filter
          </button>
          
          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-all font-medium shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Log</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalLogs.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <FileText className="text-gray-700" size={24} />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Log Hari Ini</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{todayLogs}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <Clock className="text-gray-700" size={24} />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Halaman</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {pagination.current_page} / {pagination.last_page}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <Activity className="text-gray-700" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Table Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AuditLogTable
          data={auditLogs}
          loading={loading}
          Error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewDetails={handleViewDetails}
        />
      </motion.div>

      {/* Filter Modal */}
      <AuditLogFilter
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />

      {/* Detail Modal */}
      <AuditLogDetail
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        log={selectedLog}
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

export default AuditLogPage;