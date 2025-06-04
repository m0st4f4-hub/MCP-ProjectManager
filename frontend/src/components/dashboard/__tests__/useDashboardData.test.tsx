import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useDashboardData from '../useDashboardData';
// import { renderHook } from '@testing-library/react';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: vi.fn(),
    useColorModeValue: vi.fn((light: any, dark: any) => light),
  };
});

describe('useDashboardData', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Add comment indicating to use renderHook
  // This is a hook, not a component. Update test to use renderHook.
});
