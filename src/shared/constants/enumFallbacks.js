/**
 * Hardcoded fallback values used when /api/v1/enums/ is unreachable.
 *
 * Must match Backend/core/enums.py at write time. Drift here is okay —
 * the BE response always wins when available. This file only guarantees
 * the FE renders sensible labels during BE downtime or before first fetch.
 *
 * If a BE enum changes and you're seeing stale labels in the FE during
 * a network failure, update the matching key here.
 */
export const ENUM_FALLBACKS = {
    enrollment_status: {
        pending: 'Pending',
        active: 'Active',
        completed: 'Completed',
        released: 'Released',
        opted_out: 'Opted Out',
        rejected: 'Rejected',
    },
    enrollment_status_groups: {
        pending: ['pending'],
        approved: ['active', 'completed'],
        declined: ['rejected', 'released', 'opted_out'],
    },
    program_status: {
        draft: 'Draft',
        active: 'Active',
        archived: 'Archived',
    },
    exit_request_status: {
        pending: 'Pending',
        approved: 'Approved',
        denied: 'Denied',
    },
    membership_status: {
        active: 'Active',
        inactive: 'Inactive',
    },
    mentorship_request_status: {
        pending: 'Pending',
        approved: 'Approved',
        declined: 'Declined',
    },
    kyc_status: {
        draft: 'Draft',
        submitted: 'Submitted',
        under_review: 'Under Review',
        approved: 'Approved',
        rejected: 'Rejected',
        requires_changes: 'Requires Changes',
    },
    kyc_status_groups: {
        pending: ['submitted', 'under_review'],
        approved: ['approved'],
        declined: ['rejected', 'requires_changes'],
    },
    mentee_kyc_status: {
        draft: 'Draft',
        submitted: 'Submitted',
        under_review: 'Under Review',
        approved: 'Approved',
        rejected: 'Rejected',
        requires_changes: 'Requires Changes',
    },
    mentee_kyc_status_groups: {
        pending: ['submitted', 'under_review'],
        approved: ['approved'],
        declined: ['rejected', 'requires_changes'],
    },
};
