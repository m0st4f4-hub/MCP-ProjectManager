import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { agentCapabilitiesApi } from '../agent_capabilities';
import { request } from '../request';
import { buildApiUrl, API_CONFIG } from '../config';

vi.mock('../request');
vi.mock('../config');

const mockRequest = vi.mocked(request);
const mockBuildApiUrl = vi.mocked(buildApiUrl);

const sampleCap = {
  id: '1',
  agent_role_id: 'role1',
  capability: 'demo',
  description: null,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
};

describe('agentCapabilitiesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildApiUrl.mockReturnValue('http://localhost:8000/api/test');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists capabilities', async () => {
    mockRequest.mockResolvedValue({ data: [sampleCap] });

    const result = await agentCapabilitiesApi.list('role1');

    expect(mockBuildApiUrl).toHaveBeenCalledWith(
      API_CONFIG.ENDPOINTS.RULES,
      '/roles/capabilities?agent_role_id=role1'
    );
    expect(mockRequest).toHaveBeenCalledWith('http://localhost:8000/api/test');
    expect(result).toEqual([sampleCap]);
  });

  it('gets capability', async () => {
    mockRequest.mockResolvedValue({ data: sampleCap });

    const result = await agentCapabilitiesApi.get('1');

    expect(mockBuildApiUrl).toHaveBeenCalled();
    expect(mockRequest).toHaveBeenCalledWith('http://localhost:8000/api/test');
    expect(result).toEqual(sampleCap);
  });

  it('creates capability', async () => {
    mockRequest.mockResolvedValue({ data: sampleCap });

    const result = await agentCapabilitiesApi.create('role1', {
      capability: 'demo',
    });

    expect(mockBuildApiUrl).toHaveBeenCalled();
    expect(mockRequest).toHaveBeenCalledWith(
      'http://localhost:8000/api/test',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result).toEqual(sampleCap);
  });

  it('updates capability', async () => {
    mockRequest.mockResolvedValue({ data: sampleCap });

    const result = await agentCapabilitiesApi.update('1', {
      capability: 'demo2',
    });

    expect(mockBuildApiUrl).toHaveBeenCalled();
    expect(mockRequest).toHaveBeenCalledWith(
      'http://localhost:8000/api/test',
      expect.objectContaining({ method: 'PUT' })
    );
    expect(result).toEqual(sampleCap);
  });

  it('deletes capability', async () => {
    mockRequest.mockResolvedValue({ message: 'deleted' });

    await agentCapabilitiesApi.delete('1');

    expect(mockBuildApiUrl).toHaveBeenCalled();
    expect(mockRequest).toHaveBeenCalledWith('http://localhost:8000/api/test', {
      method: 'DELETE',
    });
  });
});
