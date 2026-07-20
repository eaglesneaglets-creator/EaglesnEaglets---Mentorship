import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '@shared/components/ui/ConfirmModal';
import { useRemoveNestMember } from '../hooks/useAdminNests';

/**
 * NestMembersPanel — Eagle + Eaglets list with Message + Remove per row.
 * Message deep-links the admin chat (?user=). Remove goes through a confirm.
 */
const MemberRow = ({ membership, isOwner, onMessage, onRemove }) => {
  const u = membership.user || membership;
  const name = u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim();
  const initials = `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase() || '?';

  return (
    <div className="flex items-center gap-3 py-2.5">
      {u.avatar_url ? (
        <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
        <p className="text-[11px] text-slate-400 capitalize">{u.role}{isOwner ? ' · Owner' : ''}</p>
      </div>
      <button
        type="button"
        onClick={() => onMessage(u.id)}
        className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
      >
        Message
      </button>
      {!isOwner && (
        <button
          type="button"
          onClick={() => onRemove(membership)}
          className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
        >
          Remove
        </button>
      )}
    </div>
  );
};
MemberRow.propTypes = {
  membership: PropTypes.object.isRequired,
  isOwner: PropTypes.bool,
  onMessage: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

const NestMembersPanel = ({ nestId, ownerId, members = [] }) => {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(null);
  const removeMutation = useRemoveNestMember();

  const eagle = members.find((m) => (m.user?.id || m.id) === ownerId);
  const eaglets = members.filter((m) => (m.user?.id || m.id) !== ownerId);

  // 27-03 will replace with a real /admin/messages?user= deep-link. Ship the
  // navigate now so the button works the moment messaging lands; the route is
  // added in 27-03.
  const handleMessage = (userId) => navigate(`/admin/messages?user=${userId}`);

  const handleRemove = (membership) => {
    const u = membership.user || membership;
    const name = u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim();
    setConfirm({
      title: 'Remove member?',
      message: `Remove ${name} from this nest? They will lose access to the community.`,
      confirmLabel: 'Remove',
      variant: 'danger',
      onConfirm: () => removeMutation.mutate({ nestId, membershipId: membership.id }),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-bold text-slate-900 mb-3">Members</h3>

      {eagle && (
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Eagle</p>
          <MemberRow membership={eagle} isOwner onMessage={handleMessage} onRemove={handleRemove} />
        </div>
      )}

      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
        Eaglets {eaglets.length > 0 && <span className="text-slate-300">({eaglets.length})</span>}
      </p>
      {eaglets.length === 0 ? (
        <p className="text-sm text-slate-400 py-3">No eaglets yet.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {eaglets.map((m) => (
            <MemberRow key={m.id} membership={m} onMessage={handleMessage} onRemove={handleRemove} />
          ))}
        </div>
      )}

      <ConfirmModal config={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
};

NestMembersPanel.propTypes = {
  nestId: PropTypes.string.isRequired,
  ownerId: PropTypes.string,
  members: PropTypes.array,
};

export default NestMembersPanel;
