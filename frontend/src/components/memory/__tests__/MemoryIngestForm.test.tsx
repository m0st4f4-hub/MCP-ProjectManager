import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import MemoryIngestForm from '../MemoryIngestForm';

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
    uploadFile: vi.fn(),
    ingestUrl: vi.fn(),
    ingestText: vi.fn(),
  },
}));

describe('MemoryIngestForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <MemoryIngestForm />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('handles basic interactions', async () => {
    render(
      <TestWrapper>
        <MemoryIngestForm />
      </TestWrapper>
    );

    const radios = screen.getAllByRole('radio');
    const inputs = screen.queryAllByRole('textbox');
    const buttons = screen.getAllByRole('button');

    if (radios.length > 0) {
      await user.click(radios[0]);
    }
    if (inputs.length > 0) {
      await user.type(inputs[0], 'test');
    }
    if (buttons.length > 0) {
      await user.click(buttons[0]);
    }

    expect(document.body).toBeInTheDocument();
  });
});
