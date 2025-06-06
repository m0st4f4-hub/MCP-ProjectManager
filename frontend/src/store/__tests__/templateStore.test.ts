import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { useTemplateStore } from '../templateStore';
import { projectTemplatesApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  projectTemplatesApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = vi.mocked(projectTemplatesApi);

const initialState = {
  templates: [],
  loading: false,
  error: null,
};

describe('templateStore', () => {
  beforeEach(() => {
    // Reset Zustand store and mocks before each test
    act(() => {
      useTemplateStore.setState(initialState);
    });
    vi.clearAllMocks();
  });

  it('removeTemplate should call the delete API and remove the template from the state', async () => {
    // Arrange: Set up the initial state with a template
    const initialTemplate = {
      id: '1',
      name: 'Test Template',
      description: 'A template for testing.',
      template_data: { version: 1 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    act(() => {
      useTemplateStore.setState({ templates: [initialTemplate] });
    });
    
    mockedApi.delete.mockResolvedValue({ message: 'Template deleted' });

    // Act: Call the removeTemplate action
    await act(async () => {
      await useTemplateStore.getState().removeTemplate('1');
    });

    // Assert: Check that the API was called and the state was updated
    expect(mockedApi.delete).toHaveBeenCalledWith('1');
    expect(useTemplateStore.getState().templates).toEqual([]);
    expect(useTemplateStore.getState().loading).toBe(false);
    expect(useTemplateStore.getState().error).toBe(null);
  });

  it('should handle errors when removeTemplate fails', async () => {
    // Arrange
    const initialTemplate = { id: '1', name: 'Test Template', description: 'A template for testing.', template_data: { version: 1 }, created_at: new Date().toISOString(), updatedAt: new Date().toISOString() };
    act(() => {
      useTemplateStore.setState({ templates: [initialTemplate] });
    });
    const testError = new Error('Deletion failed');
    mockedApi.delete.mockRejectedValue(testError);

    // Act
    await act(async () => {
      await useTemplateStore.getState().removeTemplate('1');
    });

    // Assert
    expect(mockedApi.delete).toHaveBeenCalledWith('1');
    expect(useTemplateStore.getState().templates).toEqual([initialTemplate]); // State should not change
    expect(useTemplateStore.getState().error).toBe('Failed to remove template');
  });
});
