import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/__tests__/utils';
import { TestWrapper } from '@/__tests__/utils';
import TaskPagination from '../TaskPagination';

describe('TaskPagination', () => {
  it('triggers callbacks on navigation', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <TestWrapper>
        <TaskPagination
          currentPage={0}
          itemsPerPage={10}
          totalItems={20}
          onPrevious={onPrev}
          onNext={onNext}
        />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText('Next'));
    expect(onNext).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Previous'));
    expect(onPrev).toHaveBeenCalled();
  });
});
