// src/modules/nest/hooks/usePostComments.js
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@api';

/**
 * Fetches top-level comments (with replies embedded) for a post.
 * Only fetches when `enabled` is true — avoids N requests on feed load.
 */
export const usePostComments = (postId, nestId, enabled = false) => {
  return useQuery({
    queryKey: ['nest-post-comments', postId],
    queryFn: () => apiClient.get(`/nests/${nestId}/posts/${postId}/comment-list/`),
    enabled: !!enabled && !!postId && !!nestId,
    staleTime: 30_000,
  });
};
