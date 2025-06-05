import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import DashboardSidebar from '../DashboardSidebar';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('DashboardSidebar', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <DashboardSidebar
          unassignedTasks={[]}
          projects={[]}
          topAgents={[]}
          topProjects={[]}
          recentActivity={[]}
          isLoadingTasks={false}
          tasksError={null}
          isLoadingAgents={false}
          agentsError={null}
        />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });
});
