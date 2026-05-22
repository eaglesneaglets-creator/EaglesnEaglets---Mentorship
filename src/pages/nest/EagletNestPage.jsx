/**
 * EagletNestPage — tabbed home for mentee program lifecycle (plan 14-05 T5).
 *
 * Tabs (visibility driven by access_status):
 *   - My Program  : always shown
 *   - Discover    : hidden when has_active_program OR pending_program_request
 *   - Requests    : always shown
 *
 * Default tab: My Program if active, else Discover, else Requests.
 */
import { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../shared/components/layout/DashboardLayout';
import TabBar from '../../shared/components/ui/TabBar';
import { useHasActiveProgram, usePendingProgramRequest, useAuthStore } from '@store';
import MyProgramTab from './MyProgramTab';
import DiscoverNestsTab from './DiscoverNestsTab';
import RequestsTab from './RequestsTab';

const EagletNestPage = () => {
    const hasActive = useHasActiveProgram();
    const pending = usePendingProgramRequest();
    const refreshAccessStatus = useAuthStore((s) => s.refreshAccessStatus);
    const queryClient = useQueryClient();

    // Mentor approvals happen out-of-band — pull fresh access_status + invalidate
    // request list on mount and on window focus so the UI reflects them.
    useEffect(() => {
        const refresh = () => {
            refreshAccessStatus?.();
            queryClient.invalidateQueries({ queryKey: ['nests', 'my-requests'] });
        };
        refresh();
        window.addEventListener('focus', refresh);
        return () => window.removeEventListener('focus', refresh);
    }, [refreshAccessStatus, queryClient]);

    const tabs = useMemo(() => {
        const list = [{ value: 'program', label: 'My Program', icon: 'workspaces' }];
        if (!hasActive && !pending) {
            list.push({ value: 'discover', label: 'Discover', icon: 'explore' });
        }
        list.push({ value: 'requests', label: 'Requests', icon: 'mail' });
        return list;
    }, [hasActive, pending]);

    const defaultTab = hasActive ? 'program' : (!pending ? 'discover' : 'requests');
    const [activeTab, setActiveTab] = useState(defaultTab);

    // If access_status changes and current tab is no longer visible, snap back.
    const visibleValues = tabs.map(t => t.value);
    const safeActive = visibleValues.includes(activeTab) ? activeTab : defaultTab;

    const handleSwitch = (next) => {
        if (visibleValues.includes(next)) setActiveTab(next);
    };

    return (
        <DashboardLayout variant="eaglet">
            <div className="flex flex-col gap-6 min-h-full">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Nest</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Your program, mentor discovery, and request history in one place.
                    </p>
                </div>

                <TabBar tabs={tabs} activeTab={safeActive} onChange={setActiveTab} />

                <div className="mt-2">
                    {safeActive === 'program' && <MyProgramTab onSwitchTab={handleSwitch} />}
                    {safeActive === 'discover' && <DiscoverNestsTab />}
                    {safeActive === 'requests' && <RequestsTab />}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EagletNestPage;
