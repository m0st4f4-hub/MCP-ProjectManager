import { useEffect, useState, useRef } from 'react';

interface UseEventSourceOptions {
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: (event: Event) => void;
  enabled?: boolean;
}

interface UseEventSourceReturn {
  lastEvent: MessageEvent | null;
  readyState: number;
  error: Event | null;
  close: () => void;
}

/**
 * Custom hook for Server-Sent Events (SSE) connection
 * @param url - The SSE endpoint URL
 * @param options - Configuration options
 * @returns Event source state and controls
 */
export function useEventSource(
  url: string,
  options: UseEventSourceOptions = {}
): UseEventSourceReturn {
  const { onMessage, onError, onOpen, enabled = true } = options;
  
  const [lastEvent, setLastEvent] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<number>(EventSource.CLOSED);
  const [error, setError] = useState<Event | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  
  const close = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setReadyState(EventSource.CLOSED);
    }
  };
  
  useEffect(() => {
    if (!enabled || !url) {
      close();
      return;
    }
    
    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;
      
      eventSource.onopen = (event) => {
        setReadyState(EventSource.OPEN);
        setError(null);
        onOpen?.(event);
      };
      
      eventSource.onmessage = (event) => {
        setLastEvent(event);
        onMessage?.(event);
      };
      
      eventSource.onerror = (event) => {
        setError(event);
        setReadyState(eventSource.readyState);
        onError?.(event);
      };
      
      // Update ready state periodically
      const interval = setInterval(() => {
        setReadyState(eventSource.readyState);
      }, 1000);
      
      return () => {
        clearInterval(interval);
        eventSource.close();
      };
    } catch (err) {
      console.error('Failed to create EventSource:', err);
      setError(err as Event);
    }
  }, [url, enabled, onMessage, onError, onOpen]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      close();
    };
  }, []);
  
  return {
    lastEvent,
    readyState,
    error,
    close
  };
}