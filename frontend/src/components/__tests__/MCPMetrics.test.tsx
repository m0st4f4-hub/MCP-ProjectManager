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
vi.mock('@/services/api/metrics', () => ({
  metricsApi: {
    raw: vi.fn(),
  },
}));
import { mcpApi } from '@/services/api/mcp';
import { metricsApi } from '@/services/api/metrics';

describe('MCPMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders metrics from API', async () => {
    (mcpApi.metrics as any).mockResolvedValue({ toolA: 2, toolB: 3 });
    (metricsApi.raw as any).mockResolvedValue(
      'http_requests_total{method="GET",endpoint="/health",status="200"} 5\n' +
        'http_errors_total{method="GET",endpoint="/health",status="500"} 1\n'
    );
    render(
      <TestWrapper>
        <MCPMetrics />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(screen.getByText('toolA')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('/health')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});
