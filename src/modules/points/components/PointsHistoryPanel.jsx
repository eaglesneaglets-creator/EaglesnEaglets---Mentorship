import { useState } from 'react';
import { useTransactions } from '../hooks/usePoints';

const PAGE_SIZE = 10;

const sourceLabel = (source) => {
    const labels = {
        manual: { text: 'Manual', bg: 'bg-emerald-50', color: 'text-emerald-700' },
        event: { text: 'Event', bg: 'bg-blue-50', color: 'text-blue-700' },
        assignment: { text: 'Assignment', bg: 'bg-purple-50', color: 'text-purple-700' },
        badge: { text: 'Badge', bg: 'bg-amber-50', color: 'text-amber-700' },
    };
    return labels[source] || { text: source || 'Auto', bg: 'bg-slate-50', color: 'text-slate-600' };
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const PointsHistoryPanel = () => {
    const [page, setPage] = useState(1);

    const { data, isLoading, isFetching } = useTransactions({ page, page_size: PAGE_SIZE });

    const transactions = data?.data?.results || data?.data || [];
    const totalCount = data?.data?.count ?? transactions.length;
    const hasMore = page * PAGE_SIZE < totalCount;

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3 animate-pulse">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100" />
                        <div className="flex-1 h-4 bg-slate-100 rounded" />
                        <div className="w-16 h-4 bg-slate-100 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600 text-lg">history</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Points History</h3>
            </div>

            {transactions.length === 0 ? (
                <div className="py-12 text-center">
                    <span className="material-symbols-outlined text-3xl text-slate-300">receipt_long</span>
                    <p className="text-sm text-slate-400 mt-2">No transactions yet. Start earning points!</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px]">
                            <thead>
                                <tr className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                                    <th className="py-3 px-5 text-left">Date</th>
                                    <th className="py-3 px-5 text-left">Description</th>
                                    <th className="py-3 px-5 text-left">Source</th>
                                    <th className="py-3 px-5 text-left">Awarded By</th>
                                    <th className="py-3 px-5 text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.map((tx) => {
                                    const src = sourceLabel(tx.source);
                                    const awardedBy = tx.awarded_by_name || tx.awarded_by?.full_name || null;
                                    return (
                                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 px-5 text-sm text-slate-500 whitespace-nowrap">
                                                {formatDate(tx.created_at)}
                                            </td>
                                            <td className="py-3.5 px-5 text-sm text-slate-900 max-w-[220px]">
                                                <p className="truncate">{tx.description || '—'}</p>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${src.bg} ${src.color}`}>
                                                    {src.text}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5 text-sm text-slate-500">
                                                {awardedBy || <span className="text-slate-300">—</span>}
                                            </td>
                                            <td className="py-3.5 px-5 text-right">
                                                <span className="text-sm font-bold text-emerald-600">
                                                    +{tx.points}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {hasMore && (
                        <div className="p-4 text-center border-t border-slate-100">
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={isFetching}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors disabled:opacity-50"
                            >
                                {isFetching ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">expand_more</span>
                                        Load More
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PointsHistoryPanel;
