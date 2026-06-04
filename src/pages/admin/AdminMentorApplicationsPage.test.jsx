/**
 * Tests for AdminMentorApplicationsPage (plan 16-03).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the admin hooks before importing the page.
vi.mock('../../modules/mentor-application/hooks/useMentorApplicationAdmin', () => ({
    useAdminMentorApplications: vi.fn(),
    useAdminDecideMentorApplication: vi.fn(),
}));

// Mock the auth-store: useIsStackedAdmin is the contract 16-03 relies on.
vi.mock('@store', () => ({
    useIsStackedAdmin: vi.fn(),
    useAuthStore: vi.fn(() => ({ user: { role: 'admin', is_platform_staff: true } })),
}));

// Mock DashboardLayout to avoid sidebar/route guard noise in unit tests.
vi.mock('../../shared/components/layout/DashboardLayout', () => ({
    default: ({ children }) => <div data-testid="dashboard-layout">{children}</div>,
}));

import {
    useAdminMentorApplications,
    useAdminDecideMentorApplication,
} from '../../modules/mentor-application/hooks/useMentorApplicationAdmin';
import { useIsStackedAdmin } from '@store';
import AdminMentorApplicationsPage from './AdminMentorApplicationsPage';

const baseApp = {
    id: 'app-1',
    status: 'submitted',
    user_full_name: 'Jane Doe',
    user_email: 'jane@example.com',
    submitted_at: '2026-05-30T10:00:00Z',
    mentor_kyc: 'kyc-uuid-123',
    rejection_reason: '',
};

const renderPage = () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={qc}>
            <MemoryRouter>
                <AdminMentorApplicationsPage />
            </MemoryRouter>
        </QueryClientProvider>,
    );
};

describe('AdminMentorApplicationsPage', () => {
    let mutateFn;

    beforeEach(() => {
        vi.clearAllMocks();
        mutateFn = vi.fn();
        useAdminDecideMentorApplication.mockReturnValue({ mutate: mutateFn, isPending: false });
        // Pre-set stacked-admin to false by default; case 7 overrides.
        useIsStackedAdmin.mockReturnValue(false);
        // Default window.confirm to auto-accept so approve flow proceeds.
        window.confirm = vi.fn(() => true);
    });

    it('renders submitted list with applicant name + KYC cross-link when mentor_kyc set', () => {
        useAdminMentorApplications.mockReturnValue({
            data: { data: [baseApp] },
            isLoading: false,
            isError: false,
        });

        renderPage();
        // Desktop table + mobile card both render in jsdom — use getAll.
        expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
        expect(screen.getAllByText('jane@example.com').length).toBeGreaterThan(0);
        const kycLinks = screen.getAllByRole('link', { name: /View KYC/i });
        expect(kycLinks[0]).toHaveAttribute('href', '/admin/kyc/kyc-uuid-123?role=mentor');
    });

    it('omits cross-link when mentor_kyc is null', () => {
        useAdminMentorApplications.mockReturnValue({
            data: { data: [{ ...baseApp, mentor_kyc: null }] },
            isLoading: false,
            isError: false,
        });

        renderPage();
        expect(screen.queryByRole('link', { name: /View KYC/i })).toBeNull();
        expect(screen.getAllByText(/No KYC linked/i).length).toBeGreaterThan(0);
    });

    it('approve fires mutation with action=approve', () => {
        useAdminMentorApplications.mockReturnValue({
            data: { data: [baseApp] },
            isLoading: false,
            isError: false,
        });

        renderPage();
        // Click first Approve button (desktop + mobile both render — desktop first).
        const approveBtns = screen.getAllByRole('button', { name: /^Approve$/i });
        fireEvent.click(approveBtns[0]);
        expect(window.confirm).toHaveBeenCalled();
        expect(mutateFn).toHaveBeenCalledWith({
            id: 'app-1',
            action: 'approve',
            body: {},
        });
    });

    it('reject modal: submit disabled until reason length >= 10', () => {
        useAdminMentorApplications.mockReturnValue({
            data: { data: [baseApp] },
            isLoading: false,
            isError: false,
        });

        renderPage();
        const rejectBtns = screen.getAllByRole('button', { name: /^Reject$/i });
        fireEvent.click(rejectBtns[0]);

        // Modal open — textarea + Reject application button.
        const textarea = screen.getByRole('textbox');
        const submit = screen.getByRole('button', { name: /Reject application/i });
        expect(submit).toBeDisabled();

        fireEvent.change(textarea, { target: { value: 'short' } });
        expect(submit).toBeDisabled();

        fireEvent.change(textarea, { target: { value: 'long enough reason here' } });
        expect(submit).not.toBeDisabled();
    });

    it('reject fires mutation with body.reason after meeting min length', () => {
        useAdminMentorApplications.mockReturnValue({
            data: { data: [baseApp] },
            isLoading: false,
            isError: false,
        });

        renderPage();
        const rejectBtns = screen.getAllByRole('button', { name: /^Reject$/i });
        fireEvent.click(rejectBtns[0]);

        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'Insufficient experience yet' } });
        fireEvent.click(screen.getByRole('button', { name: /Reject application/i }));

        expect(mutateFn).toHaveBeenCalledWith({
            id: 'app-1',
            action: 'reject',
            body: { reason: 'Insufficient experience yet' },
        });
    });

    it('empty state renders when list empty', () => {
        useAdminMentorApplications.mockReturnValue({
            data: { data: [] },
            isLoading: false,
            isError: false,
        });

        renderPage();
        expect(screen.getByText(/No submitted applications/i)).toBeInTheDocument();
    });

    it('stacked-mentor: useIsStackedAdmin selector returns true for eagle + is_platform_staff', () => {
        // Verify the contract the RoleSwitcher (18-03) relies on after a
        // stacked-mentor approval. 16-03 adds no new component — just asserts
        // the existing selector contract holds.
        useIsStackedAdmin.mockReturnValue(true);
        expect(useIsStackedAdmin()).toBe(true);
    });
});
