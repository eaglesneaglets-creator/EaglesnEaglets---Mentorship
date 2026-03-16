/**
 * EagletNestPage — My Nests + Mentor Discovery
 *
 * Two sections:
 *   1. My Nests  — all nests the eaglet has already joined (direct navigation)
 *   2. Discover  — all other active nests available to join
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useMyNests, useNests } from '../../modules/nest/hooks/useNests';
import AvatarGroup from '../../shared/components/ui/AvatarGroup';
import EmptyState from '../../shared/components/ui/EmptyState';

const PLACEHOLDER_AVATARS = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
];

// ---------------------------------------------------------------------------
// Joined Nest Card — navigates straight to the community hub
// ---------------------------------------------------------------------------
const JoinedNestCard = ({ nest, index }) => {
    const mentorName = nest.eagle_name || 'Your Mentor';
    const initials = mentorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const focusArea = nest.industry_focus || nest.focus_area || 'General Mentorship';
    const memberCount = nest.member_count || nest.members_count || 0;

    return (
        <div
            className="group relative bg-white rounded-2xl border border-emerald-200/60 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* Accent bar — green to indicate membership */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                        {nest.banner_image ? (
                            <img
                                src={nest.banner_image}
                                alt={nest.name}
                                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-100 transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-emerald-100 transition-transform duration-500 group-hover:scale-105">
                                {initials}
                            </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-[2.5px] border-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors duration-300 truncate">
                                {nest.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100 whitespace-nowrap">
                                <span className="material-symbols-outlined text-xs">verified</span>
                                Member
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 truncate">Mentor: {mentorName}</p>
                    </div>
                </div>

                {/* Focus area */}
                <div className="mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100/80">
                        <span className="material-symbols-outlined text-sm">category</span>
                        {focusArea}
                    </span>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-5 min-h-[40px]">
                    {nest.description || "Access your mentor's resources, assignments, and connect with your community."}
                </p>

                {/* Bottom row */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="material-symbols-outlined text-sm text-slate-400">group</span>
                        <span className="font-medium">{memberCount} members</span>
                    </div>

                    <Link
                        to={`/eaglet/nest/${nest.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-500/20 transition-all duration-300 active:scale-95"
                    >
                        Go to Nest
                        <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-0.5">
                            arrow_forward
                        </span>
                    </Link>
                </div>
            </div>

            {/* Hover glow */}
            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-emerald-500/0 rounded-full blur-3xl group-hover:bg-emerald-500/5 transition-colors duration-700 pointer-events-none" />
        </div>
    );
};

// ---------------------------------------------------------------------------
// Discover Card — for nests not yet joined
// ---------------------------------------------------------------------------
const MentorCard = ({ nest, index }) => {
    const mentor = nest.mentor_details || nest.mentor || {};
    const mentorName = nest.eagle_name ||
        (mentor.first_name ? `${mentor.first_name} ${mentor.last_name || ''}` : nest.name || 'Mentor');
    const initials = mentorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const focusArea = nest.industry_focus || nest.focus_area || 'General Mentorship';
    const memberCount = nest.member_count || nest.members_count || 0;
    const maxMembers = nest.max_members || 20;

    const previewMembers = Array.from({ length: Math.min(memberCount, 3) }, (_, i) => ({
        id: i,
        avatar: PLACEHOLDER_AVATARS[i % PLACEHOLDER_AVATARS.length],
    }));

    return (
        <div
            className="group relative bg-white rounded-2xl border border-slate-200/60 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <div className="h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-teal-400 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="p-6">
                <div className="flex items-start gap-4 mb-5">
                    <div className="relative flex-shrink-0">
                        {mentor.profile_picture ? (
                            <img
                                src={mentor.profile_picture}
                                alt={mentorName}
                                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-slate-100 transition-transform duration-500 group-hover:scale-105">
                                {initials}
                            </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-[2.5px] border-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-primary transition-colors duration-300 truncate">
                            {mentorName}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">{nest.name}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary text-xs font-semibold rounded-lg border border-primary/10">
                        <span className="material-symbols-outlined text-sm">category</span>
                        {focusArea}
                    </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-5 min-h-[40px]">
                    {nest.description || 'Join this nest to access mentoring resources, assignments, and connect with a supportive community.'}
                </p>

                <div className="flex items-center gap-4 mb-5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-slate-400">group</span>
                        <span className="font-medium">{memberCount}/{maxMembers}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-slate-400">library_books</span>
                        <span className="font-medium">{nest.content_count || 0} resources</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        {previewMembers.length > 0 && (
                            <AvatarGroup users={previewMembers} max={3} size="sm" />
                        )}
                        {memberCount > 3 && (
                            <span className="text-[11px] text-slate-400 font-medium">
                                +{memberCount - 3} more
                            </span>
                        )}
                    </div>

                    <Link
                        to={`/eaglet/mentor/${nest.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-primary-dark hover:shadow-md hover:shadow-primary/20 transition-all duration-300 active:scale-95"
                    >
                        View Profile
                        <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-0.5">
                            arrow_forward
                        </span>
                    </Link>
                </div>
            </div>

            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-primary/0 rounded-full blur-3xl group-hover:bg-primary/5 transition-colors duration-700 pointer-events-none" />
        </div>
    );
};

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
        <div className="h-1.5 bg-slate-100" />
        <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded-lg w-3/4 animate-pulse" />
                    <div className="h-3 bg-slate-50 rounded-lg w-1/2 animate-pulse" />
                </div>
            </div>
            <div className="h-6 bg-slate-50 rounded-lg w-1/3 animate-pulse" />
            <div className="space-y-1.5">
                <div className="h-3 bg-slate-50 rounded w-full animate-pulse" />
                <div className="h-3 bg-slate-50 rounded w-4/5 animate-pulse" />
            </div>
            <div className="flex justify-between pt-4 border-t border-slate-100">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => <div key={i} className="w-7 h-7 rounded-full bg-slate-100 animate-pulse ring-2 ring-white" />)}
                </div>
                <div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse" />
            </div>
        </div>
    </div>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const EagletNestPage = () => {
    const { data: myResponse, isLoading: myLoading } = useMyNests();
    const myNests = useMemo(() => myResponse?.data || myResponse?.results || [], [myResponse]);

    const { data: allResponse, isLoading: allLoading, isError } = useNests();
    const allNests = useMemo(() => allResponse?.data || allResponse?.results || [], [allResponse]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFocus, setSelectedFocus] = useState('All');
    const [viewMode, setViewMode] = useState('grid');

    // Set of nest IDs already joined — used to exclude from Discover section
    const joinedNestIds = useMemo(
        () => new Set(myNests.map(n => String(n.id))),
        [myNests]
    );

    // Focus area pills (only from nests not yet joined)
    const focusAreas = useMemo(() => {
        const areas = new Set(
            allNests
                .filter(n => !joinedNestIds.has(String(n.id)))
                .map(n => n.industry_focus || n.focus_area)
                .filter(Boolean)
        );
        return ['All', ...Array.from(areas)];
    }, [allNests, joinedNestIds]);

    // Discover nests: not joined + search/filter applied
    const filteredNests = useMemo(() => {
        return allNests.filter(nest => {
            if (joinedNestIds.has(String(nest.id))) return false;
            const mentorName = nest.eagle_name || '';
            const matchesSearch =
                nest.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                nest.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                mentorName.toLowerCase().includes(searchQuery.toLowerCase());
            const focus = nest.industry_focus || nest.focus_area || '';
            const matchesFocus = selectedFocus === 'All' || focus === selectedFocus;
            return matchesSearch && matchesFocus;
        });
    }, [allNests, joinedNestIds, searchQuery, selectedFocus]);

    if (myLoading) {
        return (
            <DashboardLayout variant="eaglet">
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg mb-6 animate-pulse">
                        <span className="material-symbols-outlined text-3xl text-white">diversity_1</span>
                    </div>
                    <p className="text-slate-500 text-lg">Loading your Nests...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout variant="eaglet">
            <div className="flex flex-col gap-10 min-h-[calc(100vh-120px)]">

                {/* ── Section 1: My Nests ────────────────────────────────── */}
                {myNests.length > 0 && (
                    <section className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Nests</h2>
                                <p className="text-slate-500 text-sm mt-0.5">
                                    {myNests.length === 1
                                        ? 'You are a member of 1 Nest'
                                        : `You are a member of ${myNests.length} Nests`}
                                </p>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                Active Member
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myNests.map((nest, i) => (
                                <JoinedNestCard key={nest.id} nest={nest} index={i} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Divider when both sections visible */}
                {myNests.length > 0 && (
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                            Discover More Mentors
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>
                )}

                {/* ── Section 2: Discover ───────────────────────────────── */}
                <section className="flex flex-col gap-6">
                    {/* Hero header */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8 md:p-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="max-w-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-primary text-2xl">explore</span>
                                    <span className="text-xs font-semibold text-primary tracking-wider uppercase">
                                        {myNests.length > 0 ? 'Explore More' : 'Discover Mentors'}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
                                    {myNests.length > 0 ? 'Find More Mentors' : 'Find Your Mentor'}
                                </h1>
                                <p className="text-slate-300 text-base leading-relaxed">
                                    {myNests.length > 0
                                        ? 'Expand your network by joining additional Nests and learning from more Eagles.'
                                        : 'Browse experienced mentors, explore their expertise, and request to join a Nest that aligns with your growth goals.'}
                                </p>
                            </div>

                            <div className="flex gap-6">
                                <div className="text-center">
                                    <p className="text-2xl font-extrabold text-white">{filteredNests.length}</p>
                                    <p className="text-xs text-slate-400 font-medium">Available Nests</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-extrabold text-white">
                                        {allNests
                                            .filter(n => !joinedNestIds.has(String(n.id)))
                                            .reduce((sum, n) => sum + (n.member_count || n.members_count || 0), 0)}
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium">Eaglets</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search + filters */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                            <input
                                type="text"
                                placeholder="Search by mentor name or topic..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            )}
                        </div>

                        <div className="flex-1 flex flex-wrap gap-2">
                            {focusAreas.map(area => (
                                <button
                                    key={area}
                                    onClick={() => setSelectedFocus(area)}
                                    className={`
                                        px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300
                                        ${selectedFocus === area
                                            ? 'bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]'
                                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60 hover:border-primary/30 hover:text-primary'
                                        }
                                    `}
                                >
                                    {area}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 self-start">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <span className="material-symbols-outlined text-lg">grid_view</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <span className="material-symbols-outlined text-lg">view_list</span>
                            </button>
                        </div>
                    </div>

                    {/* Results count */}
                    {!allLoading && (
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-semibold text-slate-700">{filteredNests.length}</span> mentor{filteredNests.length !== 1 ? 's' : ''}
                            {selectedFocus !== 'All' && <span> in <span className="text-primary font-medium">{selectedFocus}</span></span>}
                        </p>
                    )}

                    {/* Mentor grid */}
                    {allLoading ? (
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-3xl'}`}>
                            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                        </div>
                    ) : isError ? (
                        <EmptyState
                            icon="cloud_off"
                            title="Unable to Load Mentors"
                            description="Something went wrong while loading the mentor directory. Please try again later."
                        />
                    ) : filteredNests.length === 0 ? (
                        <EmptyState
                            icon={searchQuery || selectedFocus !== 'All' ? 'search_off' : 'diversity_3'}
                            title={searchQuery || selectedFocus !== 'All' ? 'No Mentors Found' : "You've Joined All Available Nests!"}
                            description={
                                searchQuery || selectedFocus !== 'All'
                                    ? 'Try adjusting your search or filters to find more mentors.'
                                    : 'There are no other active Nests to join right now. Check back later!'
                            }
                            actionLabel={searchQuery || selectedFocus !== 'All' ? 'Clear Filters' : undefined}
                            onAction={searchQuery || selectedFocus !== 'All' ? () => { setSearchQuery(''); setSelectedFocus('All'); } : undefined}
                            actionIcon="filter_list_off"
                        />
                    ) : (
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-3xl'}`}>
                            {filteredNests.map((nest, i) => (
                                <MentorCard key={nest.id} nest={nest} index={i} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
};

export default EagletNestPage;
