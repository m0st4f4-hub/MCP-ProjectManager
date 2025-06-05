import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import WorkflowsPage from '../page';
import { workflowsApi } from '@/services/api/workflows';

vi.mock('@/services/api/workflows');

describe('WorkflowsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (workflowsApi.list as unknown as vi.Mock).mockResolvedValue([]);
  });

  it('renders heading', async () => {
    render(<WorkflowsPage />);
    expect(screen.getByText(/Workflows/i)).toBeInTheDocument();
  });
});
