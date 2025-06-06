import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import AgentCapabilities from '../AgentCapabilities';
import { agentCapabilitiesApi } from '@/services/api';

// Mock the API module
vi.mock('@/services/api', () => ({
  agentCapabilitiesApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock Chakra UI components that may cause issues in tests
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(), // Suppress toasts
  };
});

describe('AgentCapabilities', () => {
  const user = userEvent.setup();
  const mockCapabilities = [
    { id: '1', name: 'cap1', description: 'desc1', agent_role_id: 'role1', created_at: new Date().toISOString() },
    { id: '2', name: 'cap2', description: 'desc2', agent_role_id: 'role1', created_at: new Date().toISOString() },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    // Provide default mock implementations
    (agentCapabilitiesApi.list as vi.Mock).mockResolvedValue(mockCapabilities);
    (agentCapabilitiesApi.create as vi.Mock).mockResolvedValue(mockCapabilities[0]);
    (agentCapabilitiesApi.delete as vi.Mock).mockResolvedValue({ message: 'Deleted' });
  });

  it('renders capabilities list on load', async () => {
    render(
      <TestWrapper>
        <AgentCapabilities agentRoleId="role1" />
      </TestWrapper>
    );

    // Check for loading state initially
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner

    // Wait for the API call to resolve and check for the rendered items
    await waitFor(() => {
      expect(screen.getByText('cap1')).toBeInTheDocument();
      expect(screen.getByText('cap2')).toBeInTheDocument();
    });

    expect(agentCapabilitiesApi.list).toHaveBeenCalledWith('role1');
  });

  it('allows adding a new capability', async () => {
    render(
      <TestWrapper>
        <AgentCapabilities agentRoleId="role1" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('cap1')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('New capability name');
    const descInput = screen.getByPlaceholderText('Description');
    const addButton = screen.getByRole('button', { name: /add capability/i });

    await user.type(nameInput, 'new_cap');
    await user.type(descInput, 'new_desc');
    await user.click(addButton);

    await waitFor(() => {
      expect(agentCapabilitiesApi.create).toHaveBeenCalledWith('role1', {
        name: 'new_cap',
        description: 'new_desc',
      });
    });
  });

  it('allows deleting a capability', async () => {
    render(
      <TestWrapper>
        <AgentCapabilities agentRoleId="role1" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('cap1')).toBeInTheDocument();
    });

    // Find the delete button for the first capability
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(agentCapabilitiesApi.delete).toHaveBeenCalledWith('1');
    });
  });
});
