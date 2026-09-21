import PropTypes from 'prop-types';

/**
 * LoadError — the "couldn't load this, try again" state for a data region.
 *
 * Replaces four hand-copied blocks (admin Orders/Store tables, Admin/Eagle
 * dashboards). Two looks exist because the contexts differ, not by accident:
 *   - `panel`: sits inside a card or table shell, so it is loud (red) — the
 *     rest of the page rendered fine and this one region needs attention.
 *   - `page`:  the whole view failed, so it is quiet and centred.
 *
 * Always pass a query `refetch` as `onRetry`. The dashboards used to call
 * `window.location.reload()`, which throws away every other cached query and
 * the user's scroll/filter state just to retry one request.
 */
const LoadError = ({ title, detail, onRetry, retryLabel = 'Retry', variant = 'panel' }) => {
    if (variant === 'page') {
        return (
            <div className="flex h-64 items-center justify-center" role="alert">
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300" aria-hidden="true">cloud_off</span>
                    <p className="text-slate-500 font-medium">{title}</p>
                    {onRetry && (
                        <button type="button" onClick={onRetry} className="text-sm text-primary hover:underline">
                            {retryLabel}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p-12 text-center" role="alert">
            <span className="material-symbols-outlined text-4xl text-red-300" aria-hidden="true">cloud_off</span>
            <p className="text-red-500 font-medium mt-2">{title}</p>
            {detail && <p className="text-slate-400 text-sm mt-1">{detail}</p>}
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                    {retryLabel}
                </button>
            )}
        </div>
    );
};

LoadError.propTypes = {
    title: PropTypes.string.isRequired,
    /** Usually `error.message`. Panel variant only. */
    detail: PropTypes.string,
    /** Pass the query's `refetch`. Omit to render no retry control. */
    onRetry: PropTypes.func,
    retryLabel: PropTypes.string,
    variant: PropTypes.oneOf(['panel', 'page']),
};

export default LoadError;
