import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Compass,
  Flame,
  Home,
  MessageCircle,
  MoreHorizontal,
  Play,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react';
import BrandLogo from '@shared/components/ui/BrandLogo';
import PrototypeCatalogScreen from './PrototypeCatalogScreen';
import { getPrototypeRoute, getPrototypeScreen, PROTOTYPE_CATALOG } from './prototypeCatalog';
import './mobile-prototype.css';

const NAV_ITEMS = {
  public: [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'store', label: 'Store', icon: Compass },
    { id: 'donations', label: 'Give', icon: Sparkles },
    { id: 'login', label: 'Account', icon: CircleUserRound },
  ],
  eaglet: [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'nest', label: 'Nest', icon: Users },
    { id: 'profile', label: 'You', icon: CircleUserRound },
  ],
  eagle: [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'nest', label: 'Nest', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'profile', label: 'You', icon: CircleUserRound },
  ],
  admin: [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'learn', label: 'Content', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ],
  shared: [
    { id: 'notifications', label: 'Updates', icon: Bell },
    { id: 'settings-home', label: 'Settings', icon: Settings2 },
    { id: 'account', label: 'Account', icon: CircleUserRound },
    { id: 'privacy-settings', label: 'Privacy', icon: ShieldCheck },
  ],
};

const DEFAULT_SCREEN = { public: 'landing', eaglet: 'home', eagle: 'home', admin: 'home', shared: 'notifications' };

const ACCENTS = [
  { id: 'emerald', label: 'Emerald', color: '#10b981' },
  { id: 'forest', label: 'Forest', color: '#15803d' },
  { id: 'teal', label: 'Teal', color: '#0d9488' },
];

const ScreenHeader = ({ eyebrow, title, onOpenSettings }) => (
  <header className="mp-screen-header">
    <div>
      <span className="mp-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
    </div>
    <div className="mp-header-actions">
      <button type="button" className="mp-icon-button" aria-label="Search">
        <Search aria-hidden="true" />
      </button>
      <button type="button" className="mp-icon-button mp-notification-button" aria-label="Notifications">
        <Bell aria-hidden="true" />
        <span className="mp-notification-dot" />
      </button>
      <button type="button" className="mp-icon-button" aria-label="Customize prototype" onClick={onOpenSettings}>
        <Settings2 aria-hidden="true" />
      </button>
    </div>
  </header>
);

const HomeScreen = ({ role, onOpenSheet, onOpenSettings }) => (
  <>
    <ScreenHeader eyebrow="Friday, 7 August" title={`Good morning, ${role === 'eaglet' ? 'Ama' : 'Daniel'}`} onOpenSettings={onOpenSettings} />

    <section className="mp-hero-card" aria-labelledby="continue-title">
      <div className="mp-hero-glow" />
      <span className="mp-card-kicker"><Sparkles aria-hidden="true" /> Continue your journey</span>
      <h2 id="continue-title">{role === 'eaglet' ? 'Finding Your Voice' : 'Mentoring with Empathy'}</h2>
      <p>Module 3 · 12 min remaining</p>
      <div className="mp-progress-track"><span style={{ width: role === 'eaglet' ? '68%' : '52%' }} /></div>
      <button type="button" className="mp-hero-action" onClick={onOpenSheet}>
        <Play fill="currentColor" aria-hidden="true" /> Resume lesson
      </button>
    </section>

    <section className="mp-section" aria-labelledby="today-title">
      <div className="mp-section-heading">
        <div>
          <span className="mp-eyebrow">Your progress</span>
          <h2 id="today-title">Today</h2>
        </div>
        <button type="button" className="mp-text-button">See all</button>
      </div>
      <div className="mp-stat-grid">
        <article className="mp-stat-card">
          <span className="mp-stat-icon"><Flame aria-hidden="true" /></span>
          <strong>7 days</strong>
          <span>Learning streak</span>
        </article>
        <article className="mp-stat-card">
          <span className="mp-stat-icon"><Trophy aria-hidden="true" /></span>
          <strong>1,240</strong>
          <span>Impact points</span>
        </article>
      </div>
    </section>

    <section className="mp-section" aria-labelledby="next-title">
      <div className="mp-section-heading">
        <div>
          <span className="mp-eyebrow">Coming up</span>
          <h2 id="next-title">Next session</h2>
        </div>
      </div>
      <button type="button" className="mp-list-row mp-session-row" onClick={onOpenSheet}>
        <span className="mp-date-tile"><small>AUG</small><strong>09</strong></span>
        <span className="mp-list-copy">
          <strong>{role === 'eaglet' ? 'Career clarity check-in' : 'Monthly nest circle'}</strong>
          <span>10:30 · 30 minutes</span>
        </span>
        <ChevronRight aria-hidden="true" />
      </button>
    </section>
  </>
);

