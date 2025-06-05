import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import shadows from '../shadows';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: vi.fn(),
    useColorModeValue: vi.fn((light: any, dark: any) => light),
  };
});
