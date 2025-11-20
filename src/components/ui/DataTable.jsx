import React from "react";
import { LoaderCircle } from "lucide-react";

const DataTable = ({ 
  data, 
  columns, 
  loading = false,
  emptyMessage = "Tidak ada data",
  emptyDescription = "Belum ada data untuk ditampilkan",
  onRowAction,
  actionLabel = "Aksi",
  showActions = false
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-md border border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center h-64 text-gray-500">
            <LoaderCircle className="animate-spin h-6 w-6 mr-3" /> 
            Memuat...
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-md border border-gray-100">
        <div className="text-center text-gray-400">
          <p className="text-lg font-medium">{emptyMessage}</p>
          <p className="text-sm mt-1">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={`px-6 py-4 text-sm font-semibold text-gray-700 ${
                    column.align === 'right' ? 'text-right' : 
                    column.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  {actionLabel}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, index) => (
              <tr 
                key={item.id || index} 
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((column) => (
                  <td 
                    key={column.key}
                    className={`px-6 py-4 text-sm ${
                      column.align === 'right' ? 'text-right' : 
                      column.align === 'center' ? 'text-center' : 'text-left'
                    } ${
                      column.bold ? 'font-medium text-gray-800' : 'text-gray-600'
                    }`}
                  >
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
                {showActions && onRowAction && (
                  <td className="px-6 py-4 text-center">
                    {onRowAction(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;