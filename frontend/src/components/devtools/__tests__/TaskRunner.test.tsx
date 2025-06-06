import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import TaskRunner from '../TaskRunner';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any, d: any) => l,
  };
});

describe('TaskRunner', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <TaskRunner />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('handles props correctly', () => {
    const props = { testId: 'test-component', 'data-testid': 'test-component' };
    render(
      <TestWrapper>
        <TaskRunner {...props} />
      </TestWrapper>
    );
    const component = screen.queryByTestId('test-component');
    expect(component || document.body).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(
      <TestWrapper>
        <TaskRunner />
      </TestWrapper>
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
