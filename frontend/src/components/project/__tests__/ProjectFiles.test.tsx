import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
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
      list: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
  memoryApi: {
    ingestFile: vi.fn(),
  },
}));

const { mcpApi, memoryApi } = await import('@/services/api');

describe('ProjectFiles', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (mcpApi.projectFile.list as any).mockResolvedValue([]);
  });

  it('refreshes list after upload', async () => {
    (memoryApi.ingestFile as any).mockResolvedValue({ id: 1 });
    render(
      <TestWrapper>
        <ProjectFiles projectId="p1" />
      </TestWrapper>
    );
    await waitFor(() =>
      expect(mcpApi.projectFile.list).toHaveBeenCalledTimes(1)
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
    await waitFor(() =>
      expect(mcpApi.projectFile.list).toHaveBeenCalledTimes(2)
    );
  });

  it('refreshes list after deletion', async () => {
    (mcpApi.projectFile.list as any)
      .mockResolvedValueOnce([{ project_id: 'p1', file_id: '1' }])
      .mockResolvedValueOnce([]);
    render(
      <TestWrapper>
        <ProjectFiles projectId="p1" />
      </TestWrapper>
    );
    await waitFor(() =>
      expect(mcpApi.projectFile.list).toHaveBeenCalledTimes(1)
    );
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() =>
      expect(mcpApi.projectFile.remove).toHaveBeenCalledWith({
        project_id: 'p1',
        file_id: '1',
      })
    );
    await waitFor(() =>
      expect(mcpApi.projectFile.list).toHaveBeenCalledTimes(2)
    );
  });
});
