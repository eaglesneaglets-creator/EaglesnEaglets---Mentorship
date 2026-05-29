/**
 * AutosaveIndicator — small status pill shown next to a form title.
 * Renders one of: Saving… / Saved Ns ago / Save failed.
 *
 * Pair with useAutosave hook:
 *   const auto = useAutosave(watchedValues, persistDraft);
 *   <AutosaveIndicator {...auto} />
 */

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function formatAgo(timestamp) {
  if (!timestamp) return null;
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function AutosaveIndicator({
  isSaving,
  isSaved,
  hasError,
  lastSavedAt,
  errorMessage,
  className = '',
}) {
  // Re-render once a second so "Saved Ns ago" stays current.
  const [, tick] = useState(0);
  useEffect(() => {
    if (!isSaved || !lastSavedAt) return;
    const id = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [isSaved, lastSavedAt]);

  if (isSaving) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 ${className}`}>
        <span className="w-3 h-3 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
        Saving…
      </span>
    );
  }
  if (hasError) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 ${className}`}
        title={errorMessage || 'Could not save your changes.'}
      >
        <span className="material-symbols-outlined text-base">error</span>
        Save failed
      </span>
    );
  }
  if (isSaved && lastSavedAt) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 ${className}`}>
        <span className="material-symbols-outlined text-base">cloud_done</span>
        Saved {formatAgo(lastSavedAt)}
      </span>
    );
  }
  return null;
}

AutosaveIndicator.propTypes = {
  isSaving: PropTypes.bool,
  isSaved: PropTypes.bool,
  hasError: PropTypes.bool,
  lastSavedAt: PropTypes.number,
  errorMessage: PropTypes.string,
  className: PropTypes.string,
};
