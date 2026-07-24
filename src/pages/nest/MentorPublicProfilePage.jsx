/**
 * MentorPublicProfilePage — Public mentor profile for eaglets browsing (Phase 28-04).
 *
 * Person-first redesign: leads with the mentor (real photo, name, occupation,
 * verified badge, credibility) sourced from `nest.mentor_profile` (MentorKYC,
 * Phase 28-03). The nest is context, not the subject — its name appears once,
 * small, beside the join CTA. No fabricated content: every section renders real
 * KYC data or a graceful empty state.
 */
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useNestDetail } from '../../modules/nest/hooks/useNests';
import TabBar from '../../shared/components/ui/TabBar';
import AnimatedCounter from '../../shared/components/ui/AnimatedCounter';
import StatusBadge from '../../shared/components/ui/StatusBadge';
import MentorshipRequestModal from '../../modules/nest/components/MentorshipRequestModal';
import MentorProgramTab from '../../modules/nest/components/MentorProgramTab';
import { sanitizeImageUrl } from '../../shared/utils/sanitize';

const TABS = [
    { value: 'about', label: 'About', icon: 'person' },
    { value: 'expertise', label: 'Expertise', icon: 'school' },
    { value: 'style', label: 'Mentorship Style', icon: 'psychology' },
    { value: 'program', label: 'Program', icon: 'flag' },
];

const StatCard = ({ icon, value, label, color = 'text-primary' }) => (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200/60 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors duration-300">
            <span className={`material-symbols-outlined text-xl ${color}`}>{icon}</span>
        </div>
        <div>
            <p className="text-lg font-extrabold text-slate-900 leading-tight">
                <AnimatedCounter value={value} />
            </p>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
        </div>
    </div>
);

/** Small empty-state block for tabs the mentor hasn't filled in. */
const TabEmpty = ({ icon, text }) => (
    <div className="flex flex-col items-center justify-center text-center py-10 text-slate-400">
        <span className="material-symbols-outlined text-3xl mb-2">{icon}</span>
        <p className="text-sm">{text}</p>
    </div>
);

