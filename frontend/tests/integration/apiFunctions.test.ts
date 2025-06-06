import { describe, it, expect, vi, beforeEach } from 'vitest'
import { projectTemplatesApi } from '../../src/services/api/project_templates'
import { getAuditLogById } from '../../src/services/api/audit_logs'
import { associateFileWithProject } from '../../src/services/api/projects'
import { request } from '../../src/services/api/request'

vi.mock('../../src/services/api/request', () => ({
  request: vi.fn(() => Promise.resolve({}))
}))

describe('frontend api functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates project template via API', async () => {
    await projectTemplatesApi.create({ name: 't', description: 'd' })
    expect(request).toHaveBeenCalledWith(
      expect.stringContaining('/project-templates'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('fetches audit log by id', async () => {
    await getAuditLogById('1')
    expect(request).toHaveBeenCalledWith(
      expect.stringContaining('/audit-logs/1')
    )
  })

  it('associates file with project', async () => {
    await associateFileWithProject('p1', { file_id: '3' })
    expect(request).toHaveBeenCalledWith(
      expect.stringContaining('/projects'),
      expect.objectContaining({ method: 'POST' })
    )
  })
})
