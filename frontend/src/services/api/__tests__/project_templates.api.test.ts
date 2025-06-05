import { describe, it, expect, beforeEach, vi } from 'vitest'
import { projectTemplatesApi } from '../project_templates'
import { mockFetchResponse } from '@/__tests__/utils/test-utils'

describe('projectTemplatesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles CRUD flow', async () => {
    const tpl = { id: '1', name: 'T', description: 'd', template_data: {}, created_at: '', updated_at: '' }
    mockFetchResponse(tpl)
    const created = await projectTemplatesApi.create({ name: 'T', description: 'd', template_data: {} })
    expect(created).toEqual(tpl)

    mockFetchResponse([tpl])
    const list = await projectTemplatesApi.list()
    expect(list).toEqual([tpl])

    mockFetchResponse(tpl)
    const got = await projectTemplatesApi.get('1')
    expect(got).toEqual(tpl)

    mockFetchResponse(tpl)
    const updated = await projectTemplatesApi.update('1', { description: 'u' })
    expect(updated).toEqual(tpl)

    mockFetchResponse({ message: 'deleted' })
    const del = await projectTemplatesApi.delete('1')
    expect(del).toEqual({ message: 'deleted' })
  })
})
