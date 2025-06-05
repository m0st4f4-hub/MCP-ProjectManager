import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import NoTasks from '../NoTasks';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('NoTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty state and calls add', async () => {
    const add = vi.fn();
    render(<NoTasks onAddTask={add} />, { wrapper: TestWrapper });
    expect(screen.getByText('No Tasks Found')).toBeInTheDocument();
    await screen.getByRole('button', { name: /add your first task/i }).click();
    expect(add).toHaveBeenCalled();
  });
});
