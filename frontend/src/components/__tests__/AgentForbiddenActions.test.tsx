import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/__tests__/utils/test-utils';
import AgentForbiddenActions from '../AgentForbiddenActions';
import { rulesApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  rulesApi: {
    forbiddenActions: {
      add: vi.fn().mockResolvedValue({ id: '1', action: 'test', agent_role_id: 'r1' }),
      remove: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('AgentForbiddenActions', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls API when adding and removing actions', async () => {
    render(<AgentForbiddenActions roleId="r1" initialActions={[]} />);

    await user.type(screen.getByLabelText(/action/i), 'test');
    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(rulesApi.forbiddenActions.add).toHaveBeenCalledWith('r1', {
      action: 'test',
      reason: '',
    });

    const removeBtn = await screen.findByRole('button', { name: /remove/i });
    await user.click(removeBtn);
    expect(rulesApi.forbiddenActions.remove).toHaveBeenCalledWith('1');
  });
});
