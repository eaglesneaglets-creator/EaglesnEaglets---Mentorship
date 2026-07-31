import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Avatar from './Avatar';
import AvatarGroup from './AvatarGroup';
import { getInitials } from '../../utils/initials';

/**
 * Phase 32-02 — <Avatar> is the single component deciding picture-vs-initials.
 * Before it, 26 files hand-rolled initials with their own colours and sizes,
 * which is why pictures showed on some surfaces and initials on others.
 */

const withPicture = {
  id: 'u1',
  first_name: 'Ama',
  last_name: 'Mensah',
  avatar_url: 'https://cdn.example.com/ama.jpg',
};

const withoutPicture = {
  id: 'u2',
  first_name: 'Kofi',
  last_name: 'Boateng',
  avatar_url: null,
};

describe('Avatar', () => {
  it('renders the real picture when avatar_url is set', () => {
    render(<Avatar user={withPicture} />);
    const img = screen.getByRole('img', { name: 'Ama Mensah' });
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/ama.jpg');
    expect(screen.queryByText('AM')).not.toBeInTheDocument();
  });

  it('falls back to initials when there is no picture', () => {
    render(<Avatar user={withoutPicture} />);
    expect(screen.getByText('KB')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('falls back to initials for an unsafe URL', () => {
    // sanitizeImageUrl strips dangerous protocols → empty → initials.
    render(<Avatar user={{ ...withoutPicture, avatar_url: 'javascript:alert(1)' }} />);
    expect(screen.getByText('KB')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('swaps to initials if the image fails to load at runtime', () => {
    render(<Avatar user={withPicture} />);
    const img = screen.getByRole('img', { name: 'Ama Mensah' });

    // A dead URL must degrade gracefully, not show a broken-image icon.
    fireEvent.error(img);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('AM')).toBeInTheDocument();
  });

  it('does not crash when the user has no name at all', () => {
    render(<Avatar user={{ id: 'u3' }} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('reads legacy URL keys as well as avatar_url', () => {
    // Different endpoints send different names; Avatar understands all of them.
    const { rerender } = render(<Avatar user={{ first_name: 'A', avatar: 'https://cdn/x.jpg' }} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn/x.jpg');

    rerender(<Avatar user={{ first_name: 'A', profile_picture: 'https://cdn/y.jpg' }} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn/y.jpg');

    rerender(<Avatar user={{ first_name: 'A', display_picture: 'https://cdn/z.jpg' }} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn/z.jpg');
  });

  it('accepts a bare src/name pair for call sites without a user object', () => {
    render(<Avatar src="https://cdn/agg.jpg" name="Flat Payload" />);
    expect(screen.getByRole('img', { name: 'Flat Payload' })).toBeInTheDocument();
  });

  it('requests a size-appropriate image from Cloudinary (Phase 32-03 follow-up)', () => {
    // The backend stores the raw full-resolution upload, so without this the
    // browser downscales a large JPEG into a 32px box and it renders soft.
    render(
      <Avatar
        size="sm"
        name="Ama Mensah"
        src="https://res.cloudinary.com/demo/image/upload/v1/pic.jpg"
      />,
    );
    const src = screen.getByRole('img').getAttribute('src');
    expect(src).toContain('c_fill,g_face');
    expect(src).toContain('f_auto,q_auto');
    // jsdom reports devicePixelRatio 1, so sm (32px) requests w_32.
    expect(src).toContain('w_32,h_32');
  });

  // P4 (perf): lists render 15-50 avatars, so off-screen ones must defer. But
  // lazy-loading an above-the-fold image DELAYS it, so the sidebar/navbar need
  // an opt-out. Both directions are pinned here.
  it('lazy-loads and async-decodes by default', () => {
    render(<Avatar user={withPicture} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('loads eagerly when `eager` is set, for above-the-fold chrome', () => {
    render(<Avatar user={withPicture} eager />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('decoding', 'sync');
  });

  it('reserves the box with intrinsic width/height to prevent layout shift', () => {
    render(<Avatar user={withPicture} size="md" />);
    const img = screen.getByRole('img');
    // md === w-10 === 40px, per SIZE_PX.
    expect(img).toHaveAttribute('width', '40');
    expect(img).toHaveAttribute('height', '40');
  });

  it('falls back to the email initial for a user with no name (Phase 32-03)', () => {
    // Absorbed from publicNavConfig's helper during the 32-03 sweep. Google
    // sign-ups can arrive with an email and no name; they showed 'D' there and
    // must not regress to '?' now that every surface shares this component.
    render(<Avatar user={{ id: 'u4', email: 'daniel@example.com' }} />);
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('shows ONE letter for an email, not two', () => {
    // Guards a tempting "simplification": routing the email through
    // getInitials() yields 'DA', which reads as a surname the person lacks.
    render(<Avatar user={{ id: 'u5', email: 'daniel@example.com' }} />);
    expect(screen.queryByText('DA')).not.toBeInTheDocument();
  });

  it('never renders the email as visible text or a tooltip', () => {
    // The initial is fine; the address itself must not appear next to someone's
    // face. This is why resolveName and resolveInitials stay separate.
    const { container } = render(<Avatar user={{ id: 'u6', email: 'daniel@example.com' }} />);
    expect(container.textContent).not.toContain('@');
    expect(container.firstChild).not.toHaveAttribute('title', 'daniel@example.com');
  });

  it('uses the name as the tooltip, and omits the attribute when unknown', () => {
    const { container: named } = render(<Avatar user={withoutPicture} />);
    expect(named.firstChild).toHaveAttribute('title', 'Kofi Boateng');

    const { container: anon } = render(<Avatar user={{ id: 'u7' }} />);
    expect(anon.firstChild).not.toHaveAttribute('title');
  });

  it('lets an explicit title override the name', () => {
    render(<Avatar user={withoutPicture} title="Nest owner" />);
    expect(screen.getByTitle('Nest owner')).toBeInTheDocument();
  });

  it('gives the same person the same fallback colour every time', () => {
    // Colour is derived from the name, NOT the list index — so a person doesn't
    // change colour depending on their position in a list.
    const { container: a } = render(<Avatar user={withoutPicture} />);
    const { container: b } = render(<Avatar user={withoutPicture} />);
    const gradientOf = (c) =>
      [...c.firstChild.classList].filter((cl) => cl.startsWith('from-') || cl.startsWith('to-'));

    expect(gradientOf(a)).toEqual(gradientOf(b));
    expect(gradientOf(a).length).toBeGreaterThan(0);
  });
});

describe('getInitials', () => {
  it('handles the shapes real data arrives in', () => {
    expect(getInitials('Ama Mensah')).toBe('AM');
    expect(getInitials('Ama')).toBe('AM');
    expect(getInitials('  Kofi   Boateng ')).toBe('KB');
    expect(getInitials('')).toBe('?');
    expect(getInitials(null)).toBe('?');
    expect(getInitials(undefined)).toBe('?');
  });
});

describe('AvatarGroup (delegates to Avatar)', () => {
  it('renders real pictures — previously it ignored avatar_url entirely', () => {
    render(<AvatarGroup users={[withPicture, { ...withPicture, id: 'u9' }]} />);
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('mixes pictures and initials', () => {
    render(<AvatarGroup users={[withPicture, withoutPicture]} />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByText('KB')).toBeInTheDocument();
  });

  it('keeps the +N overflow chip', () => {
    const many = Array.from({ length: 7 }, (_, i) => ({ ...withoutPicture, id: `x${i}` }));
    render(<AvatarGroup users={many} max={4} />);
    expect(screen.getByText('+3')).toBeInTheDocument();
  });
});
