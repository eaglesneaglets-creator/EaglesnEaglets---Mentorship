import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@api', () => ({
    apiClient: { get: vi.fn() },
}));

import { apiClient } from '@api';
import { useEnums, useEnumGroup, isStatusInGroup } from './useEnums';
import { ENUM_FALLBACKS } from '@shared/constants/enumFallbacks';

const wrapper = ({ children }) => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('isStatusInGroup', () => {
    it('returns true when status is in the named bucket', () => {
        expect(
            isStatusInGroup(ENUM_FALLBACKS.enrollment_status_groups, 'active', 'approved')
        ).toBe(true);
    });

    it('returns false when status is in a different bucket', () => {
        expect(
            isStatusInGroup(ENUM_FALLBACKS.enrollment_status_groups, 'pending', 'approved')
        ).toBe(false);
    });

    it('returns false when groupRegistry missing', () => {
        expect(isStatusInGroup(null, 'active', 'approved')).toBe(false);
    });
});

describe('useEnums', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns fallback on fetch error', async () => {
        apiClient.get.mockRejectedValue(new Error('boom'));
        const { result } = renderHook(() => useEnums(), { wrapper });
        // Even on error the hook never returns undefined — it falls back.
        await waitFor(() => {
            expect(result.current).toBeDefined();
            expect(result.current.enrollment_status).toEqual(ENUM_FALLBACKS.enrollment_status);
        });
    });

    it('returns server data on success', async () => {
        const serverData = {
            enrollment_status: { pending: 'P', active: 'A' },
            enrollment_status_groups: { pending: ['pending'], approved: ['active'] },
        };
        apiClient.get.mockResolvedValue({ data: serverData });
        const { result } = renderHook(() => useEnums(), { wrapper });
        await waitFor(() => {
            expect(result.current.enrollment_status).toEqual(serverData.enrollment_status);
        });
    });
});

describe('useEnumGroup', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns bucket name when status matches', async () => {
        apiClient.get.mockResolvedValue({ data: ENUM_FALLBACKS });
        const { result } = renderHook(
            () => useEnumGroup('enrollment_status_groups', 'completed'),
            { wrapper },
        );
        await waitFor(() => {
            expect(result.current).toBe('approved');
        });
    });

    it("returns 'other' when status not in any bucket", async () => {
        apiClient.get.mockResolvedValue({ data: ENUM_FALLBACKS });
        const { result } = renderHook(
            () => useEnumGroup('enrollment_status_groups', 'mystery_status'),
            { wrapper },
        );
        await waitFor(() => {
            expect(result.current).toBe('other');
        });
    });
});
