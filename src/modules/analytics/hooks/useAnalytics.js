import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AnalyticsService from '../services/analytics-service';

export const analyticsKeys = {
    all: ['analytics'],
    eagleDashboard: () => [...analyticsKeys.all, 'eagle-dashboard'],
    eagletDashboard: () => [...analyticsKeys.all, 'eaglet-dashboard'],
    adminDashboard: () => [...analyticsKeys.all, 'admin-dashboard'],
    nest: (nestId) => [...analyticsKeys.all, 'nest', nestId],
};

export const useEagleDashboardStats = () => {
    return useQuery({
        queryKey: analyticsKeys.eagleDashboard(),
        queryFn: async () => {
            const response = await AnalyticsService.getEagleDashboard();
            return response.data;
        },
    });
};

export const useEagletDashboardStats = () => {
    return useQuery({
        queryKey: analyticsKeys.eagletDashboard(),
        queryFn: async () => {
            const response = await AnalyticsService.getEagletDashboard();
            return response.data;
        },
    });
};

export const useAdminDashboardStats = () => {
    return useQuery({
        queryKey: analyticsKeys.adminDashboard(),
        queryFn: async () => {
            const response = await AnalyticsService.getAdminDashboard();
            return response.data;
        },
    });
};

export const useNestAnalytics = (nestId) => {
    return useQuery({
        queryKey: analyticsKeys.nest(nestId),
        queryFn: async () => {
            const response = await AnalyticsService.getNestAnalytics(nestId);
            return response.data;
        },
        enabled: !!nestId,
    });
};

export const useCheckIn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => AnalyticsService.dailyCheckIn(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: analyticsKeys.eagletDashboard() });
        },
    });
};
