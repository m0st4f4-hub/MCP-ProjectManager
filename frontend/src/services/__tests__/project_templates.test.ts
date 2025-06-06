import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as templatesApi from '../api/project_templates'
import { request } from '../api/request'
import { buildApiUrl } from '../api/config'

vi.mock('../api/request')
vi.mock('../api/config')

const mockRequest = vi.mocked(request)
const mockBuildApiUrl = vi.mocked(buildApiUrl)

describe('Project Templates API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBuildApiUrl.mockReturnValue('http://test/api')
  })
  afterEach(() => vi.restoreAllMocks())

  it('creates a template', async () => {
    mockRequest.mockResolvedValue({ id: 't1', name: 'T' })
    const data = { name: 'T', description: 'd', template_data: {} }
    const result = await templatesApi.projectTemplatesApi.create(data)
    expect(mockBuildApiUrl).toHaveBeenCalled()
    expect(mockRequest).toHaveBeenCalledWith('http://test/api', expect.any(Object))
    expect(result).toEqual({ id: 't1', name: 'T' })
  })

  it('lists templates with pagination', async () => {
    mockRequest.mockResolvedValue([])
    await templatesApi.projectTemplatesApi.list(5, 20)
    expect(mockBuildApiUrl).toHaveBeenCalledWith(expect.any(String), '?skip=5&limit=20')
  })
})
