// src/modules/nest/hooks/useAddComment.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api';
import { nestKeys } from './useNests';
import toast from 'react-hot-toast';

/**
 * Adds a top-level comment to a post.
 * Invalidates comment list AND post list so comments_count badge updates.
 */
export const useAddComment = (postId, nestId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content }) =>
      apiClient.post(`/nests/${nestId}/posts/${postId}/comments/`, { content }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nest-post-comments', postId] });
      queryClient.invalidateQueries({ queryKey: nestKeys.posts(nestId) });
    },

    onError: () => {
      toast.error('Could not post comment. Please try again.');
    },
  });
};
