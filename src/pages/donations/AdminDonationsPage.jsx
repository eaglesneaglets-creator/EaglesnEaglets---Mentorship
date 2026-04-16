/**
 * AdminDonationsPage
 *
 * Wraps DonationAnalytics in the platform's DashboardLayout.
 * Accessible at /admin/donations (AdminGuard protected).
 */

import DashboardLayout from '@shared/components/layout/DashboardLayout';
import DonationAnalytics from '@modules/donations/components/DonationAnalytics';

export default function AdminDonationsPage() {
  return (
    <DashboardLayout>
      <DonationAnalytics />
    </DashboardLayout>
  );
}
