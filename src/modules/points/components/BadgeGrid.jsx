const BadgeGrid = ({ badges = [], isLoading }) => {
    if (isLoading) {
        return <div className="text-center py-6 text-slate-500">Loading badges...</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-slate-900 text-xl font-bold">Recent Badges Earned</h3>
            {badges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {badges.map((item) => {
                        const badge = item.badge || item;
                        return (
                            <div key={item.id} className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 hover:border-blue-500/50 transition-colors cursor-pointer">
                                <div className="size-16 rounded-full overflow-hidden flex-shrink-0">
                                    {badge.icon ? (
                                        <img src={badge.icon} alt={badge.name} className="w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-2xl text-blue-500">military_tech</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-sm text-slate-900">{badge.name}</p>
                                    <p className="text-xs text-slate-500">{badge.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
                    <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">workspace_premium</span>
                    <p className="text-slate-500">You haven't earned any badges yet. Keep learning!</p>
                </div>
            )}
        </div>
    );
};

export default BadgeGrid;
