import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Calendar, Filter, AlertCircle } from 'lucide-react';
import Modal from "../ui/Modal.jsx";

const AuditLogFilter = ({ isOpen, onClose, filters, filterOptions, onFilterChange, onReset }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset error when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const getTypeText = (type) => {
    switch (type) {
      case 'created': return 'Tambah';
      case 'updated': return 'Update';
      case 'deleted': return 'Hapus';
      default: return type;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
  };

  // Safe array access for filter options
  const safeArray = (array) => Array.isArray(array) ? array : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Filter size={20} />
            Filter Audit Log
          </h2>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipe Aktivitas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Aktivitas
              </label>
              <select
                value={filters.type}
                onChange={(e) => onFilterChange('type', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
              >
                <option value="all">Semua Tipe</option>
                {safeArray(filterOptions.types).map(type => (
                  <option key={type} value={type}>
                    {getTypeText(type)}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <select
                value={filters.model}
                onChange={(e) => onFilterChange('model', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
              >
                <option value="all">Semua Model</option>
                {safeArray(filterOptions.models).map(model => (
                  <option key={model} value={model}>
                    {model.replace('Model', '')}
                  </option>
                ))}
              </select>
            </div>

            {/* User */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User
              </label>
              <select
                value={filters.user_id}
                onChange={(e) => onFilterChange('user_id', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
              >
                <option value="all">Semua User</option>
                {safeArray(filterOptions.users).map(user => (
                  <option key={user.id_user} value={user.id}>
                    {user.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Pencarian */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pencarian
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => onFilterChange('search', e.target.value)}
                  placeholder="Cari dalam deskripsi..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            {/* Tanggal Mulai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => onFilterChange('start_date', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            {/* Tanggal Akhir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Akhir
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => onFilterChange('end_date', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onReset}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Reset Filter
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default AuditLogFilter;