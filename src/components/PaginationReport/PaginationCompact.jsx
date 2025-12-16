// src/components/PaginationCompact.jsx
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const PaginationCompact = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = "" 
}) => {
  if (totalPages <= 1) return null;

  const getMobilePages = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage === 1) {
      return [1, 2, '...', totalPages];
    }

    if (currentPage === totalPages) {
      return [1, '...', totalPages - 1, totalPages];
    }

    return [1, '...', currentPage, '...', totalPages];
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getMobilePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="p-2 text-gray-500">
                <MoreHorizontal size={16} />
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default PaginationCompact;