import { useState } from 'react';
import PropTypes from 'prop-types';
import { sanitizeImageUrl } from '../../utils/sanitize';
import { getInitials, colorForName } from '../../utils/initials';
import { sizedAvatarUrl } from '../../utils/avatarUrl';

/**
 * Avatar — THE single component deciding picture-vs-initials (Phase 32-02).
 *
 * Before this existed, 26 files each hand-rolled
 * `name.split(' ').map(n => n[0])` with their own sizes and colours, which is why
 * user pictures appeared on some surfaces and initials on others. Every avatar
 * should render through here.
 *
 * Accepts several URL keys because endpoints disagree: 32-01 standardised
 * `avatar_url`, but older payloads still send `avatar` / `profile_picture`, and
 * mentor KYC data uses `display_picture`.
 */

const SIZES = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-14 h-14 text-base',
  xl: 'w-24 h-24 text-2xl',
};

/**
 * Rendered box in CSS pixels, matching the Tailwind classes above (w-6 = 24px).
 * Used to request a correctly-sized image from the CDN — the backend stores the
 * raw full-resolution upload, so without this the browser downscales a large
 * JPEG into a 24px box and it renders soft.
 *
 * Call sites that override the size via `className` (e.g. `!w-16`) still get a
 * sensible request from their nearest `size` prop; being slightly off costs a
 * few KB, not correctness.
 */
const SIZE_PX = { xs: 24, sm: 32, md: 40, lg: 56, xl: 96 };

const resolveName = (user, name) => {
  if (name) return name;
  if (!user) return '';
  if (user.full_name) return user.full_name;
  const joined = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return joined || user.name || '';
};

/**
 * Initials only. Falls back to the email's FIRST LETTER when a user has no name
 * at all — one letter, not two, because `getInitials('ama@x.com')` would give
 * 'AM', which reads as a surname the person doesn't have. The public navbar's
 * helper behaved this way before 32-03 folded it in here.
 *
 * Kept separate from `resolveName` so the *displayed* name and the alt/title
 * text never become an email address (leaking it next to their face).
 */
const resolveInitials = (displayName, user) => {
  if (displayName) return getInitials(displayName);
  const email = user?.email;
  if (typeof email === 'string' && email.trim()) {
    return email.trim()[0].toUpperCase();
  }
  return '?';
};

const resolveSrc = (user, src) => {
  const raw = src
    || user?.avatar_url
    || user?.profile_picture_url
    || user?.avatar
    || user?.profile_picture
    || user?.display_picture
    || '';
  // sanitizeImageUrl returns '' for unsafe/empty input → fall through to initials.
  return typeof raw === 'string' ? sanitizeImageUrl(raw) : '';
};

const Avatar = ({
  user = null,
  src = '',
  name = '',
  size = 'md',
  className = '',
  title,
  eager = false,
  ...rest
}) => {
  const [failed, setFailed] = useState(false);

  const displayName = resolveName(user, name);
  // Ask the CDN for the size we actually render — see SIZE_PX.
  const px = SIZE_PX[size] || SIZE_PX.md;
  const resolvedSrc = sizedAvatarUrl(resolveSrc(user, src), px);
  const sizeCls = SIZES[size] || SIZES.md;
  const showImage = Boolean(resolvedSrc) && !failed;
  // `resolveName` returns '' (never null) for an unknown user, so `||` is what
  // drops the attribute — `?? undefined` would leave a useless title="".
  const tooltip = title || displayName || undefined;

  if (showImage) {
    return (
      <img
        src={resolvedSrc}
        // Empty alt when the name is unknown so screen readers skip the image
        // rather than announcing a filename.
        alt={displayName || ''}
        title={tooltip}
        // Lists render 15-50 of these (admin users, leaderboard, members, chat),
        // so defer the off-screen ones and never block the main thread decoding.
        // `eager` opts out for above-the-fold chrome — the sidebar avatar is
        // visible at first paint, and lazy-loading a visible image delays it.
        loading={eager ? 'eager' : 'lazy'}
        decoding={eager ? 'sync' : 'async'}
        // Intrinsic size reserves the box before the bytes arrive, so a slow
        // avatar cannot shift the row it sits in (CLS). Matches SIZE_PX/SIZES;
        // CSS w-/h- classes still win for rendered size.
        width={px}
        height={px}
        // A dead URL degrades to initials instead of a broken-image icon. The
        // 32-01 fallback chain can serve older KYC URLs whose files may be gone.
        onError={() => setFailed(true)}
        className={`rounded-full object-cover flex-shrink-0 ${sizeCls} ${className}`.trim()}
        {...rest}
      />
    );
  }

  return (
    <div
      title={tooltip}
      aria-label={displayName ? `${displayName} avatar` : undefined}
      className={`rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br ${colorForName(displayName || user?.email || '')} ${sizeCls} ${className}`.trim()}
      {...rest}
    >
      {resolveInitials(displayName, user)}
    </div>
  );
};

Avatar.propTypes = {
  /** User-ish object; reads avatar_url → avatar → profile_picture → display_picture. */
  user: PropTypes.object,
  /** Explicit URL, for call sites without a user object (e.g. .values() aggregates). */
  src: PropTypes.string,
  /** Explicit name, when not derivable from `user`. */
  name: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  title: PropTypes.string,
  /**
   * Set on above-the-fold avatars (sidebar, navbar) so they load eagerly and
   * decode synchronously. Everything in a scrollable list should leave this
   * false — that is where the win is.
   */
  eager: PropTypes.bool,
};

export default Avatar;
