import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import AvatarGroup from '../../../shared/components/ui/AvatarGroup';

/**
 * MentorCard — person-first mentor discovery card (Phase 28-02).
 *
 * Consumes `nest.mentor_profile` (Phase 28-01) sourced from MentorKYC and
 * renders the mentor, not the nest: circular avatar, occupation subtitle,
 * real expertise chips, real bio, credibility row, and a KYC-verified badge.
 * Every field degrades gracefully when the profile (or a field) is absent.
 */
const PLACEHOLDER_AVATARS = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
];

const MentorCard = ({ nest, index = 0 }) => {
    const mp = nest.mentor_profile || {};
    const mentor = nest.mentor_details || nest.mentor || {};

    const mentorName = nest.eagle_name
        || (mentor.first_name ? `${mentor.first_name} ${mentor.last_name || ''}`.trim() : nest.name || 'Mentor');
    const initials = mentorName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    // Avatar source chain: KYC display_picture → user avatar → initials block.
    const avatarSrc = mp.display_picture || mentor.avatar_url || mentor.profile_picture || null;

    // Subtitle: occupation → expertise → nothing (no empty line).
    const subtitle = mp.current_occupation || mp.area_of_expertise || null;

    // Expertise chips: real mentorship_types (max 3) → single expertise → none.
    const chips = Array.isArray(mp.mentorship_types) && mp.mentorship_types.length
        ? mp.mentorship_types.slice(0, 3)
        : (mp.area_of_expertise ? [mp.area_of_expertise] : []);

    const bio = mp.profile_description || nest.description
        || 'A supportive mentor ready to guide your growth.';

    const years = Number(mp.years_of_service) || 0;
    const location = mp.location || '';
    const hasCredibility = years > 0 || Boolean(location);

    const memberCount = nest.member_count || nest.members_count || 0;
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
                {/* Header: avatar + name + occupation */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                        {avatarSrc ? (
                            <img
                                src={avatarSrc}
                                alt={mentorName}
                                className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-100 transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-2xl ring-2 ring-slate-100 transition-transform duration-500 group-hover:scale-105">
                                {initials}
                            </div>
                        )}
                        {/* Online dot */}
                        <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-[2.5px] border-white" />
                        {/* KYC-verified badge */}
                        {mp.kyc_verified && (
                            <span
                                title="Verified mentor"
                                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center ring-2 ring-white"
                            >
                                <span className="material-symbols-outlined text-white text-[14px]">verified</span>
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors duration-300 truncate">
                            {mentorName}
                        </h3>
                        {subtitle && (
                            <p className="text-sm text-slate-500 truncate mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Expertise chips */}
                {chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {chips.map((c) => (
                            <span
                                key={c}
                                className="inline-flex items-center px-2.5 py-1 bg-primary/5 text-primary text-xs font-semibold rounded-lg border border-primary/10"
                            >
                                {c}
                            </span>
                        ))}
                    </div>
                )}

                {/* Bio */}
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4 min-h-[40px]">
                    {bio}
                </p>

                {/* Credibility row */}
                {hasCredibility && (
                    <div className="flex items-center gap-3 mb-5 text-xs text-slate-500">
                        {years > 0 && (
                            <span className="inline-flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-slate-400">workspace_premium</span>
                                <span className="font-medium">{years} {years === 1 ? 'yr' : 'yrs'} experience</span>
                            </span>
                        )}
                        {years > 0 && location && <span className="text-slate-300">·</span>}
                        {location && (
                            <span className="inline-flex items-center gap-1.5 truncate">
                                <span className="material-symbols-outlined text-sm text-slate-400">location_on</span>
                                <span className="font-medium truncate">{location}</span>
                            </span>
                        )}
                    </div>
                )}

                {/* Footer: mentees + CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        {previewMembers.length > 0 && <AvatarGroup users={previewMembers} max={3} size="sm" />}
                        {memberCount > 3 && (
                            <span className="text-[11px] text-slate-400 font-medium">+{memberCount - 3} more</span>
                        )}
                    </div>
                    <Link
                        to={`/eaglet/mentor/${nest.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-full shadow-sm hover:bg-primary-dark hover:shadow-md hover:shadow-primary/20 transition-all duration-300 active:scale-95"
                    >
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
    index: PropTypes.number,
};

export default MentorCard;
