import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import ProjectFiles from '../ProjectFiles';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any, d: any) => l,
  };
});

vi.mock('@/services/api', () => ({
  mcpApi: {
    projectFile: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
  getProjectFiles: vi.fn(),
  memoryApi: {
    ingestFile: vi.fn(),
  },
}));

const { mcpApi, memoryApi, getProjectFiles } = await import('@/services/api');

describe('ProjectFiles', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (getProjectFiles as any).mockResolvedValue({ data: [], total: 0 });
  });

  it('refreshes list after upload', async () => {
    (memoryApi.ingestFile as any).mockResolvedValue({ id: 1 });
    render(
      <TestWrapper>
        <ProjectFiles projectId="p1" />
      </TestWrapper>
    );
    await waitFor(() =>
      expect(getProjectFiles).toHaveBeenCalledWith('p1', 0, 10)
    );
    const input = screen.getByPlaceholderText('/path/to/file.txt');
    await user.type(input, '/tmp/file.txt');
    await user.click(screen.getByRole('button', { name: /upload/i }));
    await waitFor(() => expect(memoryApi.ingestFile).toHaveBeenCalled());
    await waitFor(() =>
      expect(mcpApi.projectFile.add).toHaveBeenCalledWith({
        project_id: 'p1',
        file_id: '1',
      })
    );
    await waitFor(() => expect(getProjectFiles).toHaveBeenCalledTimes(2));
  });

  it('refreshes list after deletion', async () => {
    (getProjectFiles as any)
      .mockResolvedValueOnce({
        data: [{ project_id: 'p1', file_id: '1' }],
        total: 1,
      })
      .mockResolvedValueOnce({ data: [], total: 0 });
    render(
      <TestWrapper>
        <ProjectFiles projectId="p1" />
      </TestWrapper>
    );
    await waitFor(() =>
      expect(getProjectFiles).toHaveBeenCalledWith('p1', 0, 10)
    );
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() =>
      expect(mcpApi.projectFile.remove).toHaveBeenCalledWith({
        project_id: 'p1',
        file_id: '1',
      })
    );
    await waitFor(() => expect(getProjectFiles).toHaveBeenCalledTimes(2));
  });
});
