import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
vi.mock('@/components/MCPMetrics', () => ({
  default: () => <div data-testid="metrics" />,
}));
import MCPMetricsPage from '@/app/mcp-tools/metrics/page';

describe('MCPMetrics page', () => {
  it('renders metrics component', async () => {
    render(<MCPMetricsPage />);
    await waitFor(() => {
      expect(screen.getByTestId('metrics')).toBeInTheDocument();
    });
  });
});
