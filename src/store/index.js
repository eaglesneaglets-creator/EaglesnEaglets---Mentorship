/**
 * Global State Store
 * Using Zustand for client-side state management
 */

// Re-export all stores
export {
  useAuthStore,
  useHasActiveProgram,
  useActiveProgram,
  usePendingProgramRequest,
  useMenteeLevel,
  useLockedFeatures,
  useMentorEligibility,
  useMentorApplicationStatus,
  useMentorApplicationEligible,
  useCurrentMode,
  useSetCurrentMode,
  useIsStackedAdmin,
} from './auth-store';
