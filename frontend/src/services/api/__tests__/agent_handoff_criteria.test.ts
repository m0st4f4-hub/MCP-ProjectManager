import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createAgentHandoffCriteria,
  listAgentHandoffCriteria,
  deleteAgentHandoffCriteria,
} from '../agent_handoff_criteria';
import { request } from '../request';
import { buildApiUrl } from '../config';

vi.mock('../request');
vi.mock('../config');

const mockRequest = vi.mocked(request);
const mockBuildApiUrl = vi.mocked(buildApiUrl);

describe('Agent Handoff Criteria API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildApiUrl.mockReturnValue('http://localhost:8000/api/test');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates criteria', async () => {
    const mockCriteria = {
      id: '1',
      agent_role_id: 'role1',
      criteria: 'c1',
      description: null,
      target_agent_role: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    };
    mockRequest.mockResolvedValue({ success: true, criteria: mockCriteria });

    const result = await createAgentHandoffCriteria({
      agent_role_id: 'role1',
      criteria: 'c1',
    });

    expect(mockBuildApiUrl).toHaveBeenCalled();
    expect(mockRequest).toHaveBeenCalledWith(
      'http://localhost:8000/api/test',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result).toEqual(mockCriteria);
  });

  it('lists criteria', async () => {
    const mockList = [
      {
        id: '1',
        agent_role_id: 'role1',
        criteria: 'c1',
        description: null,
        target_agent_role: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    ];
    mockRequest.mockResolvedValue({ success: true, criteria: mockList });

    const result = await listAgentHandoffCriteria('role1');

    expect(mockBuildApiUrl).toHaveBeenCalled();
    expect(mockRequest).toHaveBeenCalled();
    expect(result).toEqual(mockList);
  });

  it('deletes criteria', async () => {
    mockRequest.mockResolvedValue(null);

    await deleteAgentHandoffCriteria('1');

    expect(mockBuildApiUrl).toHaveBeenCalled();
    expect(mockRequest).toHaveBeenCalledWith('http://localhost:8000/api/test', { method: 'DELETE' });
  });
});
