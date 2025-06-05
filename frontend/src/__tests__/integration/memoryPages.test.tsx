import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import { http, HttpResponse } from 'msw';
import { server } from '@/__tests__/mocks/server';
import MemoryDetailPage from '@/app/memory/[id]/page';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: vi.fn() }),
}));

describe('Memory detail page', () => {
  it('renders content and metadata', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/memory/entities/1/content`, () =>
        HttpResponse.json({ content: 'hello world' })
      ),
      http.get(`${API_BASE_URL}/api/memory/entities/1/metadata`, () =>
        HttpResponse.json({ metadata: { filename: 'sample.txt' } })
      )
    );

    render(<MemoryDetailPage />);

    expect(await screen.findByText('hello world')).toBeInTheDocument();
    expect(screen.getByText('sample.txt')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /download/i })
    ).toBeInTheDocument();
  });
});
