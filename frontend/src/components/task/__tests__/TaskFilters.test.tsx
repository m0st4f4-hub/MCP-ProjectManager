import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import TaskFilters from '../TaskFilters';

describe('TaskFilters', () => {
  it('renders and updates search term', () => {
    const setSearchTerm = vi.fn();
    render(
      <TestWrapper>
        <TaskFilters searchTerm="" setSearchTerm={setSearchTerm} />
      </TestWrapper>
    );
    const input = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(setSearchTerm).toHaveBeenCalledWith('test');
  });
});
