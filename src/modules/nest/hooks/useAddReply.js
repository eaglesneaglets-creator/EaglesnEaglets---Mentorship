// src/modules/nest/hooks/useAddReply.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@api';
import toast from 'react-hot-toast';

/**
 * Adds a reply to a comment.
 * Invalidates comment list — replies are embedded in the comment serializer.
 */
export const useAddReply = (commentId, postId, nestId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content }) =>
      apiClient.post(
        `/nests/${nestId}/posts/${postId}/comments/${commentId}/replies/`,
        { content }
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nest-post-comments', postId] });
    },

    onError: () => {
      toast.error('Could not post reply. Please try again.');
    },
  });
};
