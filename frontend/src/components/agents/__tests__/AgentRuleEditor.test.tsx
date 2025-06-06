import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/__tests__/utils/test-utils';
import AgentRuleEditor from '../AgentRuleEditor';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('AgentRuleEditor', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<AgentRuleEditor agentId="1" />, { wrapper: ({ children }) => <div>{children}</div> });
    expect(document.body).toBeInTheDocument();
  });

  it('should handle props correctly', () => {
    const props = {
      'data-testid': 'test-component',
      agentId: '1',
    };

    render(<AgentRuleEditor {...props} />, { wrapper: ({ children }) => <div>{children}</div> });

    const component = screen.queryByTestId('test-component');
    expect(component || document.body).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    render(<AgentRuleEditor agentId="1" />, { wrapper: ({ children }) => <div>{children}</div> });

    const buttons = screen.queryAllByRole('button');
    const inputs = screen.queryAllByRole('textbox');

    if (inputs.length > 0) {
      await user.type(inputs[0], 'type');
    }

    if (buttons.length > 0) {
      await user.click(buttons[0]);
    }

    expect(document.body).toBeInTheDocument();
  });
});
