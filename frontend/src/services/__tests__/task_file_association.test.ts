import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as tasksApi from '../api/tasks'
import { request } from '../api/request'
import { buildApiUrl } from '../api/config'

vi.mock('../api/request')
vi.mock('../api/config')

const mockRequest = vi.mocked(request)
const mockBuildApiUrl = vi.mocked(buildApiUrl)

describe('Task file association API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBuildApiUrl.mockReturnValue('http://test/endpoint')
  })
  afterEach(() => vi.restoreAllMocks())

  it('associates file with task', async () => {
    mockRequest.mockResolvedValue({ file_memory_entity_id: 1 })
    const res = await tasksApi.associateFileWithTask('p1', 2, { file_memory_entity_id: 1 })
    expect(mockBuildApiUrl).toHaveBeenCalled()
    expect(mockRequest).toHaveBeenCalled()
    expect(res.file_memory_entity_id).toBe(1)
  })

  it('disassociates file from task', async () => {
    mockRequest.mockResolvedValue(undefined)
    await tasksApi.disassociateFileFromTask('p1', 2, '3')
    expect(mockBuildApiUrl).toHaveBeenCalledWith('http://test/endpoint', '/p1/tasks/2/files/3')
  })
})
