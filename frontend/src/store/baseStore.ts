import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Base state interface with loading and error states
export interface BaseState {
    loading: boolean;
    error: string | null;
    clearError: () => void;
}

// Base store options
export interface BaseStoreOptions {
    name: string;
    version?: number;
    persist?: boolean;
}

// Create base store function
export const createBaseStore = <T extends BaseState>(
    initialState: Omit<T, keyof BaseState>,
    options: BaseStoreOptions
) => {
    const baseState: BaseState = {
        loading: false,
        error: null,
        clearError: () => void 0,
    };

    const store = (set: any, get: any) => ({
        ...baseState,
        ...initialState,
        clearError: () => set({ error: null }),
    });

    // Add persistence if enabled
    if (options.persist) {
        return create(
            persist(store, {
                name: options.name,
                version: options.version || 1,
            })
        );
    }

    return create(store);
};

// Error handling utility
export const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
};

// Loading state utility
export const withLoading = async <T>(
    set: (state: Partial<BaseState>) => void,
    action: () => Promise<T>
): Promise<T> => {
    set({ loading: true, error: null });
    try {
        const result = await action();
        set({ loading: false });
        return result;
    } catch (error) {
        const errorMessage = handleApiError(error);
        set({ loading: false, error: errorMessage });
        throw error;
    }
}; 