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
import { ApiError, NetworkError } from '@/services/api/request';

describe('handleApiError', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  it('handles ApiError instances', () => {
    handleApiError(new ApiError('Boom', 500), 'Oops');
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Oops',
        description: 'Boom',
        status: 'error',
      })
    );
  });

  it('handles NetworkError instances with network title', () => {
    handleApiError(new NetworkError('Offline', 'http://foo'));
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Network Error',
        description: 'Offline',
      })
    );
  });

  it('handles Error objects', () => {
    handleApiError(new Error('Fail'));
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Fail' })
    );
  });

  it('handles string messages', () => {
    handleApiError('Nope');
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Nope' })
    );
  });
});
