import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getProjectFiles, associateFileWithProject, disassociateFileFromProject } from '../projects'
import { mockFetchResponse } from '@/__tests__/utils/test-utils'

describe('project file association api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles association flow', async () => {
    const association = { project_id: 'p1', file_id: 'f1' }

    mockFetchResponse([association])
    const list = await getProjectFiles('p1')
    expect(list).toEqual([association])

    mockFetchResponse(association)
    const created = await associateFileWithProject('p1', { file_id: 'f1' })
    expect(created).toEqual(association)

    mockFetchResponse({})
    await disassociateFileFromProject('p1', 'f1')
    expect(global.fetch).toHaveBeenCalled()
  })
})
