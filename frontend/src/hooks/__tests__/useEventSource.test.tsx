import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventSource } from '../useEventSource';

class MockEventSource {
  url: string;
  onmessage: ((e: MessageEvent) => void) | null = null;
  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }
  close() {
    /* noop */
  }
  emit(data: any) {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
  }
  static instances: MockEventSource[] = [];
}

describe('useEventSource', () => {
  beforeEach(() => {
    vi.stubGlobal('EventSource', MockEventSource as any);
    MockEventSource.instances = [];
  });

  it('receives events and updates state', () => {
    const { result } = renderHook(() => useEventSource<{ a: number }>('/stream'));
    const instance = MockEventSource.instances[0];

    act(() => {
      instance.emit({ a: 1 });
    });

    expect(result.current.lastEvent).toEqual({ a: 1 });
  });
});
