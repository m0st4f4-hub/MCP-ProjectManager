import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/utils';
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
    render(<NoTasks onAddTask={add} />);
    expect(screen.getByText('No Tasks Found')).toBeInTheDocument();
    await screen.getByRole('button', { name: /add your first task/i }).click();
    expect(add).toHaveBeenCalled();
  });
});
