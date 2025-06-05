import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import MemoryGraphPage from '@/app/memory/graph/page';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

vi.mock('react-force-graph', () => ({
  ForceGraph2D: (props: any) => <div data-testid="graph" {...props} />,
}));

beforeEach(() => {
  server.use(
    http.get(`${API_BASE_URL}/api/memory/graph`, () =>
      HttpResponse.json({
        entities: [
          {
            id: 1,
            entity_type: 'text',
            content: 'a',
            created_at: '2024-01-01',
          },
          {
            id: 2,
            entity_type: 'text',
            content: 'b',
            created_at: '2024-01-02',
          },
        ],
        relations: [
          {
            id: 1,
            from_entity_id: 1,
            to_entity_id: 2,
            relation_type: 'linked',
            created_at: '2024-01-03',
          },
        ],
      })
    )
  );
});

describe('MemoryGraph page', () => {
  it('renders graph container with data', async () => {
    render(<MemoryGraphPage />);
    await waitFor(() => {
      expect(screen.getByTestId('graph')).toBeInTheDocument();
    });
  });
});
