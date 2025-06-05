import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual =
    await vi.importActual<typeof import('@chakra-ui/react')>(
      '@chakra-ui/react'
    );
  return {
    ...actual,
    createStandaloneToast: () => ({ toast: mockToast }),
  };
});

import { handleApiError } from '../apiErrorHandler';
import { ApiError } from '@/services/api/request';

describe('handleApiError', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  it('handles ApiError instances', () => {
    const msg = handleApiError(new ApiError('Boom', 500), 'Oops');
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Oops',
        description: 'Boom',
        status: 'error',
      })
    );
    expect(msg).toBe('Boom');
  });

  it('handles Error objects', () => {
    const msg = handleApiError(new Error('Fail'));
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Fail' })
    );
    expect(msg).toBe('Fail');
  });

  it('handles string messages', () => {
    const msg = handleApiError('Nope');
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Nope' })
    );
    expect(msg).toBe('Nope');
  });

  it('returns default message for unknown error', () => {
    const msg = handleApiError(123 as any, 'Bad');
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'An unexpected error occurred.' })
    );
    expect(msg).toBe('An unexpected error occurred.');
  });
});
