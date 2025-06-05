import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProjectFiles } from '../projects';
import { buildApiUrl, API_CONFIG } from '../config';
import { request } from '../request';

vi.mock('../request', () => ({ request: vi.fn() }));

const requestMock = request as unknown as vi.Mock;

describe('getProjectFiles', () => {
  beforeEach(() => {
    requestMock.mockResolvedValue(undefined);
    vi.clearAllMocks();
  });

  it('calls correct URL with pagination', async () => {
    await getProjectFiles('p1', { page: 2, pageSize: 5 });
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, '/p1/files?page=2&pageSize=5')
    );
  });
});

