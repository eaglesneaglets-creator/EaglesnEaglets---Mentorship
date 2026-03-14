import { useNestMembers, useRemoveMember } from '../hooks/useNests';
import toast from 'react-hot-toast';

const MemberList = ({ nestId, totalMembers, isOwner }) => {
    const { data: membersData, isLoading } = useNestMembers(nestId);
    const members = membersData?.data || [];

    const removeMutation = useRemoveMember(nestId);

    const handleRemove = (e, memberId, firstName) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to remove ${firstName} from this nest?`)) {
            removeMutation.mutate(memberId, {
                onSuccess: () => toast.success(`${firstName} has been removed.`),
                onError: (err) => toast.error(err.message || 'Failed to remove member')
            });
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">Nest Members</h2>
                <a className="text-sm font-medium text-primary hover:underline cursor-pointer">
                    View All ({totalMembers || 0})
                </a>
            </div>

            {isLoading ? (
                <div className="text-center text-sm text-slate-500 py-4">Loading members...</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {members.map((member) => (
                        <div key={member.id} className="relative flex flex-col items-center p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                            {isOwner && member.role !== 'eagle_scout' && (
                                <button
                                    onClick={(e) => handleRemove(e, member.id, member.user_details?.first_name)}
                                    disabled={removeMutation.isPending}
                                    title="Remove Mentee"
                                    className="absolute top-2 right-2 p-1.5 bg-red-100/80 text-red-600 hover:bg-red-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[16px]">person_remove</span>
                                </button>
                            )}
                            <div className="relative">
                                <div className="w-16 h-16 bg-slate-200 bg-center bg-no-repeat bg-cover rounded-full mb-3 ring-2 ring-transparent group-hover:ring-primary/20 transition-all flex items-center justify-center text-slate-500 text-xl font-bold">
                                    {member.user_details?.first_name?.charAt(0)}
                                </div>
                                {member.status === 'active' && (
                                    <div className="absolute bottom-3 right-0 bg-emerald-500 border-2 border-white w-4 h-4 rounded-full" />
                                )}
                                {member.role === 'eagle_scout' && (
                                    <div className="absolute -top-1 -right-1 bg-yellow-100 text-yellow-700 border border-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                                        <span className="material-symbols-outlined text-[14px]">star</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm font-semibold text-slate-900 text-center">
                                {member.user_details?.first_name} {member.user_details?.last_name?.charAt(0)}.
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${member.role === 'eagle_scout'
                                ? 'text-primary/80 bg-primary/10 font-medium'
                                : 'text-slate-500 bg-slate-100'
                                }`}>
                                {member.role === 'member' ? 'Mentee' : 'Eagle Scout'}
                            </span>
                        </div>
                    ))}

                    {members.length === 0 && (
                        <div className="col-span-full text-center text-sm text-slate-500 py-4">No members found.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MemberList;
