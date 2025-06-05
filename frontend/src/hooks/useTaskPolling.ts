import { useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';

/**
 * Start periodic polling for task updates on mount and
 * stop polling when the component using this hook unmounts.
 */
export const useTaskPolling = (): void => {
  const startPolling = useTaskStore((state) => state.startPolling);
  const stopPolling = useTaskStore((state) => state.stopPolling);

  useEffect(() => {
    startPolling();
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);
};

export default useTaskPolling;
