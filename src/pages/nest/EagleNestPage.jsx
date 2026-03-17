/**
 * EagleNestPage — Mentor's Nest Landing
 *
 * Eagles own exactly one Nest (auto-created on KYC approval).
 * This page fetches the eagle's nests and:
 *   • If they have a nest  → redirects them straight to its Community Hub
 *   • If no nest yet       → shows a helpful "Pending Setup" state
 */
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import { useNests } from '../../modules/nest/hooks/useNests';

const EagleNestPage = () => {
    const navigate = useNavigate();
    const { data: response, isLoading, isError } = useNests();

    const nests = useMemo(() => response?.data || [], [response]);

    useEffect(() => {
        if (!isLoading && nests.length > 0) {
            // Redirect to the eagle's first (and typically only) nest
            navigate(`/eagle/nests/${nests[0].id}`, { replace: true });
        }
    }, [isLoading, nests, navigate]);

    if (isLoading) {
        return (
            <DashboardLayout variant="eagle">
                <div className="max-w-3xl mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg mb-6 animate-pulse">
                        <span className="material-symbols-outlined text-3xl text-white">diversity_3</span>
                    </div>
                    <p className="text-slate-500 text-lg">Loading your Nest…</p>
                </div>
            </DashboardLayout>
        );
    }

    if (isError) {
        return (
            <DashboardLayout variant="eagle">
                <div className="max-w-3xl mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-3xl text-red-500">error</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Unable to load your Nest</h2>
                    <p className="text-slate-500 text-center">Please try refreshing the page or contact support.</p>
                </div>
            </DashboardLayout>
        );
    }

    // No nest yet — pending approval or hasn't been auto-created
    return (
        <DashboardLayout variant="eagle">
            <div className="max-w-3xl mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-lg mb-6">
                    <span className="material-symbols-outlined text-4xl text-amber-600">nest_cam_wired_stand</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Your Nest is Being Prepared</h2>
                <p className="text-slate-500 text-center max-w-md leading-relaxed">
                    Once your profile is approved by an administrator, your Nest will be
                    automatically created. You&apos;ll be able to manage mentees, share
                    resources, and build your community right here.
                </p>
                <div className="mt-8 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    <span className="font-medium">Awaiting admin approval</span>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EagleNestPage;
