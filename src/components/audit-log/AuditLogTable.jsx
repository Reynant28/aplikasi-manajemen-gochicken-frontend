import React from "react";
import DataTable from "../ui/DataTable.jsx";
import { Eye, Calendar, User, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

const getTypeColor = (type) => {
  switch (type) {
    case "created": return "bg-green-100 text-green-700 border-green-200";
    case "updated": return "bg-blue-100 text-blue-700 border-blue-200";
    case "deleted": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getTypeText = (type) => {
  switch (type) {
    case "created": return "Tambah";
    case "updated": return "Update";
    case "deleted": return "Hapus";
    default: return type;
  }
};

const AuditLogTable = ({ data, loading, onViewDetails }) => {
  const columns = [
    {
      key: "time",
      header: "Waktu",
      render: (log) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">
              {format(parseISO(log.timestamp), "dd MMM yyyy", { locale: id })}
            </div>
            <div className="text-xs text-gray-500">
              {format(parseISO(log.timestamp), "HH:mm", { locale: id })} WIB
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipe",
      render: (log) => (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getTypeColor(log.type)}`}>
          {getTypeText(log.type)}
        </span>
      ),
    },
    {
      key: "model",
      header: "Model",
      render: (log) => (
        <span className="px-3 py-1 text-xs rounded-full border bg-gray-100 text-gray-700">
          {log.model.replace("Model", "")}
        </span>
      ),
    },
    {
      key: "desc",
      header: "Deskripsi",
      render: (log) => (
        <p className="text-sm text-gray-700 line-clamp-2">{log.description}</p>
      ),
    },
    {
      key: "user",
      header: "User",
      render: (log) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{log.user}</span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      align: "center",
      render: (log) => (
        <button
          onClick={() => onViewDetails(log)}
          disabled={!log.old_data && !log.new_data}
          className="px-3 py-2 text-xs rounded-lg bg-gray-600 text-white disabled:bg-gray-200"
        >
          <Eye size={14} /> Detail
        </button>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      emptyMessage="Tidak ada audit log"
      emptyDescription="Belum ada aktivitas tercatat"
      rowKey={(row) => row.id}
    />
  );
};

export default AuditLogTable;