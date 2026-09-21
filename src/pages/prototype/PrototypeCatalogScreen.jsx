import {
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  FileCheck2,
  HeartHandshake,
  MessageCircle,
  Package,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
} from 'lucide-react';

const KIND_META = {
  dashboard: { icon: BarChart3, label: 'Overview' },
  list: { icon: Users, label: 'Recent activity' },
  detail: { icon: FileCheck2, label: 'Details' },
  form: { icon: CheckCircle2, label: 'Progress' },
  chat: { icon: MessageCircle, label: 'Conversations' },
  settings: { icon: Settings2, label: 'Preferences' },
  learning: { icon: BookOpen, label: 'Continue learning' },
  store: { icon: ShoppingBag, label: 'Featured' },
  legal: { icon: ShieldCheck, label: 'Key information' },
  profile: { icon: CircleUserRound, label: 'Your identity' },
  community: { icon: HeartHandshake, label: 'Community' },
  grid: { icon: Sparkles, label: 'Collection' },
  success: { icon: CheckCircle2, label: 'All set' },
  auth: { icon: ShieldCheck, label: 'Welcome back' },
  landing: { icon: Sparkles, label: 'Mentorship that moves you forward' },
};

const ROWS_BY_KIND = {
  dashboard: [['Pending actions', '4'], ['Active this week', '128'], ['Completion rate', '86%']],
  list: [['Ama Adu', 'Needs review'], ['Kofi Mensah', 'In progress'], ['The Growth Nest', 'Updated today']],
  detail: [['Overview', 'Verified'], ['Activity', '12 updates'], ['Documents', '3 files']],
  settings: [['Personal information', 'Complete'], ['Notifications', 'On'], ['Privacy & safety', 'Review']],
  learning: [['Communication that connects', '68%'], ['Build your roadmap', '24 min'], ['Turn ideas into action', '15 min']],
  store: [['Community journal', 'GH₵ 85'], ['E&E hoodie', 'GH₵ 240'], ['Mentorship cards', 'GH₵ 60']],
  legal: [['Your responsibilities', 'Read'], ['How data is used', 'Read'], ['Questions and support', 'Open']],
  community: [['Weekly nest circle', 'Sunday'], ['Community reflection', '7 replies'], ['Program milestone', '2 days']],
  grid: [['Leadership', 'Earned'], ['Consistency', 'Earned'], ['Community builder', 'Locked']],
};

export default function PrototypeCatalogScreen({ screen, experience, onBack, onOpenSettings }) {
  const [, title, subtitle, kind] = screen;
  const meta = KIND_META[kind] || KIND_META.detail;
  const Icon = meta.icon;
  const rows = ROWS_BY_KIND[kind] || ROWS_BY_KIND.detail;

  if (kind === 'form' || kind === 'auth') {
    return (
      <div className="mp-catalog-screen">
        <header className="mp-detail-nav"><button type="button" onClick={onBack} aria-label="Back"><ArrowLeft /></button><span>{experience}</span><button type="button" onClick={onOpenSettings} aria-label="Customize"><Settings2 /></button></header>
        <section className="mp-form-intro"><span className="mp-sheet-icon"><Icon /></span><span className="mp-eyebrow">{meta.label}</span><h1>{title}</h1><p>{subtitle}</p></section>
        <div className="mp-prototype-form">
          <label>Full name<input value="Ama Adu" readOnly /></label>
          <label>Email address<input value="ama@example.com" readOnly /></label>
          <label>Tell us more<textarea value="I want to grow my skills and contribute to my community." readOnly /></label>
          <button type="button" className="mp-primary-action">Continue <ChevronRight /></button>
        </div>
      </div>
    );
  }

  if (kind === 'chat') {
    return (
      <div className="mp-catalog-screen">
        <header className="mp-detail-nav"><button type="button" onClick={onBack} aria-label="Back"><ArrowLeft /></button><strong>{title}</strong><button type="button" onClick={onOpenSettings} aria-label="Customize"><Settings2 /></button></header>
        <label className="mp-search-field"><Search /><span className="sr-only">Search conversations</span><input placeholder="Search conversations" /></label>
        <div className="mp-conversation-list">
          {['Kofi Asante', 'The Growth Nest', 'Platform Support'].map((name, index) => <button type="button" className="mp-conversation" key={name}><span className="mp-avatar">{name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span className="mp-list-copy"><strong>{name}</strong><span>{index === 0 ? 'Your next session is confirmed.' : 'Tap to open the conversation'}</span></span>{index === 0 && <i>2</i>}</button>)}
        </div>
      </div>
    );
  }

  if (kind === 'success') {
    return <div className="mp-catalog-screen mp-success-screen"><span className="mp-success-icon"><CheckCircle2 /></span><span className="mp-eyebrow">{meta.label}</span><h1>{title}</h1><p>{subtitle}</p><button type="button" className="mp-primary-action" onClick={onBack}>Return home</button></div>;
  }

  return (
    <div className="mp-catalog-screen">
      <header className="mp-detail-nav"><button type="button" onClick={onBack} aria-label="Back"><ArrowLeft /></button><span>{experience}</span><div><button type="button" aria-label="Notifications"><Bell /></button><button type="button" onClick={onOpenSettings} aria-label="Customize"><Settings2 /></button></div></header>
      <section className={`mp-catalog-hero mp-catalog-hero--${kind}`}><span className="mp-card-kicker"><Icon /> {meta.label}</span><h1>{title}</h1><p>{subtitle}</p>{kind === 'landing' && <button type="button" className="mp-hero-action">Start your journey <ChevronRight /></button>}</section>
      {kind === 'dashboard' && <div className="mp-stat-grid"><article className="mp-stat-card"><strong>1,240</strong><span>Impact points</span></article><article className="mp-stat-card"><strong>86%</strong><span>Completion</span></article></div>}
      <section className="mp-section"><div className="mp-section-heading"><h2>{meta.label}</h2><button type="button" className="mp-text-button">See all</button></div><div className="mp-grouped-list">{rows.map(([label, value], index) => <button type="button" className="mp-list-row" key={label}><span className="mp-row-icon">{kind === 'store' ? <Package /> : <Icon />}</span><span className="mp-list-copy"><strong>{label}</strong><span>{index === 0 ? 'Updated recently' : 'Tap to view details'}</span></span><span className="mp-row-value">{value}</span><ChevronRight /></button>)}</div></section>
    </div>
  );
}
