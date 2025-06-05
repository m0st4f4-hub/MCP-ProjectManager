import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verificationRequirementsApi } from '../verification_requirements';
import { request } from '../request';
import { buildApiUrl } from '../config';

vi.mock('../request');
vi.mock('../config');

const mockRequest = vi.mocked(request);
const mockBuildApiUrl = vi.mocked(buildApiUrl);

describe('Verification Requirements API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildApiUrl.mockReturnValue('http://localhost:8000/api/test');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a verification requirement', async () => {
    const mockResponse = { data: { id: '1', agent_role_id: 'role1', requirement: 'req', is_mandatory: true, created_at: '2024-01-01T00:00:00Z' } };
    mockRequest.mockResolvedValue(mockResponse);

    const result = await verificationRequirementsApi.create({ agent_role_id: 'role1', requirement: 'req' });

    expect(mockBuildApiUrl).toHaveBeenCalled();
    expect(mockRequest).toHaveBeenCalledWith('http://localhost:8000/api/test', expect.objectContaining({ method: 'POST' }));
    expect(result).toEqual(mockResponse.data);
  });

  it('lists verification requirements', async () => {
    const mockResponse = {
      data: [
        { id: '1', agent_role_id: 'role1', requirement: 'req', is_mandatory: true, created_at: '2024-01-01T00:00:00Z' },
      ],
    };
    mockRequest.mockResolvedValue(mockResponse);

    const result = await verificationRequirementsApi.list('role1');

    expect(mockBuildApiUrl).toHaveBeenCalled();
    expect(mockRequest).toHaveBeenCalledWith('http://localhost:8000/api/test', undefined);
    expect(result).toEqual(mockResponse.data);
  });

  it('deletes a verification requirement', async () => {
    mockRequest.mockResolvedValue(null);

    await verificationRequirementsApi.delete('1');

    expect(mockBuildApiUrl).toHaveBeenCalled();
    expect(mockRequest).toHaveBeenCalledWith('http://localhost:8000/api/test', { method: 'DELETE' });
  });
});
