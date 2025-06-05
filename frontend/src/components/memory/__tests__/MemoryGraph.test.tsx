import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import MemoryGraph from '../MemoryGraph';
import { memoryApi } from '@/services/api';

vi.mock('react-force-graph', () => ({
  ForceGraph2D: ({ graphData }: any) => (
    <div data-testid="force-graph">
      <span data-testid="node-count">{graphData.nodes.length}</span>
      <span data-testid="link-count">{graphData.links.length}</span>
    </div>
  ),
}));

const getGraphMock = vi.fn();

vi.mock('@/services/api', () => ({
  memoryApi: {
    getKnowledgeGraph: getGraphMock,
  },
}));

describe('MemoryGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nodes and edges from API data', async () => {
    const mockGraph = {
      entities: [
        { id: 1, entity_type: 'A', content: null, metadata: null, created_at: '', updated_at: '' },
        { id: 2, entity_type: 'B', content: null, metadata: null, created_at: '', updated_at: '' },
      ],
      relations: [
        { id: 1, from_entity_id: 1, to_entity_id: 2, relation_type: 'rel', metadata: null, created_at: '' },
      ],
    };
    getGraphMock.mockResolvedValue(mockGraph);

    render(<MemoryGraph />);

    await waitFor(() => {
      expect(screen.getByTestId('node-count').textContent).toBe('2');
      expect(screen.getByTestId('link-count').textContent).toBe('1');
    });
  });
});
