import PropTypes from 'prop-types';

/**
 * NestActivityTimeline — renders the NestActivity audit log (admin detail
 * "Activity" tab). Newest-first. Humanizes action_type + target.
 */
const ACTION_META = {
  member_joined: { icon: 'person_add', color: 'text-emerald-600', verb: 'joined the nest' },
  member_left: { icon: 'person_remove', color: 'text-amber-600', verb: 'left the nest' },
  member_removed: { icon: 'person_off', color: 'text-red-500', verb: 'was removed' },
  content_shared: { icon: 'upload_file', color: 'text-blue-600', verb: 'shared content' },
  post_created: { icon: 'forum', color: 'text-primary', verb: 'posted' },
  nest_created: { icon: 'add_circle', color: 'text-emerald-600', verb: 'created the nest' },
  nest_archived: { icon: 'archive', color: 'text-slate-500', verb: 'archived the nest' },
  mentor_action: { icon: 'bolt', color: 'text-amber-600', verb: 'performed an action' },
};

const fmtDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const Row = ({ item }) => {
  const meta = ACTION_META[item.action_type] || ACTION_META.mentor_action;
  const actor = item.actor;
  const actorName = actor?.full_name || `${actor?.first_name || ''} ${actor?.last_name || ''}`.trim() || 'System';
  const initials = `${actor?.first_name?.[0] || ''}${actor?.last_name?.[0] || ''}`.toUpperCase() || 'S';

  return (
    <div className="flex gap-3 p-4 bg-white rounded-xl border border-slate-100">
      {actor?.avatar_url ? (
        <img src={actor.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">{actorName}</span>
            {actor?.role && <span className="text-xs text-slate-400 ml-1.5 capitalize">· {actor.role}</span>}
          </p>
          <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{fmtDate(item.created_at)}</span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
          <span className={`material-symbols-outlined text-[15px] ${meta.color}`}>{meta.icon}</span>
          {meta.verb}
          {item.target ? <span className="font-medium text-slate-700 truncate">— {item.target}</span> : null}
        </p>
      </div>
    </div>
  );
};
Row.propTypes = { item: PropTypes.object.isRequired };

const NestActivityTimeline = ({ items = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">history</span>
        <p className="text-sm text-slate-400">No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Row key={item.id} item={item} />
      ))}
    </div>
  );
};

NestActivityTimeline.propTypes = {
  items: PropTypes.array,
  isLoading: PropTypes.bool,
};

export default NestActivityTimeline;
