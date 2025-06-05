import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import TaskFiles from '../TaskFiles';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any, d: any) => l,
  };
});

vi.mock('@/services/api', () => ({
  memoryApi: {
    ingestFile: vi.fn(),
    getEntity: vi.fn(),
  },
}));

vi.mock('@/services/api/tasks', () => ({
  getFilesAssociatedWithTask: vi.fn(),
  associateFileWithTask: vi.fn(),
  disassociateFileFromTask: vi.fn(),
}));

const { memoryApi } = await import('@/services/api');
const tasksApi = await import('@/services/api/tasks');

describe('TaskFiles', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (tasksApi.getFilesAssociatedWithTask as any).mockResolvedValue([]);
  });

  it('refreshes list after upload', async () => {
    (memoryApi.ingestFile as any).mockResolvedValue({ id: 1 });
    render(
      <TestWrapper>
        <TaskFiles projectId="p1" taskNumber={1} />
      </TestWrapper>
    );
    await waitFor(() =>
      expect(tasksApi.getFilesAssociatedWithTask).toHaveBeenCalledWith('p1', 1)
    );
    const input = screen.getByPlaceholderText('/path/to/file.txt');
    await user.type(input, '/tmp/file.txt');
    await user.click(screen.getByRole('button', { name: /upload/i }));
    await waitFor(() => expect(memoryApi.ingestFile).toHaveBeenCalled());
    await waitFor(() =>
      expect(tasksApi.associateFileWithTask).toHaveBeenCalledWith('p1', 1, {
        file_id: '1',
      })
    );
    await waitFor(() =>
      expect(tasksApi.getFilesAssociatedWithTask).toHaveBeenCalledTimes(2)
    );
  });

  it('refreshes list after deletion', async () => {
    (tasksApi.getFilesAssociatedWithTask as any)
      .mockResolvedValueOnce([{ file_id: '1', task_project_id: 'p1', task_number: 1 }])
      .mockResolvedValueOnce([]);
    render(
      <TestWrapper>
        <TaskFiles projectId="p1" taskNumber={1} />
      </TestWrapper>
    );
    await waitFor(() =>
      expect(tasksApi.getFilesAssociatedWithTask).toHaveBeenCalledWith('p1', 1)
    );
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() =>
      expect(tasksApi.disassociateFileFromTask).toHaveBeenCalledWith('p1', 1, '1')
    );
    await waitFor(() =>
      expect(tasksApi.getFilesAssociatedWithTask).toHaveBeenCalledTimes(2)
    );
  });
});

