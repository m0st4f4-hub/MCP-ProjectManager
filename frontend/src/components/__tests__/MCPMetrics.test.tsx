import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  TestWrapper,
} from '@/__tests__/utils/test-utils';
import MCPMetrics from '../MCPMetrics';
vi.mock('@/services/api/mcp', () => ({
  mcpApi: {
    metrics: vi.fn(),
  },
}));
import { mcpApi } from '@/services/api/mcp';

describe('MCPMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders metrics from API', async () => {
    (mcpApi.metrics as any).mockResolvedValue({ toolA: 2, toolB: 3 });
    render(
      <TestWrapper>
        <MCPMetrics />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(screen.getByText('toolA')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});
