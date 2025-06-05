import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import ProjectFileUpload from '../ProjectFileUpload';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any, d: any) => l,
  };
});

vi.mock('@/services/api/projects', () => ({
  getProjectFiles: vi.fn(),
  associateFileWithProject: vi.fn(),
  disassociateFileFromProject: vi.fn(),
}));

vi.mock('@/services/api', async () => ({
  memoryApi: {
    ingestFile: vi.fn(),
  },
}));

const projectsApi = await import('@/services/api/projects');
const { memoryApi } = await import('@/services/api');

describe('ProjectFileUpload', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (projectsApi.getProjectFiles as any).mockResolvedValue([]);
  });

  it('refreshes list after upload', async () => {
    (memoryApi.ingestFile as any).mockResolvedValue({ id: 1 });
    render(
      <TestWrapper>
        <ProjectFileUpload projectId="p1" />
      </TestWrapper>
    );
    await waitFor(() =>
      expect(projectsApi.getProjectFiles).toHaveBeenCalledWith('p1', 0, 10)
    );
    const input = screen.getByPlaceholderText('/path/to/file.txt');
    await user.type(input, '/tmp/file.txt');
    await user.click(screen.getByRole('button', { name: /upload/i }));
    await waitFor(() => expect(memoryApi.ingestFile).toHaveBeenCalled());
    await waitFor(() =>
      expect(projectsApi.associateFileWithProject).toHaveBeenCalledWith('p1', {
        file_id: '1',
      })
    );
    await waitFor(() =>
      expect(projectsApi.getProjectFiles).toHaveBeenCalledTimes(2)
    );
  });

  it('refreshes list after deletion', async () => {
    (projectsApi.getProjectFiles as any)
      .mockResolvedValueOnce([{ project_id: 'p1', file_id: '1' }])
      .mockResolvedValueOnce([]);
    render(
      <TestWrapper>
        <ProjectFileUpload projectId="p1" />
      </TestWrapper>
    );
    await waitFor(() =>
      expect(projectsApi.getProjectFiles).toHaveBeenCalledWith('p1', 0, 10)
    );
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() =>
      expect(projectsApi.disassociateFileFromProject).toHaveBeenCalledWith(
        'p1',
        '1'
      )
    );
    await waitFor(() =>
      expect(projectsApi.getProjectFiles).toHaveBeenCalledTimes(2)
    );
  });
});
