import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  TestWrapper,
} from '@/__tests__/utils/test-utils';
import AgentDetail from '../AgentDetail';
import { rulesApi } from '@/services/api/rules';
import { getAgentById } from '@/services/api/agents';

const applyMock = vi.fn();
const listMock = vi.fn();
vi.mock('@/services/api/rules', () => ({
  rulesApi: { templates: { list: listMock, apply: applyMock } },
}));
const getMock = vi.fn();
vi.mock('@/services/api/agents', () => ({
  getAgentById: getMock,
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ agentId: 'a1' }),
}));

const toastMock = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return { ...actual, useToast: () => toastMock };
});

describe('AgentDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMock.mockResolvedValue({ id: 'a1', name: 'Agent One' });
    listMock.mockResolvedValue([
      { id: 't1', template_name: 'Temp1', template_content: '' },
    ]);
  });

  it('applies template on click', async () => {
    render(<AgentDetail />, { wrapper: TestWrapper });

    await screen.findByText(/Agent: Agent One/);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 't1' } });
    fireEvent.click(screen.getByRole('button', { name: /Apply Template/i }));

    await waitFor(() => expect(applyMock).toHaveBeenCalledWith('a1', 't1'));
  });
});
