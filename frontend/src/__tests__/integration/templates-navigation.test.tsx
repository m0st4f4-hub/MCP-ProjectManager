import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import TemplatesPage from '@/app/templates/page';
import { useTemplateStore } from '@/store/templateStore';

beforeEach(() => {
  useTemplateStore.setState({
    templates: [
      {
        id: '1',
        name: 'Temp',
        description: 'd',
        template_data: {},
        created_at: '',
        updated_at: '',
      },
    ],
    loading: false,
    error: null,
  } as any);
});

describe('Templates navigation', () => {
  it('shows link to create page', () => {
    render(<TemplatesPage />);
    const link = screen.getByRole('button', { name: /create template/i });
    expect(link).toBeInTheDocument();
  });
});
