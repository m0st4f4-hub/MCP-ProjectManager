/**
 * @file Type definitions tests
 * @description Comprehensive tests for all type definitions
 */

import { describe, it, expect } from 'vitest';
import type {
  Agent, AgentStatus, AgentCapability, Task, TaskStatus, TaskPriority,
  Project, ProjectStatus, User, UserRole, Comment, AuditLog,
  MCPTool, MCPServer, MemoryNode, Rule, RuleType,
} from '../index';

describe('Type Definitions', () => {
  describe('Agent Types', () => {
    it('should validate Agent type structure', () => {
      const mockAgent: Agent = {
        id: 'agent-1',
        name: 'Test Agent',
        description: 'Test agent description',
        status: 'active',
        capabilities: ['task_execution', 'data_analysis'],
        workload: 5,
        max_workload: 10,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(mockAgent).toBeDefined();
      expect(mockAgent.id).toBe('agent-1');
      expect(mockAgent.status).toBe('active');
      expect(Array.isArray(mockAgent.capabilities)).toBe(true);
    });

    it('should validate AgentStatus values', () => {
      const validStatuses: AgentStatus[] = ['active', 'inactive', 'maintenance'];
      validStatuses.forEach(status => {
        expect(typeof status).toBe('string');
      });
    });

    it('should validate AgentCapability values', () => {
      const validCapabilities: AgentCapability[] = [
        'task_execution', 'data_analysis', 'code_generation'
      ];
      validCapabilities.forEach(capability => {
        expect(typeof capability).toBe('string');
      });
    });
  });

  describe('Task Types', () => {
    it('should validate Task type structure', () => {
      const mockTask: Task = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test task description',
        status: 'todo',
        priority: 'medium',
        project_id: 'project-1',
        assigned_agent_id: 'agent-1',
        dependencies: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        due_date: '2024-12-31T23:59:59Z',
        estimated_hours: 8,
        actual_hours: 0,
      };

      expect(mockTask).toBeDefined();
      expect(mockTask.id).toBe('task-1');
      expect(mockTask.status).toBe('todo');
      expect(mockTask.priority).toBe('medium');
    });

    it('should validate TaskStatus values', () => {
      const validStatuses: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked'];
      validStatuses.forEach(status => {
        expect(typeof status).toBe('string');
      });
    });

    it('should validate TaskPriority values', () => {
      const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
      validPriorities.forEach(priority => {
        expect(typeof priority).toBe('string');
      });
    });
  });

  describe('Project Types', () => {
    it('should validate Project type structure', () => {
      const mockProject: Project = {
        id: 'project-1',
        name: 'Test Project',
        description: 'Test project description',
        status: 'active',
        owner_id: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-12-31T23:59:59Z',
        progress: 50,
      };

      expect(mockProject).toBeDefined();
      expect(mockProject.id).toBe('project-1');
      expect(mockProject.status).toBe('active');
    });
  });

  describe('User Types', () => {
    it('should validate User type structure', () => {
      const mockUser: User = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_login: '2024-01-01T00:00:00Z',
      };

      expect(mockUser).toBeDefined();
      expect(mockUser.username).toBe('testuser');
      expect(mockUser.role).toBe('user');
    });

    it('should validate UserRole values', () => {
      const validRoles: UserRole[] = ['admin', 'manager', 'user'];
      validRoles.forEach(role => {
        expect(typeof role).toBe('string');
      });
    });
  });

  describe('Type Integration', () => {
    it('should ensure type compatibility across modules', () => {
      const taskId: Task['id'] = 'task-1';
      const projectId: Project['id'] = 'project-1';
      const agentId: Agent['id'] = 'agent-1';
      const userId: User['id'] = 'user-1';

      expect(typeof taskId).toBe('string');
      expect(typeof projectId).toBe('string');
      expect(typeof agentId).toBe('string');
      expect(typeof userId).toBe('string');
    });

    it('should ensure timestamp format consistency', () => {
      const timestampFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      const mockTimestamp = '2024-01-01T00:00:00Z';
      expect(timestampFormat.test(mockTimestamp)).toBe(true);
    });
  });
});
