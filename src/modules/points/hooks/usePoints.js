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
            queryClient.invalidateQueries({ queryKey: pointsKeys.leaderboard() });
            queryClient.invalidateQueries({ queryKey: pointsKeys.transactions() });
            queryClient.invalidateQueries({ queryKey: pointsKeys.myPoints() });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to award points');
        },
    });
};

// nestEagletsKeys used for the eaglets-by-nest query in award modal
export const nestEagletsKeys = {
    eaglets: (nestId) => ['nests', nestId, 'eaglets'],
};

export const useEagletsByNest = (nestId) => {
    return useQuery({
        queryKey: nestEagletsKeys.eaglets(nestId),
        queryFn: () => PointsService.getEagletsByNest(nestId),
        enabled: !!nestId,
        staleTime: 60 * 1000, // 1 min — nest membership rarely changes mid-session
    });
};
