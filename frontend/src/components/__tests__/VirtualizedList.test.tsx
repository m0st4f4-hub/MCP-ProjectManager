import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import VirtualizedList from '../VirtualizedList';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('VirtualizedList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty and loading states', () => {
    const { rerender } = render(
      <VirtualizedList items={[]} itemHeight={10} renderItem={() => null} isLoading={false} />,
    );
    expect(screen.getByText('No items to display')).toBeInTheDocument();

    rerender(
      <VirtualizedList items={[]} itemHeight={10} renderItem={() => null} isLoading />,
    );
    expect(screen.getByText('Loading items...')).toBeInTheDocument();
  });
});
