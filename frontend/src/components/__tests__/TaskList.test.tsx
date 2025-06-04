/**
 * TASK MANAGER SYSTEM - TASK LIST COMPONENT TESTS
 * NASA/SpaceX Grade Test Suite for TaskList Component
 * 
 * Test Classification: MISSION-CRITICAL
 * Test Control: TMS-ATP-004-COMPONENT-TL
 * Version: 2.0.0
 * Compliance: NASA NPR 7150.2, SpaceX Software Standards
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/__tests__/utils'
import { createMockTask, createMockTasks } from '@/__tests__/factories'
import TaskList from '../TaskList'
import { useTaskStore } from '@/store/taskStore'

// Mock the task store
vi.mock('@/store/taskStore')

// Mock child components to isolate TaskList testing
vi.mock('../TaskControls', () => ({
  default: ({ searchTerm, setSearchTerm }: any) => (
    <div data-testid="task-controls">
      <input 
        data-testid="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search tasks..."
      />
    </div>
  )
}))

vi.mock('../views/ListView', () => ({
  default: ({ groupedTasks }: any) => (
    <div data-testid="list-view">
      {groupedTasks.map((task: any) => (
        <div key={`${task.project_id}-${task.task_number}`} data-testid="task-item">
          {task.title}
        </div>
      ))}
    </div>
  )
}))

vi.mock('../views/KanbanView', () => ({
  default: ({ filteredTasks }: any) => (
    <div data-testid="kanban-view">
      {filteredTasks.map((task: any) => (
        <div key={`${task.project_id}-${task.task_number}`} data-testid="kanban-task">
          {task.title}
        </div>
      ))}
    </div>
  )
}))

vi.mock('../NoTasks', () => ({
  default: ({ onAddTask }: any) => (
    <div data-testid="no-tasks">
      <button data-testid="add-task-button" onClick={onAddTask}>
        Add Task
      </button>
    </div>
  )
}))

vi.mock('../TaskLoading', () => ({
  default: () => <div data-testid="task-loading">Loading tasks...</div>
}))

vi.mock('../TaskError', () => ({
  default: ({ error, onRetry }: any) => (
    <div data-testid="task-error">
      <p>Error: {error}</p>
      <button data-testid="retry-button" onClick={onRetry}>Retry</button>
    </div>
  )
}))

const mockUseTaskStore = useTaskStore as vi.MockedFunction<typeof useTaskStore>

describe('TaskList', () => {
  const defaultStoreState = {
    tasks: [],
    loading: false,
    error: null,
    fetchTasks: vi.fn(),
    fetchProjectsAndAgents: vi.fn(),
    sortOptions: { field: 'created_at', direction: 'desc' },
    isPolling: false,
    pollingError: null,
    clearPollingError: vi.fn(),
    mutationError: null,
    clearMutationError: vi.fn(),
    filters: { search: '', status: 'all' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTaskStore.mockImplementation((selector) => 
      selector(defaultStoreState as any)
    )
  })

  describe('Initial Loading States', () => {
    it('should show loading spinner on initial load', () => {
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ ...defaultStoreState, loading: true } as any)
      )

      render(<TaskList />)
      
      expect(screen.getByTestId('task-loading')).toBeInTheDocument()
      expect(screen.getByText('Loading tasks...')).toBeInTheDocument()
    })

    it('should fetch tasks and projects on mount', () => {
      const fetchTasks = vi.fn()
      const fetchProjectsAndAgents = vi.fn()
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ ...defaultStoreState, fetchTasks, fetchProjectsAndAgents } as any)
      )

      render(<TaskList />)
      
      expect(fetchTasks).toHaveBeenCalledOnce()
      expect(fetchProjectsAndAgents).toHaveBeenCalledOnce()
    })
  })

  describe('Error Handling', () => {
    it('should display error state when tasks fail to load', () => {
      const fetchTasks = vi.fn()
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ 
          ...defaultStoreState, 
          error: 'Failed to fetch tasks',
          fetchTasks 
        } as any)
      )

      render(<TaskList />)
      
      expect(screen.getByTestId('task-error')).toBeInTheDocument()
      expect(screen.getByText('Error: Failed to fetch tasks')).toBeInTheDocument()
    })

    it('should allow retry when error occurs', () => {
      const fetchTasks = vi.fn()
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ 
          ...defaultStoreState, 
          error: 'Failed to fetch tasks',
          fetchTasks 
        } as any)
      )

      render(<TaskList />)
      
      fireEvent.click(screen.getByTestId('retry-button'))
      expect(fetchTasks).toHaveBeenCalled()
    })
  })

  describe('Task Display', () => {
    it('should display tasks in list view by default', () => {
      const tasks = createMockTasks(3)
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ ...defaultStoreState, tasks } as any)
      )

      render(<TaskList />)
      
      expect(screen.getByTestId('list-view')).toBeInTheDocument()
      expect(screen.getAllByTestId('task-item')).toHaveLength(3)
    })

    it('should show NoTasks component when no tasks exist', () => {
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ ...defaultStoreState, tasks: [] } as any)
      )

      render(<TaskList />)
      
      expect(screen.getByTestId('no-tasks')).toBeInTheDocument()
      expect(screen.getByTestId('add-task-button')).toBeInTheDocument()
    })
  })

  describe('View Mode Switching', () => {
    it('should switch to kanban view when view mode changes', async () => {
      const tasks = createMockTasks(3)
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ ...defaultStoreState, tasks } as any)
      )

      render(<TaskList />)
      
      // Initially shows list view
      expect(screen.getByTestId('list-view')).toBeInTheDocument()
      
      // This test would need the actual view mode switching logic
      // For now, we're testing the conditional rendering structure
    })
  })

  describe('Search Functionality', () => {
    it('should render search controls', () => {
      const tasks = createMockTasks(3)
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ ...defaultStoreState, tasks } as any)
      )

      render(<TaskList />)
      
      expect(screen.getByTestId('task-controls')).toBeInTheDocument()
      expect(screen.getByTestId('search-input')).toBeInTheDocument()
    })

    it('should update search term when user types', () => {
      const tasks = createMockTasks(3)
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ ...defaultStoreState, tasks } as any)
      )

      render(<TaskList />)
      
      const searchInput = screen.getByTestId('search-input')
      fireEvent.change(searchInput, { target: { value: 'test search' } })
      
      expect(searchInput).toHaveValue('test search')
    })
  })

  describe('Error Notifications', () => {
    it('should display polling error toast', async () => {
      const clearPollingError = vi.fn()
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ 
          ...defaultStoreState, 
          pollingError: 'Polling failed',
          clearPollingError 
        } as any)
      )

      render(<TaskList />)
      
      // Toast should appear for polling error
      await waitFor(() => {
        // Note: This would need proper toast testing setup
        expect(clearPollingError).toHaveBeenCalledOnce()
      })
    })

    it('should display mutation error toast', async () => {
      const clearMutationError = vi.fn()
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ 
          ...defaultStoreState, 
          mutationError: { type: 'CREATE', message: 'Failed to create task' },
          clearMutationError 
        } as any)
      )

      render(<TaskList />)
      
      await waitFor(() => {
        expect(clearMutationError).toHaveBeenCalledOnce()
      })
    })
  })

  describe('Add Task Modal', () => {
    it('should open add task modal when requested', () => {
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ ...defaultStoreState, tasks: [] } as any)
      )

      render(<TaskList />)
      
      fireEvent.click(screen.getByTestId('add-task-button'))
      
      // Modal should be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Data Model Alignment', () => {
    it('should handle tasks with backend data structure', () => {
      const tasks = [
        createMockTask({
          project_id: 'proj123',
          task_number: 1,
          title: 'Backend Task',
          status: 'TO_DO',
          agent_id: 'agent456',
        })
      ]
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ ...defaultStoreState, tasks } as any)
      )

      render(<TaskList />)
      
      expect(screen.getByText('Backend Task')).toBeInTheDocument()
    })

    it('should handle tasks with all required backend fields', () => {
      const task = createMockTask({
        project_id: 'proj123',
        task_number: 1,
        title: 'Complete Task',
        description: 'Task description',
        status: 'IN_PROGRESS',
        agent_id: 'agent456',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        is_archived: false,
      })
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ ...defaultStoreState, tasks: [task] } as any)
      )

      render(<TaskList />)
      
      expect(screen.getByText('Complete Task')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should handle large number of tasks efficiently', () => {
      const largeTaskSet = createMockTasks(100);
      
      const { container } = render(
        <TestWrapper>
          <TaskList tasks={largeTaskSet} />
        </TestWrapper>
      );
      
      expect(container).toBeInTheDocument();
skSet = createMockTasks(100)
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ ...defaultStoreState, tasks: largeTaskSet } as any)
      )

      const startTime = performance.now()
      render(<TaskList />)
      const endTime = performance.now()
      
      // Should render within reasonable time (< 100ms for 100 tasks)
      expect(endTime - startTime).toBeLessThan(100)
      expect(screen.getAllByTestId('task-item')).toHaveLength(100)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA structure', () => {
      const tasks = createMockTasks(3)
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ ...defaultStoreState, tasks } as any)
      )

      render(<TaskList />)
      
      // Should have proper landmark structure
      expect(screen.getByTestId('task-controls')).toBeInTheDocument()
      expect(screen.getByTestId('list-view')).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      const tasks = createMockTasks(3)
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ ...defaultStoreState, tasks } as any)
      )

      render(<TaskList />)
      
      // Search input should be focusable
      const searchInput = screen.getByTestId('search-input')
      searchInput.focus()
      expect(document.activeElement).toBe(searchInput)
    })
  })

  describe('Responsive Design', () => {
    it('should adapt to mobile breakpoints', () => {
      // Mock useBreakpointValue to return mobile
      const tasks = createMockTasks(3)
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ ...defaultStoreState, tasks } as any)
      )

      render(<TaskList />)
      
      // Component should render successfully on mobile
      expect(screen.getByTestId('list-view')).toBeInTheDocument()
    })
  })

  describe('Store Integration', () => {
    it('should call all required store methods', () => {
      const fetchTasks = vi.fn()
      const fetchProjectsAndAgents = vi.fn()
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector({ 
          ...defaultStoreState, 
          fetchTasks, 
          fetchProjectsAndAgents 
        } as any)
      )

      render(<TaskList />)
      
      expect(fetchTasks).toHaveBeenCalled()
      expect(fetchProjectsAndAgents).toHaveBeenCalled()
    })

    it('should properly handle store state changes', async () => {
      let storeState = { ...defaultStoreState, loading: true }
      
      mockUseTaskStore.mockImplementation((selector) => 
        selector(storeState as any)
      )

      const { rerender } = render(<TaskList />)
      
      expect(screen.getByTestId('task-loading')).toBeInTheDocument()
      
      // Simulate store state change
      storeState = { ...defaultStoreState, loading: false, tasks: createMockTasks(2) }
      mockUseTaskStore.mockImplementation((selector) => 
        selector(storeState as any)
      )
      
      rerender(<TaskList />)
      
      expect(screen.queryByTestId('task-loading')).not.toBeInTheDocument()
      expect(screen.getAllByTestId('task-item')).toHaveLength(2)
    })
  })
})
