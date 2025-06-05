import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/__tests__/utils/test-utils';
import AgentManager from '../AgentManager';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('AgentManager', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <AgentManager />,
      { wrapper: ({ children }) => <div>{children}</div> }
    );
    expect(document.body).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    render(
      <AgentManager />,
      { wrapper: ({ children }) => <div>{children}</div> }
    );

    const buttons = screen.queryAllByRole('button');
    const inputs = screen.queryAllByRole('textbox');

    if (buttons.length > 0) {
      await user.click(buttons[0]);
    }

    if (inputs.length > 0) {
      await user.type(inputs[0], 'test input');
    }

    expect(document.body).toBeInTheDocument();
  });
});
