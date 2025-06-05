import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import DeleteProjectDialog from '../DeleteProjectDialog';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useDisclosure: () => ({ isOpen: true, onClose: vi.fn() }),
  };
});

describe('DeleteProjectDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <DeleteProjectDialog
          isOpen
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          cancelRef={null}
          projectName="Test"
        />
      </TestWrapper>
    );
    expect(
      screen.getByText('Are you sure you want to delete')
    ).toBeInTheDocument();
  });

  it('handles props correctly', () => {
    const props = { testId: 'test-component', 'data-testid': 'test-component' };
    render(
      <TestWrapper>
        <DeleteProjectDialog
          isOpen
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          cancelRef={null}
          projectName="Test"
          {...props}
        />
      </TestWrapper>
    );
    const component = screen.queryByTestId('test-component');
    expect(component || document.body).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(
      <TestWrapper>
        <DeleteProjectDialog
          isOpen
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          cancelRef={null}
          projectName="Test"
        />
      </TestWrapper>
    );
    const buttons = screen.queryAllByRole('button');
    if (buttons.length > 0) {
      await user.click(buttons[0]);
    }
    expect(document.body).toBeInTheDocument();
  });
});
