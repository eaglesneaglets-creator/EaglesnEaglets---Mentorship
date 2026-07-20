import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { categoryMeta, statusMeta } from './nestMeta';

/**
 * NestCard — a single nest tile for the admin list. Supports two layouts:
 * `variant="grid"` (default, matches the supplied sample) and `variant="list"`
 * (compact row). Emerald theme; category-colored header band.
 */
const StatusPill = ({ status }) => {
  const s = statusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};
StatusPill.propTypes = { status: PropTypes.string };

const MemberStack = ({ members = [], count, max }) => {
  const shown = members.slice(0, 3);
  return (
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[16px] text-slate-400">group</span>
      <div className="flex -space-x-2">
        {shown.map((m, i) => {
          const u = m.user || m;
          const initials = `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase() || '?';
          return u.avatar_url ? (
            <img key={u.id || i} src={u.avatar_url} alt="" className="w-6 h-6 rounded-full ring-2 ring-white object-cover" />
          ) : (
            <div key={u.id || i} className="w-6 h-6 rounded-full ring-2 ring-white bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center">
              {initials}
            </div>
          );
        })}
      </div>
      <span className="text-xs font-semibold text-slate-500 tabular-nums">
        {count}{max ? `/${max}` : ''}{count >= max && max ? ' (Full)' : ''}
      </span>
    </div>
  );
};
MemberStack.propTypes = { members: PropTypes.array, count: PropTypes.number, max: PropTypes.number };

const NestCard = ({ nest, variant = 'grid' }) => {
  const cat = categoryMeta(nest.category);
  const eagleName = nest.eagle?.full_name || `${nest.eagle?.first_name || ''} ${nest.eagle?.last_name || ''}`.trim();
  const pct = nest.max_members ? Math.min(100, Math.round(((nest.member_count || 0) / nest.max_members) * 100)) : 0;

  if (variant === 'list') {
    return (
      <Link
        to={`/admin/nests/${nest.id}`}
        className="group flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-primary/40 hover:shadow-md transition-all"
      >
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center flex-shrink-0`}>
          <span className="material-symbols-outlined text-white text-xl">{cat.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{nest.name}</p>
            <StatusPill status={nest.status} />
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">Eagle: {eagleName || '—'}</p>
        </div>
        <MemberStack members={nest.members} count={nest.member_count || 0} max={nest.max_members} />
        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward_ios</span>
      </Link>
    );
  }

  return (
    <div className="group flex flex-col rounded-2xl bg-white border border-slate-200 overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all">
      {/* Gradient header band */}
      <div className={`relative h-24 bg-gradient-to-br ${cat.gradient}`}>
        <div className="absolute top-3 right-3">
          <StatusPill status={nest.status} />
        </div>
        <div className="absolute -bottom-5 left-5 w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center">
          <span className={`material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-br ${cat.gradient}`} style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text' }}>
            {cat.icon}
          </span>
        </div>
      </div>

      <div className="pt-8 px-5 pb-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-primary transition-colors">{nest.name}</h3>
        <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 flex-1">{nest.description || 'No description.'}</p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
            <span className="text-slate-400">Eagle</span>
            <span className="font-semibold text-slate-700 ml-auto truncate">{eagleName || '—'}</span>
          </div>
          <MemberStack members={nest.members} count={nest.member_count || 0} max={nest.max_members} />
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full bg-gradient-to-r ${cat.gradient}`} style={{ width: `${pct}%` }} />
        </div>

        <Link
          to={`/admin/nests/${nest.id}`}
          className="mt-4 w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
        >
          View Nest
        </Link>
      </div>
    </div>
  );
};

NestCard.propTypes = {
  nest: PropTypes.object.isRequired,
  variant: PropTypes.oneOf(['grid', 'list']),
};

export default NestCard;
