import { useEffect, useRef } from 'react';
import { buildApiUrl, API_CONFIG } from '@/services/api/config';

export type ServerEventHandler = (data: any) => void;

/**
 * Subscribe to backend Server-Sent Events.
 * The provided handler is called for each parsed JSON event.
 */
export const useServerEvents = (handler: ServerEventHandler) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.MCP_EVENTS);
    const source = new EventSource(url);

    source.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        handlerRef.current(data);
      } catch (err) {
        console.error('Failed to parse server event', err);
      }
    };

    return () => {
      source.close();
    };
  }, []);
};

export default useServerEvents;
