import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from 'react-dom/test-utils'
import { useTemplateStore } from '../templateStore'
import { projectTemplatesApi } from '@/services/api'

vi.mock('@/services/api', () => ({
  projectTemplatesApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockedApi = vi.mocked(projectTemplatesApi)

const initialState = {
  templates: [],
  loading: false,
  error: null,
}

describe('templateStore', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      ...initialState,
      clearError: useTemplateStore.getState().clearError,
    } as any)
    vi.clearAllMocks()
  })

  it('removeTemplate calls API and updates state', async () => {
    useTemplateStore.setState({
      ...initialState,
      templates: [
        {
          id: '1',
          name: 'Temp',
          description: null,
          template_data: {},
          created_at: '',
          updated_at: '',
        },
      ],
    } as any)
    mockedApi.delete.mockResolvedValueOnce({} as any)

    await act(async () => {
      await useTemplateStore.getState().removeTemplate('1')
    })

    expect(mockedApi.delete).toHaveBeenCalledWith('1')
    expect(useTemplateStore.getState().templates).toEqual([])
  })
})
