import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getAuditLogById, getAuditLogsByEntity, getAuditLogsByUser } from '../audit_logs'
import { mockFetchResponse } from '@/__tests__/utils/test-utils'

describe('audit_logs api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches logs', async () => {
    const log = { id: '1', entity_type: 'project', entity_id: 'p1', action: 'a', user_id: 'u', details: null, created_at: '' }

    mockFetchResponse(log)
    const byId = await getAuditLogById('1')
    expect(byId).toEqual(log)

    mockFetchResponse([log])
    const byEntity = await getAuditLogsByEntity('project', 'p1')
    expect(byEntity).toEqual([log])

    mockFetchResponse([log])
    const byUser = await getAuditLogsByUser('u')
    expect(byUser).toEqual([log])
  })
})
