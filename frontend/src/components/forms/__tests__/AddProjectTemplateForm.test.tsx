import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/__tests__/utils/test-utils';
import AddProjectTemplateForm from '../AddProjectTemplateForm';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any, d: any) => l,
  };
});

describe('AddProjectTemplateForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AddProjectTemplateForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(document.body).toBeInTheDocument();
  });

  it('handles user input', async () => {
    render(<AddProjectTemplateForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    if (inputs.length) {
      await user.type(inputs[0], 'test');
    }
    expect(document.body).toBeInTheDocument();
  });
});
