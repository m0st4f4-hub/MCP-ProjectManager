import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import RelationsGraphPage from '@/app/memory/relations/page';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

vi.mock('vis-network/standalone/esm/vis-network', () => ({
  Network: vi.fn(() => ({ destroy: vi.fn() })),
}));

beforeEach(() => {
  server.use(
    http.get(`${API_BASE_URL}/api/memory/relations`, () =>
      HttpResponse.json([
        {
          id: 1,
          from_entity_id: 1,
          to_entity_id: 2,
          relation_type: 'linked',
          created_at: '2024-01-03',
        },
      ])
    )
  );
});

describe('RelationsGraph page', () => {
  it('renders graph container with data', async () => {
    render(<RelationsGraphPage />);
    await waitFor(() => {
      expect(screen.getByTestId('relation-graph')).toBeInTheDocument();
    });
  });
});
