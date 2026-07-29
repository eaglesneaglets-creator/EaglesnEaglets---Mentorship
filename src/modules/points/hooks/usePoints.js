import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PointsService from '../services/points-service';
import toast from 'react-hot-toast';

const pointsKeys = {
    all: ['points'],
    myPoints: () => [...pointsKeys.all, 'my'],
    transactions: () => [...pointsKeys.all, 'transactions'],
    leaderboard: (params) => [...pointsKeys.all, 'leaderboard', params],
    badges: () => [...pointsKeys.all, 'badges'],
    myBadges: () => [...pointsKeys.badges(), 'my'],
    awardBudget: () => [...pointsKeys.all, 'award-budget'],
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

export const useBadges = ({ staleTime } = {}) => {
    return useQuery({
        queryKey: pointsKeys.badges(),
        queryFn: () => PointsService.getBadges(),
        ...(staleTime != null && { staleTime }),
    });
};

export const useMyBadges = () => {
    return useQuery({
        queryKey: pointsKeys.myBadges(),
        queryFn: () => PointsService.getMyBadges(),
    });
};

/**
 * Remaining manual-award allowance (Phase 31-02).
 *
 * Drives the Award modal's budget banner AND its validation ceiling, so the
 * numbers shown and the numbers enforced come from the same source. Never
 * hardcode limits in components — a superadmin can change the policy at runtime.
 */
export const useAwardBudget = ({ enabled = true } = {}) => {
    return useQuery({
        queryKey: pointsKeys.awardBudget(),
        queryFn: () => PointsService.getAwardBudget(),
        enabled,
        staleTime: 30 * 1000,
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
            // Budget just changed — refetch so the banner reflects it (31-02).
            queryClient.invalidateQueries({ queryKey: pointsKeys.awardBudget() });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to award points');
        },
    });
};

// nestEagletsKeys used for the eaglets-by-nest query in award modal
const nestEagletsKeys = {
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
