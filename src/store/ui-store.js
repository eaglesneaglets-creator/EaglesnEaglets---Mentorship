/**
 * UI Store
 * Manages global UI state with Zustand
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useUIStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Sidebar state
        sidebarOpen: true,
        sidebarCollapsed: false,

        // Theme
        theme: 'light',

        // Notifications
        notifications: [],
        unreadNotificationCount: 0,

        // Loading states
        globalLoading: false,
        loadingMessage: '',

        // Toast/Alert messages
        toasts: [],

        // Modal state
        activeModal: null,
        modalProps: {},

        // ========== Sidebar Actions ==========
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        setSidebarOpen: (open) => set({ sidebarOpen: open }),

        toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

        // ========== Theme Actions ==========
        setTheme: (theme) => {
          set({ theme });
          // Apply theme to document
          if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(theme);
          }
        },

        toggleTheme: () => {
          const newTheme = get().theme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },

        // ========== Loading Actions ==========
        setGlobalLoading: (loading, message = '') =>
          set({ globalLoading: loading, loadingMessage: message }),

        // ========== Toast/Alert Actions ==========
        addToast: (toast) => {
          const id = Date.now().toString();
          const newToast = {
            id,
            type: 'info',
            duration: 5000,
            ...toast,
          };

          set((state) => ({
            toasts: [...state.toasts, newToast],
          }));

          // Auto-remove toast after duration
          if (newToast.duration > 0) {
            setTimeout(() => {
              get().removeToast(id);
            }, newToast.duration);
          }

          return id;
        },

        removeToast: (id) =>
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          })),

        clearToasts: () => set({ toasts: [] }),

        // Convenience toast methods
        showSuccess: (message, options = {}) =>
          get().addToast({ type: 'success', message, ...options }),

        showError: (message, options = {}) =>
          get().addToast({ type: 'error', message, duration: 7000, ...options }),

        showWarning: (message, options = {}) =>
          get().addToast({ type: 'warning', message, ...options }),

        showInfo: (message, options = {}) =>
          get().addToast({ type: 'info', message, ...options }),

        // ========== Modal Actions ==========
        openModal: (modalId, props = {}) =>
          set({ activeModal: modalId, modalProps: props }),

        closeModal: () => set({ activeModal: null, modalProps: {} }),

        // ========== Notification Actions ==========
        setNotifications: (notifications) =>
          set({
            notifications,
            unreadNotificationCount: notifications.filter((n) => !n.read).length,
          }),

        addNotification: (notification) =>
          set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadNotificationCount: state.unreadNotificationCount + 1,
          })),

        markNotificationRead: (id) =>
          set((state) => {
            const notifications = state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            );
            return {
              notifications,
              unreadNotificationCount: notifications.filter((n) => !n.read).length,
            };
          }),

        markAllNotificationsRead: () =>
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadNotificationCount: 0,
          })),

        clearNotifications: () =>
          set({ notifications: [], unreadNotificationCount: 0 }),
      }),
      {
        name: 'ui-storage',
        // Only persist theme and sidebar state
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('ui-storage');
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme);
      if (parsed.state?.theme) {
        document.documentElement.classList.add(parsed.state.theme);
      }
    } catch {
      // Ignore parsing errors
    }
  }
}
