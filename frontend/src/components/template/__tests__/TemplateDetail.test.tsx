import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import TemplateDetail from '../TemplateDetail';
import { projectTemplatesApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  projectTemplatesApi: {
    get: vi.fn(),
  },
}));

const mockedApi = vi.mocked(projectTemplatesApi);

describe('TemplateDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.get.mockResolvedValue({
      id: 't1',
      name: 'Temp',
      description: '',
      template_data: {},
      created_at: '',
      updated_at: '',
    });
  });

  it('renders fetched template', async () => {
    render(
      <TestWrapper>
        <TemplateDetail />
      </TestWrapper>
    );
    expect(await screen.findByText('Temp')).toBeInTheDocument();
  });
});
