import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import { CommentForm } from '../comments';

describe('CommentForm', () => {
  const user = userEvent.setup();
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and submits', async () => {
    const onSubmit = vi.fn();
    render(
      <TestWrapper>
        <CommentForm onSubmit={onSubmit} />
      </TestWrapper>
    );
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'hello');
    const button = screen.getByRole('button');
    await user.click(button);
    expect(onSubmit).toHaveBeenCalledWith('hello');
  });
});
