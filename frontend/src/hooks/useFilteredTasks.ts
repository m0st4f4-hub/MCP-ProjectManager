import { useMemo } from 'react';
import { Task } from '../types';

interface TaskFilters {
  status?: string;
  priority?: string;
  assignee?: string;
  search?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface UseFilteredTasksReturn {
  filteredTasks: Task[];
  taskCounts: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
}

/**
 * Custom hook for filtering and organizing tasks
 * @param tasks - Array of tasks to filter
 * @param filters - Filter criteria
 * @returns Filtered tasks and statistics
 */
export function useFilteredTasks(
  tasks: Task[],
  filters: TaskFilters = {}
): UseFilteredTasksReturn {
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    
    // Filter by status
    if (filters.status && filters.status !== 'all') {
      result = result.filter(task => task.status === filters.status);
    }
    
    // Filter by priority
    if (filters.priority && filters.priority !== 'all') {
      result = result.filter(task => task.priority === filters.priority);
    }
    
    // Filter by assignee
    if (filters.assignee && filters.assignee !== 'all') {
      result = result.filter(task => task.assignee_id === filters.assignee);
    }
    
    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(task => 
        task.tags?.some(tag => filters.tags!.includes(tag))
      );
    }
    
    // Filter by date range
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      result = result.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate >= start && taskDate <= end;
      });
    }
    
    // Sort by priority and due date
    result.sort((a, b) => {
      // Priority order: high > medium > low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then by due date (earliest first)
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      
      // Finally by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    return result;
  }, [tasks, filters]);
  
  const taskCounts = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const pending = tasks.filter(task => task.status === 'pending').length;
    
    return {
      total,
      completed,
      inProgress,
      pending
    };
  }, [tasks]);
  
  return {
    filteredTasks,
    taskCounts
  };
}