import * as logger from '@/utils/logger';
import { create, StoreApi } from 'zustand';
import { persist } from 'zustand/middleware';
import { handleApiError } from '@/lib/apiErrorHandler';

// Base state structure
export interface BaseState {
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const baseStateDefaults: BaseState = {
  loading: false,
  error: null,
  clearError: () => {
    /* This will be set by the store */
  },
};

export interface BaseStoreOptions {
  name: string;
  persist?: boolean;
  version?: number; // Added from diff
}

// TState is the full state (e.g., ProjectState), TActions are just the action methods
export const createBaseStore = <
  TState extends BaseState,
  TActions extends object,
>(
  initialData: Omit<TState, keyof BaseState | keyof TActions>,
  actionsCreator: (
    set: StoreApi<TState>['setState'],
    get: StoreApi<TState>['getState']
  ) => TActions,
  options: BaseStoreOptions
) => {
  const store = (
    set: StoreApi<TState>['setState'],
    get: StoreApi<TState>['getState']
  ): TState =>
    ({
      ...(baseStateDefaults as BaseState),
      ...(initialData as Omit<TState, keyof BaseState | keyof TActions>),
      ...(actionsCreator(set, get) as TActions),
      clearError: () => set({ error: null } as Partial<TState>),
    }) as unknown as TState;

  if (options.persist) {
    return create(
      persist(store, { name: options.name, version: options.version || 1 })
    );
  }
  return create(store);
};

// Error handling utility (from diff)
export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

// Loading state utility (modified to align with new withLoading structure)
export const withLoading = async <T>(
  set: StoreApi<BaseState>['setState'],
  asyncFn: () => Promise<T>,
  errorTitle = 'API Error'
): Promise<T | void> => {
  set({ loading: true, error: null });
  try {
    const result = await asyncFn(); // store result
    set({ loading: false }); // set loading false before returning
    return result; // return result
  } catch (err: unknown) {
    const errorMessage = extractErrorMessage(err);
    set({ loading: false, error: errorMessage });
    handleApiError(err, errorTitle);
    // logger.error("Operation failed:", errorMessage, err);
    throw err; // Rethrow error so calling action can also catch it if needed
  }
  // finally is not strictly needed if all paths set loading false
};
