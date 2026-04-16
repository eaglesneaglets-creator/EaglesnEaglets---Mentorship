import PropTypes from 'prop-types';

/**
 * LoadingSkeleton — animated pulse placeholder for loading states
 */
export function LoadingSkeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded-md ${className}`}
      aria-hidden="true"
    />
  );
}

LoadingSkeleton.propTypes = {
  className: PropTypes.string,
};

/**
 * SkeletonText — multiple lines of skeleton text
 */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200 rounded-md h-4 ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

SkeletonText.propTypes = {
  lines: PropTypes.number,
  className: PropTypes.string,
};

/**
 * SkeletonCard — card-shaped loading placeholder
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-100 shadow-sm p-6 ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="animate-pulse bg-slate-200 rounded-full w-10 h-10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="animate-pulse bg-slate-200 rounded h-4 w-1/2" />
          <div className="animate-pulse bg-slate-200 rounded h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

SkeletonCard.propTypes = {
  className: PropTypes.string,
};

/**
 * SkeletonTable — table rows loading placeholder
 */
export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-slate-100">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-200 rounded h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4 px-4 py-4 border-b border-slate-50"
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={colIdx}
              className={`animate-pulse bg-slate-100 rounded h-4 flex-1 ${
                colIdx === 0 ? 'max-w-[120px]' : ''
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

SkeletonTable.propTypes = {
  rows: PropTypes.number,
  cols: PropTypes.number,
  className: PropTypes.string,
};

export default LoadingSkeleton;