const LearnScreen = ({ onOpenSettings }) => (
  <>
    <ScreenHeader eyebrow="Learning centre" title="Grow at your pace" onOpenSettings={onOpenSettings} />
    <label className="mp-search-field">
      <Search aria-hidden="true" />
      <span className="sr-only">Search learning content</span>
      <input type="search" placeholder="Search lessons and resources" />
    </label>
    <div className="mp-chip-row" aria-label="Learning filters">
      <button type="button" className="is-selected">For you</button>
      <button type="button">In progress</button>
      <button type="button">Saved</button>
    </div>
    <section className="mp-section" aria-labelledby="recommended-title">
      <div className="mp-section-heading">
        <h2 id="recommended-title">Recommended</h2>
        <button type="button" className="mp-text-button">See all</button>
      </div>
      <div className="mp-course-stack">
        {[
          ['Communication that connects', '18 min', 'emerald', MessageCircle],
          ['Build your personal roadmap', '24 min', 'amber', Compass],
          ['Turn ideas into action', '15 min', 'blue', Zap],
        ].map(([title, duration, tone, Icon], index) => (
          <button type="button" className="mp-course-card" key={title}>
            <span className={`mp-course-art mp-course-art--${tone}`}><Icon aria-hidden="true" /></span>
            <span className="mp-list-copy">
              <span className="mp-card-kicker">Module {index + 1}</span>
              <strong>{title}</strong>
              <span>{duration} · Audio & reading</span>
            </span>
            <ChevronRight aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  </>
);

const NestScreen = ({ onOpenSettings }) => (
  <>
    <ScreenHeader eyebrow="Your community" title="The Growth Nest" onOpenSettings={onOpenSettings} />
    <section className="mp-nest-banner">
      <div className="mp-avatar-stack" aria-label="12 nest members">
        <span>AK</span><span>JD</span><span>MN</span><span>+9</span>
      </div>
      <strong>12 people growing together</strong>
      <p>Your weekly circle starts Sunday at 10:30.</p>
      <button type="button" className="mp-secondary-action"><CalendarDays aria-hidden="true" /> View session</button>
    </section>
    <section className="mp-section" aria-labelledby="conversation-title">
      <div className="mp-section-heading">
        <div>
          <span className="mp-eyebrow">Latest</span>
          <h2 id="conversation-title">Nest conversation</h2>
        </div>
        <button type="button" className="mp-icon-button" aria-label="More conversation options"><MoreHorizontal aria-hidden="true" /></button>
      </div>
      <article className="mp-post-card">
        <div className="mp-post-author"><span className="mp-avatar">KA</span><div><strong>Kofi Asante</strong><span>Eagle · 18 min ago</span></div></div>
        <p>What is one small decision you can make this weekend that your future self will thank you for?</p>
        <div className="mp-post-actions"><button type="button">🌱 18</button><button type="button"><MessageCircle aria-hidden="true" /> 7 replies</button></div>
      </article>
    </section>
  </>
);

const ProfileScreen = ({ role, onOpenSettings }) => (
  <>
    <ScreenHeader eyebrow="Your space" title="Profile" onOpenSettings={onOpenSettings} />
    <section className="mp-profile-card">
      <span className="mp-profile-avatar">{role === 'eaglet' ? 'AA' : 'DM'}<i /></span>
      <div><h2>{role === 'eaglet' ? 'Ama Adu' : 'Daniel Mensah'}</h2><p>{role === 'eaglet' ? 'Eaglet · Level 4' : 'Eagle · Community mentor'}</p></div>
      <button type="button" className="mp-icon-button" aria-label="Edit profile"><ChevronRight aria-hidden="true" /></button>
    </section>
    <section className="mp-section" aria-labelledby="activity-title">
      <h2 id="activity-title">Your activity</h2>
      <div className="mp-grouped-list">
        {[
          [Trophy, 'Achievements', '12 badges'],
          [BookOpen, 'Learning history', '8 completed'],
          [MessageCircle, 'Messages', '2 unread'],
        ].map(([Icon, label, value]) => (
          <button type="button" className="mp-list-row" key={label}>
            <span className="mp-row-icon"><Icon aria-hidden="true" /></span>
            <span className="mp-list-copy"><strong>{label}</strong></span>
            <span className="mp-row-value">{value}</span><ChevronRight aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  </>
);

const MobilePrototypePage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [role, setRole] = useState('eaglet');
  const [accent, setAccent] = useState('emerald');
  const [density, setDensity] = useState('comfortable');
  const [sheet, setSheet] = useState(null);
  const [previewMode, setPreviewMode] = useState('live');

  const selectExperience = (nextRole) => {
    setRole(nextRole);
    setActiveTab(DEFAULT_SCREEN[nextRole]);
  };

  const screen = useMemo(() => {
    const shared = { role, onOpenSheet: () => setSheet('session'), onOpenSettings: () => setSheet('customize') };
    if ((role === 'eaglet' || role === 'eagle') && activeTab === 'home') return <HomeScreen {...shared} />;
    if ((role === 'eaglet' || role === 'eagle') && activeTab === 'learn') return <LearnScreen {...shared} />;
    if ((role === 'eaglet' || role === 'eagle') && activeTab === 'nest') return <NestScreen {...shared} />;
    if ((role === 'eaglet' || role === 'eagle') && activeTab === 'profile') return <ProfileScreen {...shared} />;
    const catalogScreen = getPrototypeScreen(role, activeTab) || getPrototypeScreen(role, DEFAULT_SCREEN[role]);
    return (
      <PrototypeCatalogScreen
        screen={catalogScreen}
        experience={role}
        onBack={() => setActiveTab(DEFAULT_SCREEN[role])}
        onOpenSettings={() => setSheet('customize')}
      />
    );
  }, [activeTab, role]);

  const liveRoute = getPrototypeRoute(role, activeTab);
  const activeScreenLabel = getPrototypeScreen(role, activeTab)?.[1] || 'Application screen';

  return (
    <div className={`mobile-prototype mp-accent-${accent} mp-density-${density}`}>
      <aside className="mp-prototype-notes" aria-label="Prototype controls">
        <div className="mp-brand-lockup"><BrandLogo width={48} height={48} /><div><strong>Eagles &amp; Eaglets</strong><span>iOS-inspired mobile concept</span></div></div>
        <div className="mp-control-block">
          <span>Preview source</span>
          <div className="mp-segmented-control">
            <button type="button" className={previewMode === 'live' ? 'is-selected' : ''} onClick={() => setPreviewMode('live')}>Live app</button>
            <button type="button" className={previewMode === 'concept' ? 'is-selected' : ''} onClick={() => setPreviewMode('concept')}>iOS concept</button>
          </div>
        </div>
        <div className="mp-control-block">
          <span>Experience</span>
          <select className="mp-prototype-select" value={role} onChange={(event) => selectExperience(event.target.value)}>
            <option value="public">Public</option>
            <option value="eaglet">Eaglet</option>
            <option value="eagle">Eagle</option>
            <option value="admin">Admin</option>
            <option value="shared">Shared</option>
          </select>
        </div>
        <div className="mp-control-block">
          <span>Screen ({PROTOTYPE_CATALOG[role].length} in this experience)</span>
          <select className="mp-prototype-select" value={activeTab} onChange={(event) => setActiveTab(event.target.value)}>
            {PROTOTYPE_CATALOG[role].map(([id, label]) => <option value={id} key={id}>{label}</option>)}
          </select>
        </div>
        {previewMode === 'concept' && <div className="mp-control-block">
          <span>Accent</span>
          <div className="mp-color-options">
            {ACCENTS.map((option) => (
              <button type="button" aria-label={`${option.label} accent`} aria-pressed={accent === option.id} key={option.id} style={{ '--swatch': option.color }} onClick={() => setAccent(option.id)}>{accent === option.id && <Check aria-hidden="true" />}</button>
            ))}
          </div>
        </div>}
        {previewMode === 'concept' && <div className="mp-control-block">
          <span>Content spacing</span>
          <div className="mp-segmented-control">
            <button type="button" className={density === 'comfortable' ? 'is-selected' : ''} onClick={() => setDensity('comfortable')}>Comfortable</button>
            <button type="button" className={density === 'compact' ? 'is-selected' : ''} onClick={() => setDensity('compact')}>Compact</button>
          </div>
        </div>}
        <p className="mp-note-copy">{previewMode === 'live' ? 'Live app mode renders the production route itself, so typography, content, responsiveness, and future code changes stay identical.' : 'Concept mode explores the proposed iOS hierarchy, density, role content, and brand accents.'}</p>
      </aside>

      <main className="mp-device-stage">
        <div className="mp-phone" aria-label="Interactive mobile application prototype">
          <div className="mp-status-bar" aria-hidden="true"><span>9:41</span><span><span className="mp-signal">▮▮▮</span> 5G <span className="mp-battery">87</span></span></div>
          {previewMode === 'live' ? (
            <iframe
              key={`${role}-${activeTab}`}
              className="mp-live-frame"
              src={liveRoute}
              title={`Live web app preview: ${activeScreenLabel}`}
            />
          ) : <>
          <div className="mp-app-brand"><BrandLogo width={34} height={34} /><span>E&amp;E</span><span className="mp-role-label">{role}</span></div>
          <div className="mp-scroll-view">{screen}</div>
          <nav className="mp-tab-bar" aria-label="Prototype navigation">
            {NAV_ITEMS[role].map(({ id, label, icon: Icon }) => (
              <button type="button" key={id} className={activeTab === id ? 'is-active' : ''} aria-current={activeTab === id ? 'page' : undefined} onClick={() => setActiveTab(id)}>
                <span><Icon aria-hidden="true" />{id === 'nest' && <i />}</span><small>{label}</small>
              </button>
            ))}
            <button type="button" aria-expanded={sheet === 'catalog'} onClick={() => setSheet('catalog')}>
              <span><MoreHorizontal aria-hidden="true" /></span><small>More</small>
            </button>
          </nav>
          <div className="mp-home-indicator" aria-hidden="true" />

          {sheet && (
            <div className="mp-sheet-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSheet(null)}>
              <section className="mp-bottom-sheet" role="dialog" aria-modal="true" aria-label={sheet === 'customize' ? 'Customize prototype' : 'Session details'}>
                <span className="mp-sheet-grabber" />
                <button type="button" className="mp-sheet-close" aria-label="Close sheet" onClick={() => setSheet(null)}><X aria-hidden="true" /></button>
                {sheet === 'catalog' ? (
                  <>
                    <span className="mp-sheet-icon"><Compass aria-hidden="true" /></span>
                    <h2>All {role} screens</h2>
                    <p>Select any audited screen family to preview its mobile architecture.</p>
                    <div className="mp-screen-picker">
                      {PROTOTYPE_CATALOG[role].map(([id, label, subtitle]) => (
                        <button type="button" key={id} className={activeTab === id ? 'is-selected' : ''} onClick={() => { setActiveTab(id); setSheet(null); }}>
                          <span><strong>{label}</strong><small>{subtitle}</small></span><ChevronRight aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  </>
                ) : sheet === 'customize' ? (
                  <>
                    <span className="mp-sheet-icon"><Settings2 aria-hidden="true" /></span>
                    <h2>Make it yours</h2>
                    <p>Desktop controls remain available beside the device. On mobile, switch the role experience here.</p>
                    <select className="mp-prototype-select mp-sheet-segment" value={role} onChange={(event) => selectExperience(event.target.value)}>
                      <option value="public">Public</option><option value="eaglet">Eaglet</option><option value="eagle">Eagle</option><option value="admin">Admin</option><option value="shared">Shared</option>
                    </select>
                  </>
                ) : (
                  <>
                    <span className="mp-sheet-icon"><CalendarDays aria-hidden="true" /></span>
                    <h2>Your next step is ready</h2>
                    <p>Continue your lesson now or add the upcoming mentor session to your calendar.</p>
                    <button type="button" className="mp-primary-action" onClick={() => setSheet(null)}>Continue <ArrowRight aria-hidden="true" /></button>
                  </>
                )}
              </section>
            </div>
          )}
          </>}
        </div>
      </main>
    </div>
  );
};

export default MobilePrototypePage;
