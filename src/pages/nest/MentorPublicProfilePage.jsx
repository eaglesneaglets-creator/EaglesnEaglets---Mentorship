/**
 * MentorPublicProfilePage — Public mentor profile for eaglets browsing
 *
 * Shows mentor info, nest details, expertise tabs, stats, and a "Request to Join" CTA.
 * Inspired by Image 10 — tabs (About/Expertise/Style), stats sidebar, availability.
 */
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useNestDetail, useNestMembers } from '../../modules/nest/hooks/useNests';
import TabBar from '../../shared/components/ui/TabBar';
import AnimatedCounter from '../../shared/components/ui/AnimatedCounter';
import AvatarGroup from '../../shared/components/ui/AvatarGroup';
import StatusBadge from '../../shared/components/ui/StatusBadge';
import MentorshipRequestModal from '../../modules/nest/components/MentorshipRequestModal';
import { sanitizeImageUrl } from '../../shared/utils/sanitize';

const TABS = [
    { value: 'about', label: 'About', icon: 'person' },
    { value: 'expertise', label: 'Expertise', icon: 'school' },
    { value: 'style', label: 'Mentorship Style', icon: 'psychology' },
];

const StatCard = ({ icon, value, label, color = 'text-primary' }) => (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200/60 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
        <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors duration-300`}>
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

const MentorPublicProfilePage = () => {
    const { nestId } = useParams();
    const { data: nestResponse, isLoading } = useNestDetail(nestId);
    const { data: membersResponse } = useNestMembers(nestId);

    const [activeTab, setActiveTab] = useState('about');
    const [showRequestModal, setShowRequestModal] = useState(false);

    const nest = nestResponse?.data || nestResponse || {};
    const mentor = nest.mentor_details || nest.mentor || {};
    const members = membersResponse?.data || membersResponse?.results || [];
    const mentorName = mentor.first_name ? `${mentor.first_name} ${mentor.last_name || ''}` : nest.name || 'Mentor';
    const initials = mentorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const focusArea = nest.industry_focus || nest.focus_area || 'General Mentorship';
    const memberCount = nest.member_count || nest.members_count || members.length || 0;
    const maxMembers = nest.max_members || 20;
    const isFull = memberCount >= maxMembers;

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

                {/* Profile Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8 md:p-10">
                    {/* Decorative */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl translate-y-1/3" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            {mentor.profile_picture ? (
                                <img
                                    src={sanitizeImageUrl(mentor.profile_picture)}
                                    alt={mentorName}
                                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white/20 shadow-2xl"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-extrabold text-2xl ring-4 ring-white/20 shadow-2xl">
                                    {initials}
                                </div>
                            )}
                            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-[3px] border-slate-900 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xs">check</span>
                            </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">{mentorName}</h1>
                            <p className="text-emerald-300 font-medium mb-3">{nest.name}</p>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur text-white text-xs font-semibold rounded-lg">
                                    <span className="material-symbols-outlined text-sm">category</span>
                                    {focusArea}
                                </span>
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
                                disabled={isFull}
                                className={`
                                    inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg
                                    transition-all duration-300 active:scale-95
                                    ${isFull
                                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                        : 'bg-primary text-white hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                <span className="material-symbols-outlined text-lg">send</span>
                                {isFull ? 'Nest Full' : 'Request to Join'}
                            </button>
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
                                        <h3 className="font-bold text-slate-900 mb-3">About the Nest</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {nest.description || 'This mentor has not provided a description yet. Request to join to learn more about their mentorship approach.'}
                                        </p>
                                    </div>
                                    {nest.goals && (
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-3">Goals & Objectives</h3>
                                            <p className="text-sm text-slate-600 leading-relaxed">{nest.goals}</p>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-3">What You&apos;ll Get</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[
                                                { icon: 'school', label: 'Structured Learning Path' },
                                                { icon: 'forum', label: 'Community Support' },
                                                { icon: 'assignment', label: 'Hands-on Assignments' },
                                                { icon: 'stars', label: 'Points & Recognition' },
                                            ].map(item => (
                                                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                    <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                                                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'expertise' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-3">Areas of Expertise</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(nest.expertise_tags || [focusArea, 'Mentoring', 'Leadership']).map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1.5 bg-primary/5 text-primary text-xs font-semibold rounded-lg border border-primary/10"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {mentor.bio && (
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-3">Mentor Background</h3>
                                            <p className="text-sm text-slate-600 leading-relaxed">{mentor.bio}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'style' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-3">Mentorship Approach</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {nest.mentorship_style || 'This mentor combines structured learning with hands-on projects, providing regular feedback and creating a supportive community environment for growth.'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-3">Session Format</h3>
                                        <div className="space-y-3">
                                            {[
                                                { icon: 'video_call', label: 'Group video sessions', detail: 'Weekly' },
                                                { icon: 'assignment', label: 'Assignments & projects', detail: 'Bi-weekly' },
                                                { icon: 'chat', label: 'Community discussions', detail: 'Ongoing' },
                                            ].map(item => (
                                                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-primary">{item.icon}</span>
                                                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-500 font-medium">{item.detail}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="space-y-3">
                            <StatCard icon="group" value={memberCount} label="Current Members" />
                            <StatCard icon="library_books" value={nest.content_count || 0} label="Resources" color="text-blue-500" />
                            <StatCard icon="stars" value={nest.total_points_awarded || 0} label="Points Awarded" color="text-amber-500" />
                        </div>

                        {/* Members preview */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                            <h3 className="font-bold text-slate-900 text-sm mb-4">Members</h3>
                            {members.length > 0 ? (
                                <>
                                    <AvatarGroup users={members} max={6} size="md" className="mb-3" />
                                    <p className="text-xs text-slate-500">
                                        {memberCount} member{memberCount !== 1 ? 's' : ''} &bull; {maxMembers - memberCount} spot{maxMembers - memberCount !== 1 ? 's' : ''} left
                                    </p>
                                </>
                            ) : (
                                <p className="text-xs text-slate-500">Be the first to join this nest!</p>
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
                                    className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-primary/20 active:scale-[0.98]"
                                >
                                    Request to Join
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
