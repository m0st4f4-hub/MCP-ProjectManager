import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useServerEvents } from '../useServerEvents';
import { buildApiUrl, API_CONFIG } from '@/services/api/config';

describe('useServerEvents', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('opens an EventSource and handles messages', () => {
    const close = vi.fn();
    const eventSourceMock: any = { close };
    const constructor = vi.fn(() => eventSourceMock);
    (global as any).EventSource = constructor;

    const handler = vi.fn();
    const { unmount } = renderHook(() => useServerEvents(handler));

    expect(constructor).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.MCP_EVENTS)
    );

    const message = {
      data: JSON.stringify({ hello: 'world' }),
    } as MessageEvent;
    if (typeof eventSourceMock.onmessage === 'function') {
      eventSourceMock.onmessage(message);
    }

    expect(handler).toHaveBeenCalledWith({ hello: 'world' });

    unmount();
    expect(close).toHaveBeenCalled();
  });
});
