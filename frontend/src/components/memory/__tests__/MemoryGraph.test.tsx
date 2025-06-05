import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  TestWrapper,
} from '@/__tests__/utils/test-utils';
import MemoryGraph from '../MemoryGraph';
import { memoryApi } from '@/services/api';

vi.mock('react-force-graph', () => ({
  ForceGraph2D: (props: any) => <div data-testid="graph" {...props} />,
}));

vi.mock('@/services/api', () => ({
  memoryApi: {
    getKnowledgeGraph: vi.fn(),
  },
}));

describe('MemoryGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders graph when API resolves', async () => {
    (memoryApi.getKnowledgeGraph as any).mockResolvedValue({
      entities: [
        {
          id: 1,
          entity_type: 'text',
          content: 'a',
          entity_metadata: null,
          source: null,
          source_metadata: null,
          created_by_user_id: null,
          created_at: '',
          updated_at: null,
        },
      ],
      relations: [],
    });
    render(
      <TestWrapper>
        <MemoryGraph />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(screen.getByTestId('graph')).toBeInTheDocument();
    });
  });

  it('displays error when API rejects', async () => {
    (memoryApi.getKnowledgeGraph as any).mockRejectedValue(new Error('fail'));
    render(
      <TestWrapper>
        <MemoryGraph />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(screen.getByText('fail')).toBeInTheDocument();
    });
  });
});
