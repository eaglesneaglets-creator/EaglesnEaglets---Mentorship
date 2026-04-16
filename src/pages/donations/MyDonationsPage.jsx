/**
 * MyDonationsPage
 *
 * Authenticated user's donation history.
 * Protected by AuthGuard in App.jsx.
 */

import { Link } from 'react-router-dom';
import { useMyDonations } from '@modules/donations/hooks/useDonations';

const STATUS_STYLES = {
  success: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-700',
};

const FREQUENCY_LABELS = {
  once: 'One-time',
  weekly: 'Weekly',
  monthly: 'Monthly',
  annually: 'Annual',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function MyDonationsPage() {
  const { data, isLoading, isError } = useMyDonations();
  const donations = data?.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
            <p className="text-sm text-gray-500 mt-1">Your giving history</p>
          </div>
          <Link
            to="/donations"
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Donate Again
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600 text-sm">
            Unable to load your donations. Please try again.
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && donations.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center space-y-4">
            <span className="text-6xl">🤲</span>
            <h3 className="text-lg font-semibold text-gray-900">No donations yet</h3>
            <p className="text-gray-500 text-sm">
              Your giving journey starts with a single step.
            </p>
            <Link
              to="/donations"
              className="inline-block bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Browse Campaigns
            </Link>
          </div>
        )}

        {/* Donation table */}
        {donations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Campaign
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Frequency
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation, idx) => (
                    <tr
                      key={donation.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        idx === donations.length - 1 ? 'border-0' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {donation.campaign_title}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        GHS {Number(donation.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {FREQUENCY_LABELS[donation.frequency] ?? donation.frequency}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            STATUS_STYLES[donation.status] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(donation.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
              {donations.length} donation{donations.length !== 1 ? 's' : ''} total
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
