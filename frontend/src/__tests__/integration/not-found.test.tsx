import { describe, it, expect } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import NotFound from '@/app/not-found';

describe('NotFound page', () => {
  it('renders message and home link', () => {
    render(<NotFound />);
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    const link = screen.getByRole('button', { name: /go home/i });
    expect(link).toBeInTheDocument();
  });
});
