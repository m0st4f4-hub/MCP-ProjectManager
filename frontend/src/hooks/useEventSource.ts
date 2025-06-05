import { useEffect, useRef, useState } from 'react';

export interface UseEventSourceResult<T> {
  lastEvent: T | null;
}

/**
 * Connect to a Server-Sent Events stream and handle incoming messages.
 * @param url - SSE endpoint URL
 * @param onEvent - Optional callback invoked for each parsed event
 */
export const useEventSource = <T = any>(
  url: string,
  onEvent?: (data: T) => void,
): UseEventSourceResult<T> => {
  const [lastEvent, setLastEvent] = useState<T | null>(null);
  const sourceRef = useRef<EventSource>();

  useEffect(() => {
    const es = new EventSource(url);
    sourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as T;
        setLastEvent(data);
        onEvent?.(data);
      } catch (err) {
        console.warn('Failed to parse SSE message', err);
      }
    };

    return () => {
      es.close();
    };
  }, [url, onEvent]);

  return { lastEvent };
};

export default useEventSource;
