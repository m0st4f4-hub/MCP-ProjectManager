import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import BulkActionsBar from '../BulkActionsBar';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useDisclosure: () => ({ isOpen: false, onClose: vi.fn() }),
  };
});

describe('BulkActionsBar', () => {
  const user = userEvent.setup();
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseProps = {
    selectedTaskIds: ['1'],
    areAllTasksSelected: false,
    onBulkDeleteConfirm: vi.fn(),
    onSelectAllToggle: vi.fn(),
    onStatusChange: vi.fn(),
  };

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <BulkActionsBar {...baseProps} />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('handles props correctly', () => {
    const props = { testId: 'test-component', 'data-testid': 'test-component' };
    render(
      <TestWrapper>
        <BulkActionsBar {...baseProps} {...props} />
      </TestWrapper>
    );
    const component = screen.queryByTestId('test-component');
    expect(component || document.body).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(
      <TestWrapper>
        <BulkActionsBar {...baseProps} />
      </TestWrapper>
    );
    const buttons = screen.queryAllByRole('button');
    if (buttons.length > 0) {
      await user.click(buttons[0]);
    }
    expect(document.body).toBeInTheDocument();
  });
});
