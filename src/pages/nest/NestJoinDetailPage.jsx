/**
 * NestJoinDetailPage — Detailed nest overview with join form
 *
 * Inspired by Image 7 — nest overview, membership benefits, community stats, join form.
 */
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useNestDetail, useNestMembers, useJoinNest } from '../../modules/nest/hooks/useNests';
import AnimatedCounter from '../../shared/components/ui/AnimatedCounter';
import AvatarGroup from '../../shared/components/ui/AvatarGroup';
import StatusBadge from '../../shared/components/ui/StatusBadge';
import RequestSentSuccess from '../../modules/nest/components/RequestSentSuccess';

const MAX_CHARS = 500;

const BENEFITS = [
    { icon: 'school', title: 'Structured Learning', description: 'Follow a guided path with clear milestones and objectives.' },
    { icon: 'forum', title: 'Community Support', description: 'Connect with peers and get support from experienced mentors.' },
    { icon: 'assignment', title: 'Hands-on Projects', description: 'Apply your skills through practical assignments and projects.' },
    { icon: 'stars', title: 'Recognition & Points', description: 'Earn points and badges as you complete activities and grow.' },
    { icon: 'video_call', title: 'Live Sessions', description: 'Participate in interactive video sessions with your mentor.' },
    { icon: 'trending_up', title: 'Progress Tracking', description: 'Monitor your growth with detailed analytics and reports.' },
];

const NestJoinDetailPage = () => {
    const { nestId } = useParams();
    const { data: nestResponse, isLoading } = useNestDetail(nestId);
    const { data: membersResponse } = useNestMembers(nestId);
    const joinMutation = useJoinNest(nestId);

    const [message, setMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const nest = nestResponse?.data || nestResponse || {};
    const mentor = nest.mentor_details || nest.mentor || {};
    const members = membersResponse?.data || membersResponse?.results || [];
    const mentorName = mentor.first_name ? `${mentor.first_name} ${mentor.last_name || ''}`.trim() : nest.name || 'Mentor';
    const focusArea = nest.industry_focus || nest.focus_area || 'General Mentorship';
    const memberCount = nest.member_count || nest.members_count || members.length || 0;
    const maxMembers = nest.max_members || 20;
    const isFull = memberCount >= maxMembers;
    const spotsLeft = maxMembers - memberCount;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || isFull) return;
        try {
            await joinMutation.mutateAsync(message.trim());
            setShowSuccess(true);
        } catch {
            // Error handled by React Query
        }
    };

    if (showSuccess) {
        return (
            <DashboardLayout variant="eaglet">
                <RequestSentSuccess
                    nestName={nest.name}
                    mentorName={mentorName}
                    onClose={() => window.history.back()}
                />
            </DashboardLayout>
        );
    }

    if (isLoading) {
        return (
            <DashboardLayout variant="eaglet">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
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
                    to={`/eaglet/mentor/${nestId}`}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors duration-300 group"
                >
                    <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:-translate-x-1">arrow_back</span>
                    Back to Mentor Profile
                </Link>

                {/* Nest overview header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-white to-emerald-50 border border-primary/10 p-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-primary/20 flex-shrink-0">
                            <span className="material-symbols-outlined text-3xl">diversity_3</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-2xl font-extrabold text-slate-900">{nest.name || 'Nest'}</h1>
                                <StatusBadge
                                    status={isFull ? 'inactive' : 'active'}
                                    label={isFull ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                                    size="sm"
                                />
                            </div>
                            <p className="text-sm text-slate-600 mb-3">Mentored by <span className="font-semibold text-slate-800">{mentorName}</span></p>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary text-xs font-semibold rounded-lg border border-primary/10">
                                    <span className="material-symbols-outlined text-sm">category</span>
                                    {focusArea}
                                </span>
                            </div>
                        </div>

                        {/* Quick stats */}
                        <div className="flex gap-6 flex-shrink-0">
                            <div className="text-center">
                                <p className="text-2xl font-extrabold text-slate-900">
                                    <AnimatedCounter value={memberCount} />
                                </p>
                                <p className="text-xs text-slate-500 font-medium">Members</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-extrabold text-slate-900">
                                    <AnimatedCounter value={nest.content_count || 0} />
                                </p>
                                <p className="text-xs text-slate-500 font-medium">Resources</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left — Benefits + Description */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        {nest.description && (
                            <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                                <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">info</span>
                                    About This Nest
                                </h2>
                                <p className="text-sm text-slate-600 leading-relaxed">{nest.description}</p>
                            </div>
                        )}

                        {/* Benefits */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">workspace_premium</span>
                                Membership Benefits
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {BENEFITS.map((benefit, idx) => (
                                    <div
                                        key={benefit.title}
                                        className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 group"
                                        style={{ animation: `fadeInUp 0.4s ease-out ${idx * 0.08}s both` }}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors duration-300">
                                            <span className="material-symbols-outlined text-primary text-lg">{benefit.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-800">{benefit.title}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{benefit.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right — Join form + Community */}
                    <div className="space-y-6">
                        {/* Join form */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 sticky top-6">
                            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">send</span>
                                Request to Join
                            </h2>

                            {isFull ? (
                                <div className="text-center py-6">
                                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-400 text-2xl">group_off</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 mb-1">Nest is Full</p>
                                    <p className="text-xs text-slate-500">This nest has reached maximum capacity. Check back later.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Why do you want to join?
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                                            placeholder="Share your goals and what you hope to learn..."
                                            rows={5}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                        />
                                        <div className="flex justify-end mt-1">
                                            <span className={`text-xs font-medium ${message.length > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                {message.length}/{MAX_CHARS}
                                            </span>
                                        </div>
                                    </div>

                                    {joinMutation.isError && (
                                        <div className="p-3 bg-red-50 border border-red-200/60 rounded-xl flex items-center gap-2">
                                            <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                                            <p className="text-sm text-red-700">
                                                {joinMutation.error?.message || 'Failed to send request.'}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!message.trim() || joinMutation.isPending}
                                        className={`
                                            w-full py-3 text-sm font-bold rounded-xl transition-all duration-300
                                            inline-flex items-center justify-center gap-2
                                            ${!message.trim() || joinMutation.isPending
                                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]'
                                            }
                                        `}
                                    >
                                        {joinMutation.isPending ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-lg">send</span>
                                                Send Request
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Community preview */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                            <h2 className="font-bold text-slate-900 text-sm mb-4">Community</h2>
                            {members.length > 0 ? (
                                <>
                                    <AvatarGroup users={members} max={8} size="md" className="mb-3" />
                                    <p className="text-xs text-slate-500">
                                        {memberCount} member{memberCount !== 1 ? 's' : ''} already learning together
                                    </p>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <span className="material-symbols-outlined text-slate-300 text-3xl mb-2">group_add</span>
                                    <p className="text-xs text-slate-500">Be the first to join!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </DashboardLayout>
    );
};

export default NestJoinDetailPage;
