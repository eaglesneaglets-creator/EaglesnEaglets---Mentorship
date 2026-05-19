/**
 * DiscoverNestsTab — browse + apply to mentor nests.
 * Extracted from EagletNestPage Discover section (plan 14-05 T5).
 * Hidden by parent when mentee already has active program or pending request.
 */
import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useNests, useMyNests } from '../../modules/nest/hooks/useNests';
import AvatarGroup from '../../shared/components/ui/AvatarGroup';
import EmptyState from '../../shared/components/ui/EmptyState';

const PLACEHOLDER_AVATARS = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
];

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
                            <img src={mentor.profile_picture} alt={mentorName}
                                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-slate-100 transition-transform duration-500 group-hover:scale-105">
                                {initials}
                            </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-[2.5px] border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-primary transition-colors duration-300 truncate">{mentorName}</h3>
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
                        {previewMembers.length > 0 && <AvatarGroup users={previewMembers} max={3} size="sm" />}
                        {memberCount > 3 && <span className="text-[11px] text-slate-400 font-medium">+{memberCount - 3} more</span>}
                    </div>
                    <Link to={`/eaglet/mentor/${nest.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-primary-dark hover:shadow-md hover:shadow-primary/20 transition-all duration-300 active:scale-95">
                        View Profile
                        <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-0.5">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

MentorCard.propTypes = {
    nest: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
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
        </div>
    </div>
);

export default function DiscoverNestsTab() {
    const { data: myResponse } = useMyNests();
    const myNests = useMemo(() => myResponse?.data || myResponse?.results || [], [myResponse]);

    const { data: allResponse, isLoading, isError } = useNests();
    const allNests = useMemo(() => allResponse?.data || allResponse?.results || [], [allResponse]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFocus, setSelectedFocus] = useState('All');

    const joinedNestIds = useMemo(() => new Set(myNests.map(n => String(n.id))), [myNests]);

    const focusAreas = useMemo(() => {
        const areas = new Set(
            allNests.filter(n => !joinedNestIds.has(String(n.id)))
                .map(n => n.industry_focus || n.focus_area).filter(Boolean)
        );
        return ['All', ...Array.from(areas)];
    }, [allNests, joinedNestIds]);

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

    return (
        <section className="flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8 md:p-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10 max-w-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary text-2xl">explore</span>
                        <span className="text-xs font-semibold text-primary tracking-wider uppercase">Discover Mentors</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">Find Your Mentor</h1>
                    <p className="text-slate-300 text-base leading-relaxed">
                        Browse experienced mentors, explore their expertise, and request to join a Nest that aligns with your growth goals.
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                    <input type="text" placeholder="Search by mentor name or topic..."
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300" />
                </div>
                <div className="flex-1 flex flex-wrap gap-2">
                    {focusAreas.map(area => (
                        <button key={area} onClick={() => setSelectedFocus(area)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${selectedFocus === area ? 'bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60 hover:border-primary/30 hover:text-primary'}`}>
                            {area}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : isError ? (
                <EmptyState icon="cloud_off" title="Unable to Load Mentors"
                    description="Something went wrong while loading the mentor directory." />
            ) : filteredNests.length === 0 ? (
                <EmptyState
                    icon={searchQuery || selectedFocus !== 'All' ? 'search_off' : 'diversity_3'}
                    title={searchQuery || selectedFocus !== 'All' ? 'No Mentors Found' : 'No Active Nests'}
                    description={searchQuery || selectedFocus !== 'All' ? 'Try adjusting your search or filters.' : 'No mentors available right now. Check back later.'}
                />
            ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredNests.map((nest, i) => (
                        <MentorCard key={nest.id} nest={nest} index={i} />
                    ))}
                </div>
            )}
        </section>
    );
}
