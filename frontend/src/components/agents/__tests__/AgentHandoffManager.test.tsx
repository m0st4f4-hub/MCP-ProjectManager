import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/__tests__/utils/test-utils';
import AgentHandoffManager from '../AgentHandoffManager';
import { mockFetchResponse } from '@/__tests__/utils/test-utils';

describe('AgentHandoffManager', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchResponse({ success: true, criteria: [] });
  });

  it('renders and creates criteria', async () => {
    render(<AgentHandoffManager agentRoleId="role1" />);

    expect(global.fetch).toHaveBeenCalled(); // initial list

    await user.type(screen.getByPlaceholderText('Criteria'), 'demo');
    mockFetchResponse({
      success: true,
      criteria: {
        id: '1',
        agent_role_id: 'role1',
        criteria: 'demo',
        description: '',
        target_agent_role: '',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    });
    await user.click(screen.getByRole('button', { name: /add criteria/i }));

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