const MentorPublicProfilePage = () => {
    const { nestId } = useParams();
    const { data: nestResponse, isLoading } = useNestDetail(nestId);
    // No members fetch — non-members get 403 on /nests/{id}/members/.
    // Public profile uses member_count from NestDetailSerializer only.

    const [activeTab, setActiveTab] = useState('about');
    const [showRequestModal, setShowRequestModal] = useState(false);

    const nest = nestResponse?.data || nestResponse || {};
    // Person-first: mentor_profile (MentorKYC) is the source of truth; eagle_details
    // supplies the real name; legacy mentor_details kept as a soft fallback.
    const mp = nest.mentor_profile || {};
    const eagle = nest.eagle_details || nest.mentor_details || nest.mentor || {};

    const mentorName = eagle.first_name
        ? `${eagle.first_name} ${eagle.last_name || ''}`.trim()
        : (nest.eagle_name || nest.name || 'Mentor');
    const initials = mentorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    // Avatar chain: KYC display_picture → user avatar → initials block.
    const avatarSrc = mp.display_picture || eagle.avatar_url || eagle.profile_picture || null;

    // Subtitle: real occupation → expertise → focus area.
    const focusArea = nest.industry_focus || nest.focus_area || 'General Mentorship';
    const subtitle = mp.current_occupation || mp.area_of_expertise || focusArea;

    // Real credibility signals.
    const years = Number(mp.years_of_service) || 0;
    const location = mp.location || '';
    const verified = !!mp.kyc_verified;

    // Real expertise chips (no fabricated fallback list).
    const expertise = Array.isArray(mp.mentorship_types) && mp.mentorship_types.length
        ? mp.mentorship_types
        : (mp.area_of_expertise ? [mp.area_of_expertise] : []);

    const bio = mp.profile_description || nest.description || '';

    const memberCount = nest.member_count || nest.members_count || 0;
    const maxMembers = nest.max_members || 20;
    const isFull = memberCount >= maxMembers;
    // Plan 14.5-02: gate join action on program existence.
    const currentProgram = nest.current_program || null;
    const hasProgram = !!currentProgram;
    const joinDisabled = isFull || !hasProgram;
    const joinDisabledReason = !hasProgram
        ? "Mentor hasn't published a program yet"
        : (isFull ? 'Nest is full' : '');

    if (isLoading) {
        return (
            <DashboardLayout variant="eaglet">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Skeleton */}
                    <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-96 bg-slate-50 rounded-2xl animate-pulse" />
                        <div className="h-80 bg-slate-50 rounded-2xl animate-pulse" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout variant="eaglet">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back link */}
                <Link
                    to="/eaglet/nest"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors duration-300 group"
                >
                    <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:-translate-x-1">arrow_back</span>
                    Back to Mentors
                </Link>

                {/* Mentor Header — person-first */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8 md:p-10">
                    {/* Decorative */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl translate-y-1/3" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar — circular, real photo */}
                        <div className="relative flex-shrink-0">
                            {avatarSrc ? (
                                <img
                                    src={sanitizeImageUrl(avatarSrc)}
                                    alt={mentorName}
                                    className="w-28 h-28 rounded-full object-cover ring-4 ring-white/20 shadow-2xl"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-extrabold text-3xl ring-4 ring-white/20 shadow-2xl">
                                    {initials}
                                </div>
                            )}
                            {/* KYC-verified badge (only on approved mentors) */}
                            {verified && (
                                <span
                                    title="Verified mentor"
                                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full border-[3px] border-slate-900 flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-white text-base">verified</span>
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-white">{mentorName}</h1>
                                {verified && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-emerald-200 text-[11px] font-semibold rounded-full">
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-emerald-300 font-medium mb-3">{subtitle}</p>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur text-white text-xs font-semibold rounded-lg">
                                    <span className="material-symbols-outlined text-sm">category</span>
                                    {focusArea}
                                </span>
                                {years > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur text-white text-xs font-semibold rounded-lg">
                                        <span className="material-symbols-outlined text-sm">workspace_premium</span>
                                        {years} {years === 1 ? 'yr' : 'yrs'} experience
                                    </span>
                                )}
                                {location && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur text-white text-xs font-semibold rounded-lg">
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                        {location}
                                    </span>
                                )}
                                <StatusBadge
                                    status={isFull ? 'inactive' : 'active'}
                                    label={isFull ? 'Nest Full' : 'Accepting Members'}
                                    size="sm"
                                />
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => setShowRequestModal(true)}
                                disabled={joinDisabled}
                                title={joinDisabledReason || undefined}
                                className={`
                                    inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg
                                    transition-all duration-300 active:scale-95
                                    ${joinDisabled
                                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                        : 'bg-primary text-white hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                <span className="material-symbols-outlined text-lg">send</span>
                                {isFull ? 'Nest Full' : (!hasProgram ? 'No Program Yet' : 'Request to Join')}
                            </button>
                            {/* Nest context — small, no longer the hero subtitle */}
                            {nest.name && (
                                <p className="mt-2 text-center text-[11px] text-slate-400">
                                    Join via <span className="text-slate-300 font-medium">{nest.name}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main content — tabs */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                        <TabBar
                            tabs={TABS}
                            activeTab={activeTab}
                            onChange={setActiveTab}
                            className="px-2"
                        />

                        <div className="p-6 min-h-[300px]">
                            {activeTab === 'about' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-3">About {eagle.first_name || 'this Mentor'}</h3>
                                        {bio ? (
                                            <p className="text-sm text-slate-600 leading-relaxed">{bio}</p>
                                        ) : (
                                            <TabEmpty icon="person" text="This mentor hasn't written a bio yet." />
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'expertise' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-3">Areas of Expertise</h3>
                                        {expertise.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {expertise.map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="px-3 py-1.5 bg-primary/5 text-primary text-xs font-semibold rounded-lg border border-primary/10"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <TabEmpty icon="school" text="No expertise areas listed yet." />
                                        )}
                                    </div>
                                    {mp.current_occupation && (
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-2">Current Role</h3>
                                            <p className="text-sm text-slate-600">{mp.current_occupation}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'program' && (
                                <MentorProgramTab program={currentProgram} />
                            )}

                            {activeTab === 'style' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-3">Mentorship Approach</h3>
                                        {nest.mentorship_style ? (
                                            <p className="text-sm text-slate-600 leading-relaxed">{nest.mentorship_style}</p>
                                        ) : (
                                            <TabEmpty
                                                icon="psychology"
                                                text="This mentor hasn't described their mentorship style yet. Check the Program tab for their objectives."
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stats — mentor-relevant only (dropped nest-internal Resources/Points) */}
                        <div className="space-y-3">
                            <StatCard icon="group" value={memberCount} label="Mentees" />
                            {years > 0 && (
                                <StatCard icon="workspace_premium" value={years} label="Years Mentoring" color="text-amber-500" />
                            )}
                        </div>

                        {/* Members preview */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                            <h3 className="font-bold text-slate-900 text-sm mb-4">Mentees</h3>
                            {memberCount > 0 ? (
                                <p className="text-xs text-slate-500">
                                    {memberCount} mentee{memberCount !== 1 ? 's' : ''} &bull; {Math.max(maxMembers - memberCount, 0)} spot{maxMembers - memberCount !== 1 ? 's' : ''} left
                                </p>
                            ) : (
                                <p className="text-xs text-slate-500">Be the first to join!</p>
                            )}
                        </div>

                        {/* Availability */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                            <h3 className="font-bold text-slate-900 text-sm mb-3">Availability</h3>
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`w-2.5 h-2.5 rounded-full ${isFull ? 'bg-red-400' : 'bg-emerald-400'} animate-pulse`} />
                                <span className="text-sm font-medium text-slate-700">
                                    {isFull ? 'Currently Full' : 'Accepting New Members'}
                                </span>
                            </div>
                            {!isFull && (
                                <button
                                    onClick={() => setShowRequestModal(true)}
                                    disabled={!hasProgram}
                                    title={joinDisabledReason || undefined}
                                    className={`w-full py-2.5 text-sm font-bold rounded-xl transition-all duration-300 shadow-sm active:scale-[0.98] ${
                                        hasProgram
                                            ? 'bg-primary text-white hover:bg-primary-dark hover:shadow-md hover:shadow-primary/20'
                                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                    }`}
                                >
                                    {hasProgram ? 'Request to Join' : 'No Program Yet'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Modal */}
            {showRequestModal && (
                <MentorshipRequestModal
                    nestId={nestId}
                    nestName={nest.name}
                    mentorName={mentorName}
                    onClose={() => setShowRequestModal(false)}
                />
            )}
        </DashboardLayout>
    );
};

export default MentorPublicProfilePage;
