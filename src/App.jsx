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
// Legacy KYC pages - kept for reference but routes now redirect to new profile pages
// const KYCWizardPage = lazy(() => import('./pages/kyc/KYCWizardPage'));
// const KYCPendingPage = lazy(() => import('./pages/kyc/KYCPendingPage'));
const EagletOnboardingPage = lazy(() => import('./pages/eaglet/EagletOnboardingPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));

// Role-specific Dashboard Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const EagleDashboardPage = lazy(() => import('./pages/eagle/EagleDashboardPage'));
const EagletDashboardPage = lazy(() => import('./pages/eaglet/EagletDashboardPage'));

// Nest Pages
const NestCommunityHubPage = lazy(() => import('./pages/nest/NestCommunityHubPage'));
const NestBrowsePage = lazy(() => import('./pages/nest/NestBrowsePage'));
const NestSettingsPage = lazy(() => import('./pages/nest/NestSettingsPage'));
const GradingCenterPage = lazy(() => import('./pages/eagle/GradingCenterPage'));
const MyEagletsPage = lazy(() => import('./pages/eagle/MyEagletsPage'));
const EagleNestPage = lazy(() => import('./pages/nest/EagleNestPage'));
const EagletNestPage = lazy(() => import('./pages/nest/EagletNestPage'));
const MentorPublicProfilePage = lazy(() => import('./pages/nest/MentorPublicProfilePage'));
const MyRequestsPage = lazy(() => import('./pages/nest/MyRequestsPage'));
const NestJoinDetailPage = lazy(() => import('./pages/nest/NestJoinDetailPage'));
const MentorshipRequestsPage = lazy(() => import('./pages/nest/MentorshipRequestsPage'));

// Content Pages
const LearningCenterPage = lazy(() => import('./pages/content/LearningCenterPage'));
const ContentViewerPage = lazy(() => import('./pages/content/ContentViewerPage'));
const AssignmentDetailPage = lazy(() => import('./pages/content/AssignmentDetailPage'));
const ContentUploadPage = lazy(() => import('./pages/content/ContentUploadPage'));
const ResourceCenterPage = lazy(() => import('./pages/content/ResourceCenterPage'));
const ModuleQuizPage = lazy(() => import('./modules/content/components/ModuleQuizPage'));
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const HomePage = lazy(() => import('./pages/home/HomePage'));

// Points & Leaderboard Pages
const PointsLeaderboardPage = lazy(() => import('./pages/points/PointsLeaderboardPage'));

// Badges Page
const BadgesPage = lazy(() => import('./pages/badges/BadgesPage'));

// Notifications Page
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));

// Chat Page
const ChatPage = lazy(() => import('./pages/chat/ChatPage'));

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
                    {/* Redirect legacy KYC routes to new profile page */}
                    <Route path="/kyc" element={<Navigate to="/mentor-profile" replace />} />
                    <Route path="/kyc/pending" element={<Navigate to="/pending-approval" replace />} />
                    <Route path="/mentor-profile" element={<MentorProfilePage />} />
                    {/* Eagle Dashboard */}
                    <Route path="/eagle/dashboard" element={<EagleDashboardPage />} />
                    {/* Eagle Nests Routes */}
                    <Route path="/eagle/nests" element={<EagleNestPage />} />
                    <Route path="/eagle/grading" element={<GradingCenterPage />} />
                    <Route path="/eagle/nests/:nestId" element={<NestCommunityHubPage />} />
                    <Route path="/eagle/nests/:nestId/settings" element={<NestSettingsPage />} />
                    <Route path="/eagle/nests/:nestId/requests" element={<MentorshipRequestsPage />} />
                    <Route path="/eagle/content" element={<LearningCenterPage />} />
                    <Route path="/eagle/content/upload" element={<ContentUploadPage />} />
                    <Route path="/eagle/content/:moduleId" element={<ContentViewerPage />} />
                    <Route path="/eagle/leaderboard" element={<PointsLeaderboardPage />} />
                    <Route path="/eagle/eaglets" element={<MyEagletsPage />} />
                    <Route path="/eagle/messages" element={<ChatPage />} />
                    <Route path="/eagle/resources" element={<ResourceCenterPage />} />
                    <Route path="/eagle/settings" element={<ComingSoonPage title="Settings" description="Customize your profile, notification preferences, and account settings." icon="settings" />} />
                  </Route>

                  {/* Eaglet (Mentee) Only Routes */}
                  <Route element={<RoleGuard allowedRoles={['eaglet']} />}>
                    <Route path="/onboarding" element={<EagletOnboardingPage />} />
                    <Route path="/mentee-profile" element={<MenteeProfilePage />} />
                    {/* Eaglet Dashboard */}
                    <Route path="/eaglet/dashboard" element={<EagletDashboardPage />} />
                    {/* Eaglet Nests Routes */}
                    <Route path="/eaglet/nest" element={<EagletNestPage />} />
                    <Route path="/eaglet/nest/:nestId" element={<NestCommunityHubPage />} />
                    <Route path="/eaglet/mentor/:nestId" element={<MentorPublicProfilePage />} />
                    <Route path="/eaglet/mentor/:nestId/join" element={<NestJoinDetailPage />} />
                    <Route path="/eaglet/my-requests" element={<MyRequestsPage />} />
                    <Route path="/eaglet/assignments" element={<LearningCenterPage />} />
                    {/* standalone/:itemId must come before :moduleId/:itemId so the literal "standalone" wins */}
                    <Route path="/eaglet/assignments/standalone/:itemId" element={<AssignmentDetailPage />} />
                    <Route path="/eaglet/assignments/:moduleId" element={<ContentViewerPage />} />
                    <Route path="/eaglet/assignments/:moduleId/:itemId" element={<AssignmentDetailPage />} />
                    <Route path="/eaglet/modules/:moduleId/quiz" element={<ModuleQuizPage />} />
                    <Route path="/eaglet/leaderboard" element={<PointsLeaderboardPage />} />
                    <Route path="/eaglet/badges" element={<BadgesPage />} />
                    <Route path="/eaglet/messages" element={<ChatPage />} />
                    <Route path="/eaglet/resources" element={<ResourceCenterPage />} />
                    <Route path="/eaglet/settings" element={<ComingSoonPage title="Settings" description="Customize your profile, notification preferences, and account settings." icon="settings" />} />
                  </Route>

                  {/* Notifications - accessible to all authenticated roles */}
                  <Route path="/notifications" element={<NotificationsPage />} />

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
                    <Route path="/admin/content" element={<LearningCenterPage />} />
                    <Route path="/admin/content/upload" element={<ContentUploadPage />} />
                    <Route path="/admin/donations" element={<ComingSoonPage title="Donations" description="Track and manage donations, view reports, and handle financial transactions." icon="volunteer_activism" />} />
                    <Route path="/admin/settings" element={<ComingSoonPage title="Platform Settings" description="Configure platform-wide settings, policies, and system preferences." icon="settings" />} />
                  </Route>
                </Route>

                {/* ============================================================= */}
                {/* DEFAULT ROUTES */}
                {/* ============================================================= */}
                {/* Home/Landing */}
                <Route path="/" element={<HomePage />} />

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
