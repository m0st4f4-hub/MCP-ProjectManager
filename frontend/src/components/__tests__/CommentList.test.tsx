import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import { CommentList } from '../comments';

const comments = [
  {
    id: '1',
    content: 'Test comment',
    created_at: new Date().toISOString(),
    task_project_id: 'p1',
    task_task_number: 1,
    project_id: 'p1',
    user_id: 'u1',
  },
];

describe('CommentList', () => {
  const user = userEvent.setup();
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <CommentList comments={comments} />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('handles refresh click', async () => {
    const onRefresh = vi.fn();
    render(
      <TestWrapper>
        <CommentList comments={comments} onRefresh={onRefresh} />
      </TestWrapper>
    );
    const button = screen.getByRole('button');
    await user.click(button);
    expect(onRefresh).toHaveBeenCalled();
  });
});
