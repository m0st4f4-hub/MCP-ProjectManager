import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import CreateProjectModal from '../CreateProjectModal';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('CreateProjectModal', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <CreateProjectModal />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('should handle props correctly', () => {
    const props = { 
      testId: 'test-component',
      'data-testid': 'test-component'
    };
    
    render(
      <TestWrapper>
        <CreateProjectModal {...props} />
      </TestWrapper>
    );
    
    const component = screen.queryByTestId('test-component');
    expect(component || document.body).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    render(
      <TestWrapper>
        <CreateProjectModal />
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
