import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PointsService from '../services/points-service';
import toast from 'react-hot-toast';

export const pointsKeys = {
    all: ['points'],
    myPoints: () => [...pointsKeys.all, 'my'],
    transactions: () => [...pointsKeys.all, 'transactions'],
    leaderboard: (params) => [...pointsKeys.all, 'leaderboard', params],
    badges: () => [...pointsKeys.all, 'badges'],
    myBadges: () => [...pointsKeys.badges(), 'my'],
};

// --- View Hooks ---

export const useMyPoints = () => {
    return useQuery({
        queryKey: pointsKeys.myPoints(),
        queryFn: () => PointsService.getMyPoints(),
    });
};

export const useTransactions = (params) => {
    return useQuery({
        queryKey: [...pointsKeys.transactions(), params],
        queryFn: () => PointsService.getTransactions(params),
    });
};

export const useLeaderboard = (params) => {
    return useQuery({
        queryKey: pointsKeys.leaderboard(params),
        queryFn: () => PointsService.getLeaderboard(params),
    });
};

export const useBadges = () => {
    return useQuery({
        queryKey: pointsKeys.badges(),
        queryFn: () => PointsService.getBadges(),
    });
};

export const useAllBadges = () => {
    return useQuery({
        queryKey: pointsKeys.badges(),
        queryFn: () => PointsService.getBadges(),
        staleTime: 5 * 60 * 1000, // badges list rarely changes
    });
};

export const useBadgeDetail = (id) => {
    return useQuery({
        queryKey: [...pointsKeys.badges(), id],
        queryFn: () => PointsService.getBadgeDetail(id),
        enabled: !!id,
    });
};

export const useMyBadges = () => {
    return useQuery({
        queryKey: pointsKeys.myBadges(),
        queryFn: () => PointsService.getMyBadges(),
    });
};

// --- Action Hooks ---

export const useAwardManualPoints = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => PointsService.awardManualPoints(data),
        onSuccess: () => {
            toast.success('Points awarded successfully!');
            // Invalidate relevant queries; for instance if eagle is checking a user's points
            // We might need to invalidate leaderboards too.
            queryClient.invalidateQueries({ queryKey: pointsKeys.leaderboard() });
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || 'Failed to award points');
        }
    });
};
