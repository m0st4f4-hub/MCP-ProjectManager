import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';

vi.mock('react-force-graph', () => ({
  ForceGraph2D: (props: any) => <div data-testid="graph" {...props} />,
}));

vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => (props: any) => <div data-testid="graph" {...props} />,
}));

vi.mock('@/services/api', () => ({
  memoryApi: {
    getKnowledgeGraph: vi.fn().mockResolvedValue({
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
    }),
  },
}));

import MemoryGraphPage from '@/app/memory/graph/page';

describe('MemoryGraph page', () => {
  it('renders graph container with data', async () => {
    render(<MemoryGraphPage />);
    await waitFor(() => {
      expect(screen.getByTestId('graph')).toBeInTheDocument();
    });
  });
});
