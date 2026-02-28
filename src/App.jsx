import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import ErrorBoundary from '@components/ErrorBoundary';

// Lazy load pages for code splitting
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const GoogleCallbackPage = lazy(() => import('./pages/auth/GoogleCallbackPage'));
const KYCWizardPage = lazy(() => import('./pages/kyc/KYCWizardPage'));
const KYCPendingPage = lazy(() => import('./pages/kyc/KYCPendingPage'));
const EagletOnboardingPage = lazy(() => import('./pages/eaglet/EagletOnboardingPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));

// Role-specific Dashboard Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const EagleDashboardPage = lazy(() => import('./pages/eagle/EagleDashboardPage'));
const EagletDashboardPage = lazy(() => import('./pages/eaglet/EagletDashboardPage'));

// Profile Pages (NEW)
const MentorProfilePage = lazy(() => import('./pages/profile/MentorProfilePage'));
const MenteeProfilePage = lazy(() => import('./pages/profile/MenteeProfilePage'));
const PendingApprovalPage = lazy(() => import('./pages/profile/PendingApprovalPage'));

// Admin Pages
const AdminKYCPortalPage = lazy(() => import('./pages/admin/AdminKYCPortalPage'));
const AdminKYCDetailPage = lazy(() => import('./pages/admin/AdminKYCDetailPage'));

// Shared Pages
const ComingSoonPage = lazy(() => import('./pages/shared/ComingSoonPage'));

// Auth Guards
import AuthGuard from './shared/components/guards/AuthGuard';
import RoleGuard from './shared/components/guards/RoleGuard';
import GuestGuard from './shared/components/guards/GuestGuard';
import AdminGuard from './shared/components/guards/AdminGuard';

// Session Management
import InactivityManager from './shared/components/InactivityManager';

// Auth Store
import { useAuthStore } from '@store';

// Profile Redirect Component - redirects to appropriate profile page based on role
const ProfileRedirect = () => {
  const { user } = useAuthStore();

  if (user?.role === 'eagle') {
    return <Navigate to="/mentor-profile" replace />;
  }
  if (user?.role === 'eaglet') {
    return <Navigate to="/mentee-profile" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

// Dashboard Redirect Component - redirects to role-specific dashboard
const DashboardRedirect = () => {
  const { user } = useAuthStore();

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user?.role === 'eagle') {
    return <Navigate to="/eagle/dashboard" replace />;
  }
  if (user?.role === 'eaglet') {
    return <Navigate to="/eaglet/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
};

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-text-secondary">Loading...</p>
    </div>
  </div>
);

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <InactivityManager>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* ============================================================= */}
              {/* PUBLIC ROUTES (Guest Only) */}
              {/* ============================================================= */}
              <Route element={<GuestGuard />}>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Public routes (accessible to all) */}
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

              {/* ============================================================= */}
              {/* PROTECTED ROUTES (Authenticated) */}
              {/* ============================================================= */}
              <Route element={<AuthGuard />}>
                {/* Eagle (Mentor) Only Routes */}
                <Route element={<RoleGuard allowedRoles={['eagle']} />}>
                  <Route path="/kyc" element={<KYCWizardPage />} />
                  <Route path="/kyc/pending" element={<KYCPendingPage />} />
                  <Route path="/mentor-profile" element={<MentorProfilePage />} />
                  {/* Eagle Dashboard */}
                  <Route path="/eagle/dashboard" element={<EagleDashboardPage />} />
                  {/* Eagle Coming Soon Pages */}
                  <Route path="/eagle/nests" element={<ComingSoonPage title="My Nests" description="Manage your mentorship nests, create new groups, and organize your mentees effectively." icon="diversity_3" />} />
                  <Route path="/eagle/eaglets" element={<ComingSoonPage title="My Eaglets" description="View and manage all your mentees, track their progress, and provide guidance." icon="group" />} />
                  <Route path="/eagle/content" element={<ComingSoonPage title="Content Management" description="Upload and manage learning materials, assignments, and resources for your mentees." icon="upload_file" />} />
                  <Route path="/eagle/messages" element={<ComingSoonPage title="Messages" description="Communicate with your mentees through our secure messaging system." icon="chat" />} />
                  <Route path="/eagle/resources" element={<ComingSoonPage title="Resources" description="Access a library of mentorship resources, guides, and best practices." icon="library_books" />} />
                  <Route path="/eagle/settings" element={<ComingSoonPage title="Settings" description="Customize your profile, notification preferences, and account settings." icon="settings" />} />
                </Route>

                {/* Eaglet (Mentee) Only Routes */}
                <Route element={<RoleGuard allowedRoles={['eaglet']} />}>
                  <Route path="/onboarding" element={<EagletOnboardingPage />} />
                  <Route path="/mentee-profile" element={<MenteeProfilePage />} />
                  {/* Eaglet Dashboard */}
                  <Route path="/eaglet/dashboard" element={<EagletDashboardPage />} />
                  {/* Eaglet Coming Soon Pages */}
                  <Route path="/eaglet/nest" element={<ComingSoonPage title="My Nest" description="Join your mentor's nest and connect with fellow mentees on your learning journey." icon="diversity_1" />} />
                  <Route path="/eaglet/assignments" element={<ComingSoonPage title="Assignments" description="View and complete assignments given by your mentor to track your progress." icon="assignment" />} />
                  <Route path="/eaglet/messages" element={<ComingSoonPage title="Messages" description="Communicate with your mentor and fellow mentees through our secure messaging system." icon="chat" />} />
                  <Route path="/eaglet/leaderboard" element={<ComingSoonPage title="Leaderboard" description="See how you rank among your peers and track your achievements." icon="leaderboard" />} />
                  <Route path="/eaglet/resources" element={<ComingSoonPage title="Resources" description="Access learning materials, guides, and resources shared by your mentor." icon="library_books" />} />
                  <Route path="/eaglet/settings" element={<ComingSoonPage title="Settings" description="Customize your profile, notification preferences, and account settings." icon="settings" />} />
                </Route>

                {/* Profile Routes - accessible to both Eagles and Eaglets */}
                <Route path="/complete-profile" element={<ProfileRedirect />} />
                <Route path="/pending-approval" element={<PendingApprovalPage />} />

                {/* Dashboard redirect - directs to role-specific dashboard */}
                <Route path="/dashboard" element={<DashboardRedirect />} />

                {/* Admin Only Routes */}
                <Route element={<AdminGuard />}>
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/kyc" element={<AdminKYCPortalPage />} />
                  <Route path="/admin/kyc/:kycId" element={<AdminKYCDetailPage />} />
                  {/* Admin Coming Soon Pages */}
                  <Route path="/admin/users" element={<ComingSoonPage title="Users Management" description="View, manage, and moderate all platform users including Eagles and Eaglets." icon="group" />} />
                  <Route path="/admin/nests" element={<ComingSoonPage title="Nests Management" description="Oversee all mentorship nests, monitor activity, and ensure quality standards." icon="diversity_3" />} />
                  <Route path="/admin/content" element={<ComingSoonPage title="Content Moderation" description="Review and moderate content uploaded by mentors across the platform." icon="library_books" />} />
                  <Route path="/admin/donations" element={<ComingSoonPage title="Donations" description="Track and manage donations, view reports, and handle financial transactions." icon="volunteer_activism" />} />
                  <Route path="/admin/settings" element={<ComingSoonPage title="Platform Settings" description="Configure platform-wide settings, policies, and system preferences." icon="settings" />} />
                </Route>
              </Route>

              {/* ============================================================= */}
              {/* DEFAULT ROUTES */}
              {/* ============================================================= */}
              {/* Home/Landing - redirect to login for now */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* 404 - Catch all */}
              <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
          </InactivityManager>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
