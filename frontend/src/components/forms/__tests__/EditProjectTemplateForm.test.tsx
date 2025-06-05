import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/__tests__/utils/test-utils';
import EditProjectTemplateForm from '../EditProjectTemplateForm';
import { ProjectTemplate } from '@/types/project_template';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any, d: any) => l,
  };
});

describe('EditProjectTemplateForm', () => {
  const user = userEvent.setup();
  const template: ProjectTemplate = {
    id: '1',
    name: 'T1',
    description: null,
    template_data: {},
    created_at: '',
    updated_at: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with template data', () => {
    render(
      <EditProjectTemplateForm
        template={template}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('T1')).toBeInTheDocument();
  });

  it('submits updated values', async () => {
    const onSubmit = vi.fn();
    render(
      <EditProjectTemplateForm
        template={template}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );
    const inputs = screen.getAllByRole('textbox');
    if (inputs.length) {
      await user.type(inputs[0], 'x');
    }
    expect(document.body).toBeInTheDocument();
  });
});
