import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, TestWrapper } from '@/__tests__/utils/test-utils';
import RuleTemplateList from '../RuleTemplateList';
import { useRuleTemplateStore } from '@/store/ruleTemplateStore';

vi.mock('@/store/ruleTemplateStore');

const mockUseRuleTemplateStore = useRuleTemplateStore as vi.MockedFunction<typeof useRuleTemplateStore>;

describe('RuleTemplateList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRuleTemplateStore.mockImplementation((selector: any) =>
      selector({
        templates: [
          { id: 'rt1', template_name: 'Temp1', agent_role_id: 'role1', template_content: '', is_active: true },
        ],
        fetchTemplates: vi.fn(),
        removeTemplate: vi.fn(),
      } as any)
    );
  });

  it('calls removeTemplate when delete button clicked', () => {
    const state = {
      templates: [
        { id: 'rt1', template_name: 'Temp1', agent_role_id: 'role1', template_content: '', is_active: true },
      ],
      fetchTemplates: vi.fn(),
      removeTemplate: vi.fn(),
    };
    mockUseRuleTemplateStore.mockImplementation((selector: any) => selector(state as any));

    render(<RuleTemplateList />, { wrapper: TestWrapper });

    const deleteBtn = screen.getByLabelText('Delete');
    fireEvent.click(deleteBtn);

    expect(state.removeTemplate).toHaveBeenCalledWith('rt1');
  });
});
