import { describe, it, expect, vi } from 'vitest';
import { mcpApi } from '../mcp';

vi.mock('../request', () => ({
  request: vi.fn(async () => ({ foo: 1 }))
}));

describe('mcpApi.tools.metrics', () => {
  it('calls metrics endpoint', async () => {
    const data = await mcpApi.tools.metrics();
    expect(data).toEqual({ foo: 1 });
  });
});
