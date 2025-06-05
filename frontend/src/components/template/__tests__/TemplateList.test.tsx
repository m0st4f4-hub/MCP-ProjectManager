import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@/__tests__/utils/test-utils';
import TemplateList from '../TemplateList';
import { useTemplateStore } from '@/store/templateStore';

vi.mock('@/store/templateStore');

const mockUseTemplateStore = useTemplateStore as vi.MockedFunction<
  typeof useTemplateStore
>;

describe('TemplateList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTemplateStore.mockImplementation((selector) =>
      selector({
        templates: [
          { id: 't1', name: 'Temp1', description: '', template_data: {} },
        ],
        fetchTemplates: vi.fn(),
        removeTemplate: vi.fn(),
      } as any)
    );
  });

  it('calls removeTemplate when delete button clicked', () => {
    const state = {
      templates: [
        { id: 't1', name: 'Temp1', description: '', template_data: {} },
      ],
      fetchTemplates: vi.fn(),
      removeTemplate: vi.fn(),
    };
    mockUseTemplateStore.mockImplementation((selector) =>
      selector(state as any)
    );

    render(<TemplateList />);

    const deleteBtn = screen.getByLabelText('Delete');
    fireEvent.click(deleteBtn);

    expect(state.removeTemplate).toHaveBeenCalledWith('t1');
  });
});
