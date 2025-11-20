import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, FileText, Database, ArrowRight, Clock, Tag, Activity } from 'lucide-react';

const AuditLogDetail = ({ isOpen, onClose, log }) => {
  if (!isOpen || !log) return null;

  const getTypeConfig = (type) => {
    const configs = {
      created: {
        bg: 'bg-gray-600',
        label: 'Tambah Data',
        icon: '✓'
      },
      updated: {
        bg: 'bg-gray-600',
        label: 'Update Data',
        icon: '↻'
      },
      deleted: {
        bg: 'bg-red-600',
        label: 'Hapus Data',
        icon: '✕'
      }
    };
    return configs[type] || { bg: 'bg-gray-500', label: type, icon: '•' };
  };

  const objectToTableData = (obj) => {
    if (!obj || typeof obj !== 'object') return [];
    return Object.entries(obj).map(([key, value]) => ({
      field: key,
      value: value !== null && value !== undefined ? String(value) : '-'
    }));
  };

  const oldData = objectToTableData(log.old_data);
  const newData = objectToTableData(log.new_data);

  const allFields = [...new Set([
    ...oldData.map(item => item.field),
    ...newData.map(item => item.field)
  ])];

  const typeConfig = getTypeConfig(log.type);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className={`${typeConfig.bg} text-white px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-500 bg-opacity-20 rounded-lg flex items-center justify-center text-sm font-bold">
                  {typeConfig.icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{log.description}</h2>
                  <p className="text-sm opacity-90">{typeConfig.label}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-400 hover:bg-opacity-20 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} className="text-gray-600" />
                      <span className="text-xs font-medium text-gray-600">User</span>
                    </div>
                    <p className="font-semibold text-gray-800">{log.user}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-gray-600" />
                      <span className="text-xs font-medium text-gray-600">Tanggal & Waktu</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">{formatDate(log.timestamp)}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {formatTime(log.timestamp)}
                    </p>
                  </div>

                  {log.cabang && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag size={16} className="text-gray-600" />
                        <span className="text-xs font-medium text-gray-600">Cabang</span>
                      </div>
                      <p className="font-semibold text-gray-800">{log.cabang}</p>
                    </div>
                  )}
                </div>

                {/* Changes Summary */}
                {log.changes && log.changes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Activity size={18} className="text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-800">Ringkasan Perubahan</h3>
                      <span className="ml-auto px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                        {log.changes.length} perubahan
                      </span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Field</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sebelum</th>
                              <th className="px-2 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-8"></th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sesudah</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {log.changes.map((change, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium border">
                                    {change.field}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-mono text-xs text-gray-700 bg-white px-3 py-2 rounded border">
                                    {String(change.from || '-')}
                                  </div>
                                </td>
                                <td className="px-2 py-3 text-center">
                                  <ArrowRight size={14} className="text-gray-400 mx-auto" />
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-mono text-xs text-gray-700 bg-white px-3 py-2 rounded border">
                                    {String(change.to || '-')}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Data Comparison */}
                {(oldData.length > 0 || newData.length > 0) && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Database size={18} className="text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-800">Data Lengkap</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Before Data */}
                      {oldData.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center gap-2 text-gray-700">
                              <FileText size={16} />
                              <h4 className="font-semibold text-sm">Data Sebelumnya</h4>
                            </div>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                              <tbody className="divide-y divide-gray-200">
                                {allFields.map((field, index) => {
                                  const oldItem = oldData.find(item => item.field === field);
                                  return (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 w-1/3">
                                        <span className="text-xs font-medium text-gray-700">{field}</span>
                                      </td>
                                      <td className="px-4 py-2">
                                        <div className="font-mono text-xs text-gray-700 bg-white px-2 py-1 rounded border">
                                          {oldItem ? oldItem.value : '-'}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* After Data */}
                      {newData.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center gap-2 text-gray-700">
                              <FileText size={16} />
                              <h4 className="font-semibold text-sm">Data Setelahnya</h4>
                            </div>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                              <tbody className="divide-y divide-gray-200">
                                {allFields.map((field, index) => {
                                  const newItem = newData.find(item => item.field === field);
                                  return (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 w-1/3">
                                        <span className="text-xs font-medium text-gray-700">{field}</span>
                                      </td>
                                      <td className="px-4 py-2">
                                        <div className="font-mono text-xs text-gray-700 bg-white px-2 py-1 rounded border">
                                          {newItem ? newItem.value : '-'}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {(!log.changes || log.changes.length === 0) && oldData.length === 0 && newData.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <FileText size={32} className="text-gray-400 mx-auto mb-2" />
                    <h4 className="text-base font-semibold text-gray-700 mb-1">Tidak Ada Data Perubahan</h4>
                    <p className="text-sm text-gray-500">Tidak ada data perubahan yang tersedia untuk log ini.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuditLogDetail;