/**
 * Global State Store
 * Using Zustand for client-side state management
 */

// Re-export all stores
export {
  useAuthStore,
  useAccessStatus,
  useHasActiveProgram,
  useActiveProgram,
  usePendingProgramRequest,
  useMenteeLevel,
  useLockedFeatures,
  useMentorEligibility,
} from './auth-store';
export { useUIStore } from './ui-store';
