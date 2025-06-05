import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import DashboardHeader from '../DashboardHeader';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('DashboardHeader', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <DashboardHeader />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('should handle props correctly', () => {
    const props = {
      title: 'Test Title',
    };

    render(
      <TestWrapper>
        <DashboardHeader {...props} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
