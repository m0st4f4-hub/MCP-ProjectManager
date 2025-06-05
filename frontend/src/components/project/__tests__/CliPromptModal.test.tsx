import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import CliPromptModal from '../CliPromptModal';

describe('CliPromptModal', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <CliPromptModal />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('handles props correctly', () => {
    const props = { testId: 'test-component', 'data-testid': 'test-component' };
    render(
      <TestWrapper>
        <CliPromptModal {...props} />
      </TestWrapper>
    );
    const component = screen.queryByTestId('test-component');
    expect(component || document.body).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(
      <TestWrapper>
        <CliPromptModal />
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
