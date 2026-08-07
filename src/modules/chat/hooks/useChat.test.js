import { describe, expect, it } from 'vitest';
import { selectMessages } from './useChat';

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
