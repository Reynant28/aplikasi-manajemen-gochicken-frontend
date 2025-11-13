import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, FileText, Database, ArrowRight, Clock, Tag, Activity } from 'lucide-react';

const AuditLogDetail = ({ isOpen, onClose, log }) => {
  if (!isOpen || !log) return null;

  const getTypeConfig = (type) => {
    switch (type) {
      case 'created':
        return {
          bg: 'bg-gray-700',
          text: 'text-white',
          label: 'Tambah Data',
          icon: '✓',
          accent: 'from-gray-600 to-gray-700'
        };
      case 'updated':
        return {
          bg: 'bg-gray-700',
          text: 'text-white',
          label: 'Update Data',
          icon: '↻',
          accent: 'from-gray-600 to-gray-700'
        };
      case 'deleted':
        return {
          bg: 'bg-gray-700',
          text: 'text-white',
          label: 'Hapus Data',
          icon: '✕',
          accent: 'from-gray-600 to-gray-700'
        };
      default:
        return {
          bg: 'bg-gray-700',
          text: 'text-white',
          label: type,
          icon: '•',
          accent: 'from-gray-600 to-gray-700'
        };
    }
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

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.1,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-2xl bg-opacity-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Enhanced Header with Gray Gradient */}
            <div className={`bg-gradient-to-r ${typeConfig.accent} text-white px-8 py-6 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-xl font-bold">
                      {typeConfig.icon}
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                        {typeConfig.label}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mt-2">{log.description}</h2>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </div>
            </div>

            {/* Scrollable Content with Hidden Scrollbar */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <motion.div
                className="p-8 space-y-6"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Info Grid */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  variants={itemVariants}
                >
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <User size={16} className="text-gray-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">User</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800">{log.user}</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Calendar size={16} className="text-gray-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tanggal</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{formatDate(log.timestamp)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={14} className="text-gray-400" />
                      <p className="text-sm text-gray-600">{formatTime(log.timestamp)}</p>
                    </div>
                  </div>

                  {log.cabang && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Tag size={16} className="text-gray-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cabang</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800">{log.cabang}</p>
                    </div>
                  )}
                </motion.div>

                {/* Changes Summary */}
                {log.changes && log.changes.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg shadow-sm">
                        <Activity size={20} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Ringkasan Perubahan</h3>
                      <span className="ml-auto px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                        {log.changes.length} perubahan
                      </span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Field</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Sebelum</th>
                              <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-16"></th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Sesudah</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {log.changes.map((change, index) => (
                              <motion.tr
                                key={index}
                                className="hover:bg-gray-50 transition-colors"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300">
                                    {change.field}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-mono text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border-l-4 border-gray-400 shadow-sm">
                                    {String(change.from || '-')}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <ArrowRight size={18} className="text-gray-400 mx-auto" />
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-mono text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border-l-4 border-gray-400 shadow-sm">
                                    {String(change.to || '-')}
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Full Data Comparison */}
                {(oldData.length > 0 || newData.length > 0) && (
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg shadow-sm">
                        <Database size={20} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Data Lengkap</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Before Data */}
                      {oldData.length > 0 && (
                        <motion.div
                          className="bg-white rounded-xl overflow-hidden shadow-md border-2 border-gray-200"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
                            <div className="flex items-center gap-3 text-white">
                              <FileText size={20} />
                              <h4 className="font-bold text-lg">Data Sebelumnya</h4>
                            </div>
                          </div>
                          <div className="max-h-96 overflow-y-auto scrollbar-hide">
                            <table className="w-full">
                              <tbody className="divide-y divide-gray-200">
                                {allFields.map((field, index) => {
                                  const oldItem = oldData.find(item => item.field === field);
                                  return (
                                    <motion.tr
                                      key={index}
                                      className="hover:bg-gray-50 transition-colors"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.3 + index * 0.02 }}
                                    >
                                      <td className="px-6 py-3 w-1/3">
                                        <span className="text-sm font-bold text-gray-700">{field}</span>
                                      </td>
                                      <td className="px-6 py-3">
                                        <div className="font-mono text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                                          {oldItem ? oldItem.value : '-'}
                                        </div>
                                      </td>
                                    </motion.tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}

                      {/* After Data */}
                      {newData.length > 0 && (
                        <motion.div
                          className="bg-white rounded-xl overflow-hidden shadow-md border-2 border-gray-200"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
                            <div className="flex items-center gap-3 text-white">
                              <FileText size={20} />
                              <h4 className="font-bold text-lg">Data Setelahnya</h4>
                            </div>
                          </div>
                          <div className="max-h-96 overflow-y-auto scrollbar-hide">
                            <table className="w-full">
                              <tbody className="divide-y divide-gray-200">
                                {allFields.map((field, index) => {
                                  const newItem = newData.find(item => item.field === field);
                                  return (
                                    <motion.tr
                                      key={index}
                                      className="hover:bg-gray-50 transition-colors"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.4 + index * 0.02 }}
                                    >
                                      <td className="px-6 py-3 w-1/3">
                                        <span className="text-sm font-bold text-gray-700">{field}</span>
                                      </td>
                                      <td className="px-6 py-3">
                                        <div className="font-mono text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                                          {newItem ? newItem.value : '-'}
                                        </div>
                                      </td>
                                    </motion.tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Empty State */}
                {(!log.changes || log.changes.length === 0) && oldData.length === 0 && newData.length === 0 && (
                  <motion.div
                    className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300"
                    variants={itemVariants}
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-md mb-4">
                      <FileText size={40} className="text-gray-300" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-700 mb-2">Tidak Ada Data Perubahan</h4>
                    <p className="text-gray-500">Tidak ada data perubahan yang tersedia untuk log ini.</p>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
              <motion.button
                onClick={onClose}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all font-semibold shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Tutup
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuditLogDetail;