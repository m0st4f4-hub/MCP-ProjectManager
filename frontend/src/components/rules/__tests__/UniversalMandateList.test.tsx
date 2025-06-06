import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, TestWrapper } from '@/__tests__/utils/test-utils';
import UniversalMandateList from '../UniversalMandateList';
import { useUniversalMandateStore } from '@/store/universalMandateStore';

vi.mock('@/store/universalMandateStore');

const mockUseMandateStore = useUniversalMandateStore as vi.MockedFunction<typeof useUniversalMandateStore>;

describe('UniversalMandateList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMandateStore.mockImplementation((selector: any) =>
      selector({
        mandates: [
          { id: 'm1', title: 'M1', content: '', priority: 5, is_active: true },
        ],
        fetchMandates: vi.fn(),
        removeMandate: vi.fn(),
      } as any)
    );
  });

  it('calls removeMandate when delete button clicked', () => {
    const state = {
      mandates: [
        { id: 'm1', title: 'M1', content: '', priority: 5, is_active: true },
      ],
      fetchMandates: vi.fn(),
      removeMandate: vi.fn(),
    };
    mockUseMandateStore.mockImplementation((selector: any) => selector(state as any));

    render(<UniversalMandateList />, { wrapper: TestWrapper });

    const deleteBtn = screen.getByLabelText('Delete');
    fireEvent.click(deleteBtn);

    expect(state.removeMandate).toHaveBeenCalledWith('m1');
  });
});
