const PointStatsCard = ({ title, icon, value, subtext, trend, trendValue, iconColor = "text-primary" }) => {
    return (
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</p>
                <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
            </div>
            <p className="text-slate-900 tracking-tight text-3xl font-bold leading-tight">{value}</p>

            {trend === 'up' && (
                <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span> {trendValue}
                </p>
            )}

            {trend === 'down' && (
                <p className="text-xs text-red-600 font-medium flex items-center mt-1">
                    <span className="material-symbols-outlined text-sm mr-1">trending_down</span> {trendValue}
                </p>
            )}

            {!trend && subtext && (
                <p className="text-xs text-slate-500 mt-1">{subtext}</p>
            )}
        </div>
    );
};

export default PointStatsCard;
