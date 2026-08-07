import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChatService from '../services/chat-service';
import { selectMessages, useMarkActiveConversationRead } from './useChat';

vi.mock('../services/chat-service', () => ({
  default: {
    markRead: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }) => createElement(
    QueryClientProvider,
    { client: queryClient },
    children
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  ChatService.markRead.mockResolvedValue({ data: { success: true } });
});

describe('selectMessages', () => {
  it('returns an empty, stable shape for incomplete cache data', () => {
    expect(selectMessages(undefined)).toEqual({ messages: [], hasMore: false });
    expect(selectMessages({})).toEqual({ messages: [], hasMore: false });
  });

  it('orders pages chronologically without mutating the query cache', () => {
    const newestPage = { data: [{ id: 3 }] };
    const oldestPage = { data: [{ id: 1 }, { id: 2 }] };
    const pages = [newestPage, oldestPage];

    expect(selectMessages({ pages })).toEqual({
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }],
      hasMore: false,
    });
    expect(pages).toEqual([newestPage, oldestPage]);
  });

  it('reports another page when the oldest fetched page is full', () => {
    const fullPage = { data: Array.from({ length: 50 }, (_, id) => ({ id })) };

    expect(selectMessages({ pages: [{ data: [] }, fullPage] }).hasMore).toBe(true);
  });
});

describe('useMarkActiveConversationRead', () => {
  it('sends one request per active conversation instead of looping after mutation updates', async () => {
    const { rerender } = renderHook(
      ({ conversationId }) => useMarkActiveConversationRead(conversationId),
      {
        initialProps: { conversationId: 'conversation-1' },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(ChatService.markRead).toHaveBeenCalledTimes(1));
    expect(ChatService.markRead).toHaveBeenLastCalledWith('conversation-1');

    rerender({ conversationId: 'conversation-1' });
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(ChatService.markRead).toHaveBeenCalledTimes(1);

    rerender({ conversationId: 'conversation-2' });
    await waitFor(() => expect(ChatService.markRead).toHaveBeenCalledTimes(2));
    expect(ChatService.markRead).toHaveBeenLastCalledWith('conversation-2');
  });
});
