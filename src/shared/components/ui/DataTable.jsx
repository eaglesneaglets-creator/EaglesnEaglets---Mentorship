import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { SkeletonTable } from './LoadingSkeleton';
import Pagination from './Pagination';

/**
 * DataTable — sortable, paginated, exportable data table
 *
 * columns: [{ key, header, render?, sortable?, width? }]
 * data: array of row objects
 * isLoading: show skeleton while fetching
 * pagination: { page, totalPages, onPageChange } — omit for no pagination
 * onSort: (key, direction) => void — omit for client-side sort
 * actions: (row) => JSX — per-row action cell
 * exportable: show CSV download button
 * emptyMessage: string
 */
const DataTable = ({
  columns,
  data = [],
  isLoading = false,
  pagination,
  onSort,
  actions,
  exportable = false,
  emptyMessage = 'No data found.',
  className = '',
}) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = useCallback(
    (key) => {
      const nextDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
      setSortKey(key);
      setSortDir(nextDir);
      onSort?.(key, nextDir);
    },
    [sortKey, sortDir, onSort]
  );

  // Client-side sort when no onSort provided
  const sortedData = onSort
    ? data
    : [...data].sort((a, b) => {
        if (!sortKey) return 0;
        const aVal = a[sortKey] ?? '';
        const bVal = b[sortKey] ?? '';
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });

  const handleExport = () => {
    const headers = columns.map((c) => c.header).join(',');
    const rows = data
      .map((row) =>
        columns
          .map((c) => {
            const val = row[c.key] ?? '';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Export button */}
      {exportable && data.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-emerald-300 hover:text-emerald-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm bg-white">
        {isLoading ? (
          <SkeletonTable rows={5} cols={columns.length + (actions ? 1 : 0)} />
        ) : sortedData.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">{emptyMessage}</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={`px-4 py-3 font-semibold text-slate-600 whitespace-nowrap ${
                      col.sortable ? 'cursor-pointer select-none hover:text-slate-900' : ''
                    }`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && <SortIcon colKey={col.key} sortKey={sortKey} sortDir={sortDir} />}
                    </span>
                  </th>
                ))}
                {actions && (
                  <th className="px-4 py-3 font-semibold text-slate-600 text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedData.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  className="hover:bg-emerald-50/40 transition-colors duration-100"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-slate-700">
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3.5 text-right">{actions(row)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && !isLoading && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          className="mt-1"
        />
      )}
    </div>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      render: PropTypes.func,
      sortable: PropTypes.bool,
      width: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  pagination: PropTypes.shape({
    page: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
  }),
  onSort: PropTypes.func,
  actions: PropTypes.func,
  exportable: PropTypes.bool,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
};

const SortIcon = ({ colKey, sortKey, sortDir }) => {
  if (sortKey !== colKey)
    return (
      <svg className="w-3.5 h-3.5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  return sortDir === 'asc' ? (
    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
};

SortIcon.propTypes = { colKey: PropTypes.string.isRequired, sortKey: PropTypes.string, sortDir: PropTypes.string };

export default DataTable;
