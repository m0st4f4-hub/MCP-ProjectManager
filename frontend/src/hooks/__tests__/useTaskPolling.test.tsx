import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTaskPolling } from '../useTaskPolling';
import { useTaskStore } from '@/store/taskStore';

vi.mock('@/store/taskStore');

describe('useTaskPolling', () => {
  const startPolling = vi.fn();
  const stopPolling = vi.fn();

  beforeEach(() => {
    (useTaskStore as unknown as vi.Mock).mockReturnValue({
      startPolling,
      stopPolling,
    });
    vi.clearAllMocks();
  });

  it('starts polling on mount and stops on unmount', () => {
    const { unmount } = renderHook(() => useTaskPolling());
    expect(startPolling).toHaveBeenCalledTimes(1);
    unmount();
    expect(stopPolling).toHaveBeenCalledTimes(1);
  });
});
