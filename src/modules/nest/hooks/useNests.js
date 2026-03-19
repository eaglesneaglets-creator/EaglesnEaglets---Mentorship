import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NestService } from '../services/nest-service';

export const nestKeys = {
    all: ['nests'],
    lists: () => [...nestKeys.all, 'list'],
    list: (filters) => [...nestKeys.lists(), { filters }],
    my: () => [...nestKeys.all, 'my'],
    myRequests: () => [...nestKeys.all, 'my-requests'],
    details: () => [...nestKeys.all, 'detail'],
    detail: (id) => [...nestKeys.details(), id],
    members: (id) => [...nestKeys.detail(id), 'members'],
    requests: (id) => [...nestKeys.detail(id), 'requests'],
    posts: (id) => [...nestKeys.detail(id), 'posts'],
    events: (id) => [...nestKeys.detail(id), 'events'],
};

// ------------------------------------------------------------------
// Queries
// ------------------------------------------------------------------

export const useNests = (filters = {}) => {
    return useQuery({
        queryKey: nestKeys.list(filters),
        queryFn: () => NestService.getNests(filters),
    });
};

export const useMyNests = () => {
    return useQuery({
        queryKey: nestKeys.my(),
        queryFn: () => NestService.getMyNests(),
    });
};

export const useNestDetail = (id) => {
    return useQuery({
        queryKey: nestKeys.detail(id),
        queryFn: () => NestService.getNest(id),
        enabled: !!id,
    });
};

export const useNestMembers = (id, filters = {}) => {
    return useQuery({
        queryKey: nestKeys.members(id),
        queryFn: () => NestService.getMembers(id, filters),
        enabled: !!id,
    });
};

export const useMyRequests = (filters = {}) => {
    return useQuery({
        queryKey: [...nestKeys.myRequests(), { filters }],
        queryFn: () => NestService.getMyRequests(filters),
    });
};

export const useNestRequests = (id, filters = {}) => {
    return useQuery({
        queryKey: nestKeys.requests(id),
        queryFn: () => NestService.getRequests(id, filters),
        enabled: !!id,
    });
};

export const useNestPosts = (id, filters = {}) => {
    return useQuery({
        queryKey: nestKeys.posts(id),
        queryFn: () => NestService.getPosts(id, filters),
        enabled: !!id,
    });
};

export const useNestEvents = (id, filters = {}) => {
    return useQuery({
        queryKey: nestKeys.events(id),
        queryFn: () => NestService.getEvents(id, filters),
        enabled: !!id,
    });
};

// ------------------------------------------------------------------
// Mutations
// ------------------------------------------------------------------

export const useCreateNest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => NestService.createNest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: nestKeys.lists() });
            queryClient.invalidateQueries({ queryKey: nestKeys.my() });
        },
    });
};

export const useUpdateNest = (id) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => NestService.updateNest(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: nestKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: nestKeys.lists() });
            queryClient.invalidateQueries({ queryKey: nestKeys.my() });
        },
    });
};

export const useJoinNest = (id) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (message) => NestService.requestToJoin(id, message),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: nestKeys.my() });
            queryClient.invalidateQueries({ queryKey: nestKeys.myRequests() });
        },
    });
};

export const useRespondToRequest = (nestId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ requestId, status }) =>
            NestService.updateRequestStatus(nestId, requestId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: nestKeys.requests(nestId) });
            queryClient.invalidateQueries({ queryKey: nestKeys.members(nestId) });
        },
    });
};

export const useCreatePost = (nestId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => NestService.createPost(nestId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: nestKeys.posts(nestId) });
        },
    });
};

export const useRemoveMember = (nestId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (memberId) => NestService.removeMember(nestId, memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: nestKeys.members(nestId) });
            queryClient.invalidateQueries({ queryKey: nestKeys.detail(nestId) });
        },
    });
};
