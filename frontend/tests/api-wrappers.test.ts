import { describe, it, expect, beforeEach, vi } from 'vitest';
import { errorProtocolsApi } from '@/services/api/error_protocols';
import { forbiddenActionsApi } from '@/services/api/forbidden_actions';
import { projectTemplatesApi, deleteTemplate } from '@/services/api/project_templates';
import { agentCapabilitiesApi } from '@/services/api/agent_capabilities';
import { buildApiUrl, API_CONFIG } from '@/services/api/config';

const fetchMock = global.fetch as unknown as vi.Mock;

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
});

describe('errorProtocolsApi', () => {
  it('create sends correct payload', async () => {
    const data = {
      agent_role_id: 'r1',
      error_type: 'E',
      protocol: 'P',
      is_active: true,
    };
    await errorProtocolsApi.create(data);
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/error-protocol/add?role_id=r1'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ error_type: 'E', protocol: 'P', is_active: true }),
      }),
    );
  });

  it('list calls correct URL', async () => {
    await errorProtocolsApi.list('r2');
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/error-protocol/list?role_id=r2'),
      expect.any(Object),
    );
  });

  it('remove uses DELETE method', async () => {
    await errorProtocolsApi.remove('p1');
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/error-protocol/remove?protocol_id=p1'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

describe('forbiddenActionsApi', () => {
  it('create posts to correct endpoint', async () => {
    await forbiddenActionsApi.create('role1', { action: 'a', reason: 'r' });
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/roles/role1/forbidden-actions'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ action: 'a', reason: 'r' }),
      }),
    );
  });

  it('list fetches forbidden actions', async () => {
    await forbiddenActionsApi.list('role2');
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/roles/role2/forbidden-actions'),
      expect.any(Object),
    );
  });

  it('get requests single action', async () => {
    await forbiddenActionsApi.get('f1');
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/roles/forbidden-actions/f1'),
      expect.any(Object),
    );
  });

  it('update sends PUT with body', async () => {
    await forbiddenActionsApi.update('f2', { action: 'b' });
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/roles/forbidden-actions/f2'),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ action: 'b' }) }),
    );
  });

  it('delete removes action', async () => {
    await forbiddenActionsApi.delete('f3');
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/roles/forbidden-actions/f3'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

describe('agentCapabilitiesApi', () => {
  it('list builds query params', async () => {
    await agentCapabilitiesApi.list('roleA');
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/roles/capabilities?agent_role_id=roleA'),
      expect.any(Object),
    );
  });

  it('get retrieves capability', async () => {
    await agentCapabilitiesApi.get('cap1');
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/roles/capabilities/cap1'),
      expect.any(Object),
    );
  });

  it('create posts capability data', async () => {
    await agentCapabilitiesApi.create('roleB', { name: 'n' } as any);
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/roles/roleB/capabilities'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'n' }) }),
    );
  });

  it('update puts capability data', async () => {
    await agentCapabilitiesApi.update('cap2', { description: 'd' } as any);
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/roles/capabilities/cap2'),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ description: 'd' }) }),
    );
  });

  it('delete sends DELETE', async () => {
    await agentCapabilitiesApi.delete('cap3');
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/roles/capabilities/cap3'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

describe('projectTemplatesApi', () => {
  it('create posts new template', async () => {
    await projectTemplatesApi.create({ name: 't', template_data: {} });
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl('/project-templates/'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 't', template_data: {} }) }),
    );
  });

  it('list adds pagination params', async () => {
    await projectTemplatesApi.list(5, 10);
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl('/project-templates/', '?skip=5&limit=10'),
      expect.any(Object),
    );
  });

  it('get fetches single template', async () => {
    await projectTemplatesApi.get('tpl1');
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl('/project-templates/', '/tpl1'),
      expect.any(Object),
    );
  });

  it('update sends PUT body', async () => {
    await projectTemplatesApi.update('tpl2', { description: 'd' });
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl('/project-templates/', '/tpl2'),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ description: 'd' }) }),
    );
  });

  it('deleteTemplate issues DELETE', async () => {
    await deleteTemplate('tpl3');
    expect(fetchMock).toHaveBeenCalledWith(
      buildApiUrl('/project-templates/', '/tpl3'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
