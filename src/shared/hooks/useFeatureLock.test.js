import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@store/auth-store', () => ({
    useAuthStore: vi.fn(),
    useLockedFeatures: vi.fn(),
}));

import { useAuthStore, useLockedFeatures } from '@store/auth-store';
import { useFeatureLock } from './useFeatureLock';

const mockStore = (role, { accessStatusLoaded = true } = {}) => {
    // useAuthStore is called as useAuthStore(selector); selector receives state.
    // accessStatus must be a non-null object (even empty {}) to count as loaded,
    // otherwise the hook pessimistically defaults to locked for eaglets.
    const state = {
        user: role ? { role } : null,
        accessStatus: accessStatusLoaded ? {} : null,
    };
    useAuthStore.mockImplementation((selector) => selector(state));
};
const mockRole = mockStore; // backwards-compat alias for existing tests

describe('useFeatureLock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns isLocked=true when role is eaglet and feature is in locked_features', () => {
        mockRole('eaglet');
        useLockedFeatures.mockReturnValue(['assignments', 'messages', 'resources']);

        const { result } = renderHook(() => useFeatureLock('assignments'));
        expect(result.current.isLocked).toBe(true);
    });

    it('returns isLocked=false for eagle role even if feature listed', () => {
        mockRole('eagle');
        useLockedFeatures.mockReturnValue(['assignments']);

        const { result } = renderHook(() => useFeatureLock('assignments'));
        expect(result.current.isLocked).toBe(false);
    });

    it('returns isLocked=false for admin role', () => {
        mockRole('admin');
        useLockedFeatures.mockReturnValue(['messages']);

        const { result } = renderHook(() => useFeatureLock('messages'));
        expect(result.current.isLocked).toBe(false);
    });

    it('returns isLocked=false for eaglet when feature not in locked list', () => {
        mockRole('eaglet');
        useLockedFeatures.mockReturnValue([]);

        const { result } = renderHook(() => useFeatureLock('assignments'));
        expect(result.current.isLocked).toBe(false);
    });

    it('reports isChecking=true (NOT isLocked) for eaglet when accessStatus has not loaded yet', () => {
        mockStore('eaglet', { accessStatusLoaded: false });
        useLockedFeatures.mockReturnValue([]);

        const { result } = renderHook(() => useFeatureLock('assignments'));
        // Separate "checking" from "locked" — callers render a neutral loader
        // instead of the lock modal so users with access don't see a flash.
        expect(result.current.isChecking).toBe(true);
        expect(result.current.isLocked).toBe(false);
    });

    it('isChecking=false for eagle/admin even when accessStatus has not loaded', () => {
        mockStore('eagle', { accessStatusLoaded: false });
        useLockedFeatures.mockReturnValue([]);

        const { result } = renderHook(() => useFeatureLock('assignments'));
        expect(result.current.isChecking).toBe(false);
        expect(result.current.isLocked).toBe(false);
    });

    it('isChecking=false for eaglet on a non-gated feature key', () => {
        mockStore('eaglet', { accessStatusLoaded: false });
        useLockedFeatures.mockReturnValue([]);

        const { result } = renderHook(() => useFeatureLock('unknown_key'));
        expect(result.current.isChecking).toBe(false);
        expect(result.current.isLocked).toBe(false);
    });

    it('toggles modal open/close state', () => {
        mockRole('eaglet');
        useLockedFeatures.mockReturnValue(['assignments']);

        const { result } = renderHook(() => useFeatureLock('assignments'));
        expect(result.current.modalOpen).toBe(false);

        act(() => result.current.openLockModal());
        expect(result.current.modalOpen).toBe(true);

        act(() => result.current.closeLockModal());
        expect(result.current.modalOpen).toBe(false);
    });
});
