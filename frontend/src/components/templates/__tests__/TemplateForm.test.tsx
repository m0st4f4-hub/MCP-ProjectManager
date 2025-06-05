import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import TemplateForm from '../TemplateForm';
import { ProjectTemplate } from '@/types/project_template';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any, d: any) => l,
  };
});

describe('TemplateForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders in create mode', () => {
    render(
      <TestWrapper>
        <TemplateForm onSubmit={vi.fn()} onCancel={vi.fn()} />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('renders with template data in edit mode', () => {
    const template: ProjectTemplate = {
      id: '1',
      name: 'T1',
      description: null,
      template_data: {},
      created_at: '',
      updated_at: '',
    };
    render(
      <TestWrapper>
        <TemplateForm
          template={template}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </TestWrapper>
    );
    expect(screen.getByDisplayValue('T1')).toBeInTheDocument();
  });
});
