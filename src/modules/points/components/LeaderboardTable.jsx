import { useAuthStore } from '@store';

const LeaderboardTable = ({ leaderboardData = [], isLoading }) => {
    const { user } = useAuthStore();

    if (isLoading) {
        return <div className="text-center py-6 text-slate-500">Loading leaderboard...</div>;
    }

    const entries = leaderboardData?.results || [];

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                            <th className="p-4 w-16 text-center">Rank</th>
                            <th className="p-4">User</th>
                            <th className="p-4 text-right">Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {entries.map((entry, index) => {
                            const isCurrentUser = entry.user.id === user?.id;
                            const rank = index + 1; // Assuming data is ordered

                            let rankDisplay = <span className="font-medium text-slate-500">{rank}</span>;
                            let rowClass = "group hover:bg-slate-50 transition-colors";

                            if (rank === 1) {
                                rankDisplay = <span className="material-symbols-outlined text-yellow-500 text-2xl" title="Rank 1">emoji_events</span>;
                                rowClass += " bg-yellow-500/5";
                            } else if (rank === 2) {
                                rankDisplay = <span className="font-bold text-slate-400 text-lg">2</span>;
                            } else if (rank === 3) {
                                rankDisplay = <span className="font-bold text-amber-700/60 text-lg">3</span>;
                            }

                            if (isCurrentUser) {
                                rowClass = "bg-primary/5 border-l-4 border-l-primary";
                                rankDisplay = <span className="font-bold text-primary">{rank}</span>;
                            }

                            return (
                                <tr key={entry.user.id} className={rowClass}>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center">
                                            {rankDisplay}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                                                {entry.user.first_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">
                                                    {isCurrentUser ? 'You' : `${entry.user.first_name} ${entry.user.last_name}`}
                                                </p>
                                                <p className="text-xs text-slate-500 capitalize">
                                                    {entry.user.role}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`p-4 text-right font-bold text-base ${isCurrentUser ? 'text-primary' : 'text-slate-900'}`}>
                                        {entry.total_points}
                                    </td>
                                </tr>
                            );
                        })}

                        {entries.length === 0 && (
                            <tr>
                                <td colSpan="3" className="p-8 text-center text-slate-500">No leaderboard data available yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaderboardTable;
