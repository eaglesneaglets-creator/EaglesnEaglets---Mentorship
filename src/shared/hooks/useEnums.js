/**
 * useEnums — single source of truth for BE-owned status enums.
 *
 * Plan 17-01. BE serves /api/v1/enums/ with raw value->label maps plus
 * UI-facing semantic groupings (e.g. enrollment_status_groups.approved =
 * ['active', 'completed']). FE never hardcodes status string sets.
 *
 * Fallback strategy: bundled ENUM_FALLBACKS keep the app functional during
 * BE outages and on first render before /enums/ resolves. BE response always
 * wins when available.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@api';
import { ENUM_FALLBACKS } from '@shared/constants/enumFallbacks';

const ENUMS_QUERY_KEY = ['enums'];

export function useEnums() {
    const query = useQuery({
        queryKey: ENUMS_QUERY_KEY,
        queryFn: async () => {
            const res = await apiClient.get('/enums/');
            return res?.data ?? res;
        },
        // Enums change only at deploy time; session-long cache is fine.
        staleTime: Infinity,
        gcTime: Infinity,
        placeholderData: ENUM_FALLBACKS,
        retry: 1,
    });
    // Always return *something* usable — never undefined.
    return query.data || ENUM_FALLBACKS;
}

/**
 * Pure helper — boolean test "does status belong to groupName bucket?".
 * Useful inside .filter() / .map() where you don't want hook overhead.
 *
 * @param {Object} groupRegistry  e.g. enums.enrollment_status_groups
 * @param {string} status         e.g. 'active'
 * @param {string} groupName      e.g. 'approved'
 */
export function isStatusInGroup(groupRegistry, status, groupName) {
    if (!groupRegistry || !status) return false;
    const bucket = groupRegistry[groupName];
    return Array.isArray(bucket) && bucket.includes(status);
}

/**
 * Convenience hook — returns the bucket name for a status, or 'other' if
 * none matches. Useful when the caller only cares about the bucket label.
 *
 * @param {string} domain  e.g. 'enrollment_status_groups'
 * @param {string} status  e.g. 'active'
 * @returns {string}       'pending' | 'approved' | 'declined' | 'other'
 */
export function useEnumGroup(domain, status) {
    const enums = useEnums();
    return useMemo(() => {
        const registry = enums?.[domain];
        if (!registry || !status) return 'other';
        for (const [bucket, values] of Object.entries(registry)) {
            if (Array.isArray(values) && values.includes(status)) return bucket;
        }
        return 'other';
    }, [enums, domain, status]);
}
