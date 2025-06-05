import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/__tests__/utils/test-utils';
import AgentForbiddenActions from '../AgentForbiddenActions';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('AgentForbiddenActions', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<AgentForbiddenActions />, {
      wrapper: ({ children }) => <div>{children}</div>,
    });
    expect(document.body).toBeInTheDocument();
  });

  it('should allow adding and removing actions', async () => {
    render(<AgentForbiddenActions />, {
      wrapper: ({ children }) => <div>{children}</div>,
    });

    const input = screen.getByPlaceholderText('Enter action');
    await user.type(input, 'test-action');
    await user.click(screen.getByRole('button', { name: /add action/i }));

    expect(screen.getAllByTestId('forbidden-action-row')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /remove/i }));
    expect(screen.queryAllByTestId('forbidden-action-row')).toHaveLength(0);
  });
});
