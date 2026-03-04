/**
 * KYC Redirect Path Utility
 *
 * Shared logic for determining the correct redirect path based on a user's
 * role and KYC status. Used by AuthGuard, GuestGuard, and GoogleCallbackPage
 * to avoid duplicating redirect logic in 3+ places.
 *
 * @param {Object} user - The user object from auth store
 * @returns {string} The path to redirect to
 */
export const getKYCRedirectPath = (user) => {
    // Admin users go directly to admin dashboard
    if (user?.role === 'admin' || user?.is_staff || user?.is_superuser) {
        return '/admin/dashboard';
    }

    const kycStatus = user?.kyc_status;

    // KYC not started or in draft — redirect to profile completion
    if (!kycStatus || kycStatus === 'draft') {
        if (user?.role === 'eagle') return '/mentor-profile';
        if (user?.role === 'eaglet') return '/mentee-profile';
    }

    // KYC submitted or under review — redirect to pending approval
    if (kycStatus === 'submitted' || kycStatus === 'under_review') {
        return '/pending-approval';
    }

    // KYC requires changes — redirect to profile to make updates
    if (kycStatus === 'requires_changes') {
        if (user?.role === 'eagle') return '/mentor-profile';
        if (user?.role === 'eaglet') return '/mentee-profile';
    }

    // KYC rejected — redirect to pending approval (shows rejection message)
    if (kycStatus === 'rejected') {
        return '/pending-approval';
    }

    // KYC approved — redirect to role-specific dashboard
    if (user?.role === 'eagle') return '/eagle/dashboard';
    if (user?.role === 'eaglet') return '/eaglet/dashboard';

    return '/dashboard';
};

export default getKYCRedirectPath;
