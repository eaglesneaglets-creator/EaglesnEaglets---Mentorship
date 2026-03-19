const CommunityHeader = ({ nest, onInviteClick, onSettingsClick, userRole }) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8 relative overflow-hidden group">
            {/* Decorative Background Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
                <div className="relative">
                    <div
                        className="w-32 h-32 bg-center bg-no-repeat bg-cover rounded-xl shadow-md"
                        style={{ backgroundImage: `url("${nest?.banner_image || 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=400&fit=crop'}")` }}
                        aria-label={`${nest?.name} banner`}
                    />
                    {nest?.is_active && (
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-white w-6 h-6 rounded-full" title="Active" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                                {nest?.name || 'Loading Nest...'}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mb-4">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-lg">person_apron</span>
                                    Lead Eagle: <span className="font-medium text-slate-700">
                                        {nest?.eagle_details?.first_name} {nest?.eagle_details?.last_name}
                                    </span>
                                </span>
                                {nest?.industry_focus && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span>{nest.industry_focus}</span>
                                    </>
                                )}
                                {nest?.created_at && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span>Est. {new Date(nest.created_at).getFullYear()}</span>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                    <span className="material-symbols-outlined text-sm mr-1">group</span>
                                    {nest?.member_count || 0} Members
                                </span>
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                    {nest?.privacy === 'public' ? 'Public Nest' : 'Private Nest'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-row gap-3 w-full md:w-auto">
                            <button
                                onClick={onInviteClick}
                                className="flex-1 md:flex-none h-10 px-4 bg-primary hover:bg-blue-900 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                Invite
                            </button>

                            {userRole === 'eagle' && (
                                <button
                                    onClick={onSettingsClick}
                                    className="flex-1 md:flex-none h-10 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">settings</span>
                                    Settings
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityHeader;
