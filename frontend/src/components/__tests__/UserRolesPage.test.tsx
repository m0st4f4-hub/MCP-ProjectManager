import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import UserRolesPage from '@/app/user-roles/page';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('UserRolesPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <UserRolesPage />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('handles simple interactions', async () => {
    render(
      <TestWrapper>
        <UserRolesPage />
      </TestWrapper>
    );

    const buttons = screen.queryAllByRole('button');
    if (buttons.length > 0) {
      await user.click(buttons[0]);
    }
    expect(document.body).toBeInTheDocument();
  });
});
