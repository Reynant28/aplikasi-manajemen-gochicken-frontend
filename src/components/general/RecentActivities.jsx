import React from "react";
import { motion } from "framer-motion";
import { History, RefreshCw, FileText, Clock, Activity, Plus, Pencil, Trash } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

const getActivityIcon = (activity) => {
  const type = activity.type || activity.action || activity.activity_type || '';
  
  switch (type.toLowerCase()) {
    case 'created':
      return { emoji: <Plus />, color: 'bg-green-50 text-green-800' };
    case 'updated':
      return { emoji: <Pencil />, color: 'bg-blue-50 text-blue-800' };
    case 'deleted':
      return { emoji: <Trash />, color: 'bg-red-50 text-rose-700' };
    case 'expense':
      return { emoji: '💰', color: 'bg-orange-100 text-orange-600' };
    default:
      return { emoji: '⚪', color: 'bg-gray-100 text-gray-600' };
  }
};

const RecentActivities = ({ loading, error, data, onRefresh }) => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-md border border-gray-100 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <History className="text-gray-700" />
            Aktivitas Terbaru
          </h2>
          <p className="text-gray-500 mt-1">Riwayat aktivitas dan perubahan data sistem</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-all font-medium shadow-sm disabled:bg-gray-400"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gray-100 to-gray-300 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Aktivitas</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{data.length}</p>
            </div>
            <div className="p-2 bg-white rounded-lg">
              <FileText className="text-gray-700" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-100 to-gray-300 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hari Ini</p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {data.filter(activity => {
                  const today = new Date().toDateString();
                  const activityDate = new Date(activity.timestamp).toDateString();
                  return today === activityDate;
                }).length}
              </p>
            </div>
            <div className="p-2 bg-white rounded-lg">
              <Clock className="text-gray-700" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-100 to-gray-300 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktivitas</p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {new Set(data.map(activity => activity.type)).size} jenis
              </p>
            </div>
            <div className="p-2 bg-white rounded-lg">
              <Activity className="text-gray-700" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      {loading ? (
        <div className="flex justify-center items-center h-32 text-gray-500">
          Memuat aktivitas...
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-32 text-red-500">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="flex justify-center items-center h-32 text-gray-500">
          Tidak ada aktivitas terbaru.
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {data.map((activity, index) => (
            <div
              key={`${activity.timestamp}-${index}`}
              className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200"
            >
              {(() => {
                const { emoji, color } = getActivityIcon(activity);
                return (
                  <div className={`p-2 rounded-lg ${color}`}>
                    {emoji}
                  </div>
                );
              })()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 break-words">
                  {activity.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {format(parseISO(activity.timestamp), 'dd MMM yyyy, HH:mm', { locale: id })}
                  </span>
                  {activity.user && (
                    <span>Oleh: {activity.user}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default RecentActivities;