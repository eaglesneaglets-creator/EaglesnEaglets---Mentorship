// src/modules/nest/hooks/useToggleLike.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api';
import { nestKeys } from './useNests';
import toast from 'react-hot-toast';

/**
 * Optimistically toggles a like on a post.
 * Uses nestKeys.posts(nestId) to match the cache key used by useNestPosts.
 * On success, syncs likes_count from the server response (authoritative count).
 * On error, rolls back to the pre-mutation snapshot.
 */
export const useToggleLike = (postId, nestId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post(`/nests/${nestId}/posts/${postId}/like/`),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: nestKeys.posts(nestId) });
      const previousPosts = queryClient.getQueryData(nestKeys.posts(nestId));

      queryClient.setQueryData(nestKeys.posts(nestId), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((post) => {
            if (post.id !== postId) return post;
            const nowLiked = !post.liked_by_me;
            return {
              ...post,
              liked_by_me: nowLiked,
              likes_count: post.likes_count + (nowLiked ? 1 : -1),
            };
          }),
        };
      });

      return { previousPosts };
    },

    onSuccess: (data) => {
      // Sync authoritative count from server — prevents drift from concurrent likes
      queryClient.setQueryData(nestKeys.posts(nestId), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((post) => {
            if (post.id !== postId) return post;
            return { ...post, liked_by_me: data.liked, likes_count: data.likes_count };
          }),
        };
      });
    },

    onError: (_err, _vars, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(nestKeys.posts(nestId), context.previousPosts);
      }
      toast.error('Could not update like. Please try again.');
    },
  });
};
