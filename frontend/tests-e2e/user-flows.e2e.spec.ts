/**
 * User Flow Tests for Task Manager
 * 
 * This test suite implements end-to-end tests for complete user journeys,
 * multi-user interaction scenarios, and session management.
 */

import { test, expect } from '@playwright/test';
import { TaskStatus } from '../src/types/task';

// Helper class for common user flow operations
class UserFlowPage {
  constructor(page) {
    this.page = page;
  }

  async login(username, password) {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="username-input"]', username);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load after login
    await this.page.waitForSelector('[data-testid="dashboard-content"]');
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    
    // Wait for redirect to login page
    await this.page.waitForURL('**/login');
  }

  async createProject(name, description) {
    await this.page.goto('/projects');
    await this.page.click('[data-testid="create-project-button"]');
    
    await this.page.fill('[data-testid="project-name-input"]', name);
    await this.page.fill('[data-testid="project-description-input"]', description);
    await this.page.click('[data-testid="submit-project-button"]');
    
    // Wait for project to be created and visible in the list
    await this.page.waitForSelector(`[data-testid="project-item"]:has-text("${name}")`);
  }

  async createTask(projectId, title, description, status = TaskStatus.TO_DO) {
    await this.page.goto(`/projects/${projectId}/tasks`);
    await this.page.click('[data-testid="create-task-button"]');
    
    await this.page.fill('[data-testid="task-title-input"]', title);
    await this.page.fill('[data-testid="task-description-input"]', description);
    await this.page.selectOption('[data-testid="task-status-select"]', status);
    await this.page.click('[data-testid="submit-task-button"]');
    
    // Wait for task to be created and visible in the list
    await this.page.waitForSelector(`[data-testid="task-item"]:has-text("${title}")`);
  }

  async updateTaskStatus(projectId, taskNumber, newStatus) {
    await this.page.goto(`/projects/${projectId}/tasks`);
    
    // Find the task and click its status dropdown
    await this.page.click(`[data-testid="task-${projectId}-${taskNumber}-status-dropdown"]`);
    await this.page.click(`[data-testid="status-option-${newStatus}"]`);
    
    // Wait for status to update
    await this.page.waitForSelector(`[data-testid="task-${projectId}-${taskNumber}-status"]:has-text("${newStatus}")`);
  }

  async addComment(projectId, taskNumber, commentText) {
    await this.page.goto(`/projects/${projectId}/tasks/${taskNumber}`);
    
    await this.page.fill('[data-testid="comment-input"]', commentText);
    await this.page.click('[data-testid="submit-comment-button"]');
    
    // Wait for comment to appear
    await this.page.waitForSelector(`[data-testid="comment-item"]:has-text("${commentText}")`);
  }

  async switchToKanbanView() {
    await this.page.click('[data-testid="view-mode-toggle"]');
    await this.page.click('[data-testid="kanban-view-option"]');
    
    // Wait for kanban board to load
    await this.page.waitForSelector('[data-testid="kanban-board"]');
  }
}

test.describe('User Flows', () => {
  let userFlow;

  test.beforeEach(async ({ page }) => {
    userFlow = new UserFlowPage(page);
    
    // Set up mock API responses for consistent testing
    await page.route('**/api/v1/auth/login', async (route) => {
      const requestBody = JSON.parse(route.request().postData());
      
      if (requestBody.username === 'testuser' && requestBody.password === 'password') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock_valid_token',
            token_type: 'bearer',
            user: {
              id: 'user1',
              username: 'testuser',
              email: 'test@example.com',
              role: 'USER'
            }
          })
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            detail: 'Invalid credentials'
          })
        });
      }
    });
  });

  test('Complete project management workflow', async ({ page }) => {
    // 1. Login
    await userFlow.login('testuser', 'password');
    
    // Mock project creation API
    await page.route('**/api/v1/projects', async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = JSON.parse(route.request().postData());
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'project1',
            name: requestBody.name,
            description: requestBody.description,
            created_at: new Date().toISOString(),
            is_archived: false
          })
        });
      }
    });
    
    // Mock tasks API
    await page.route('**/api/v1/projects/project1/tasks', async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = JSON.parse(route.request().postData());
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            project_id: 'project1',
            task_number: 1,
            title: requestBody.title,
            description: requestBody.description,
            status: requestBody.status || TaskStatus.TO_DO,
            created_at: new Date().toISOString(),
            is_archived: false
          })
        });
      }
    });
    
    // Mock task status update API
    await page.route('**/api/v1/projects/project1/tasks/1', async (route) => {
      if (route.request().method() === 'PATCH') {
        const requestBody = JSON.parse(route.request().postData());
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            project_id: 'project1',
            task_number: 1,
            title: 'Task Flow Test',
            description: 'Testing complete user flow',
            status: requestBody.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_archived: false
          })
        });
      }
    });
    
    // Mock comments API
    await page.route('**/api/v1/projects/project1/tasks/1/comments', async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = JSON.parse(route.request().postData());
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'comment1',
            content: requestBody.content,
            author: 'testuser',
            created_at: new Date().toISOString()
          })
        });
      }
    });
    
    // 2. Create a project
    await userFlow.createProject('Flow Test Project', 'Testing the complete user flow');
    
    // 3. Create a task
    await userFlow.createTask('project1', 'Task Flow Test', 'Testing complete user flow');
    
    // 4. Update task status
    await userFlow.updateTaskStatus('project1', 1, 'IN_PROGRESS');
    
    // 5. Add a comment
    await userFlow.addComment('project1', 1, 'Working on this task now');
    
    // 6. Switch to Kanban view
    await userFlow.switchToKanbanView();
    
    // Verify task appears in the correct column
    await expect(page.locator('[data-testid="kanban-column-IN_PROGRESS"]')).toContainText('Task Flow Test');
    
    // 7. Complete the task
    await page.dragAndDrop(
      '[data-testid="task-card-project1-1"]', 
      '[data-testid="kanban-column-COMPLETED"]'
    );
    
    // Verify task moved to completed column
    await expect(page.locator('[data-testid="kanban-column-COMPLETED"]')).toContainText('Task Flow Test');
    
    // 8. Logout
    await userFlow.logout();
    
    // Verify back at login page
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('Multi-user collaboration flow', async ({ browser }) => {
    // Create two browser contexts to simulate two users
    const userContext = await browser.newContext();
    const managerContext = await browser.newContext();
    
    const userPage = await userContext.newPage();
    const managerPage = await managerContext.newPage();
    
    const userFlow1 = new UserFlowPage(userPage);
    const userFlow2 = new UserFlowPage(managerPage);
    
    // Setup API mocks for both users
    for (const page of [userPage, managerPage]) {
      // Mock login
      await page.route('**/api/v1/auth/login', async (route) => {
        const requestBody = JSON.parse(route.request().postData());
        const isManager = requestBody.username === 'manager';
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: isManager ? 'manager_token' : 'user_token',
            token_type: 'bearer',
            user: {
              id: isManager ? 'manager1' : 'user1',
              username: requestBody.username,
              email: `${requestBody.username}@example.com`,
              role: isManager ? 'MANAGER' : 'USER'
            }
          })
        });
      });
      
      // Mock projects and tasks APIs similar to previous test
      // ... (similar route handlers as in previous test)
    }
    
    // 1. Manager creates a project and task
    await userFlow2.login('manager', 'password');
    await userFlow2.createProject('Collaboration Project', 'For testing multi-user collaboration');
    await userFlow2.createTask('project1', 'Collaboration Task', 'This task requires collaboration');
    
    // 2. Regular user logs in and views the project
    await userFlow1.login('testuser', 'password');
    await userPage.goto('/projects/project1');
    
    // Verify user can see the project
    await expect(userPage.locator('[data-testid="project-title"]')).toContainText('Collaboration Project');
    
    // 3. User adds a comment to the task
    await userFlow1.addComment('project1', 1, 'I can help with this task');
    
    // 4. Manager assigns task to user
    await managerPage.goto('/projects/project1/tasks/1');
    await managerPage.click('[data-testid="assign-task-button"]');
    await managerPage.click('[data-testid="user-option-user1"]');
    
    // 5. User updates task status
    await userFlow1.updateTaskStatus('project1', 1, 'IN_PROGRESS');
    
    // 6. Manager and user can both see the update
    await managerPage.reload();
    await expect(managerPage.locator('[data-testid="task-status"]')).toContainText('IN_PROGRESS');
    
    // 7. User completes the task
    await userFlow1.updateTaskStatus('project1', 1, 'COMPLETED');
    
    // 8. Manager approves and closes the task
    await managerPage.reload();
    await expect(managerPage.locator('[data-testid="task-status"]')).toContainText('COMPLETED');
    await managerPage.click('[data-testid="close-task-button"]');
    
    // 9. Both users log out
    await userFlow1.logout();
    await userFlow2.logout();
    
    // Clean up contexts
    await userContext.close();
    await managerContext.close();
  });

  test('Session management flow', async ({ page }) => {
    // Mock auth APIs
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'session_test_token',
          token_type: 'bearer',
          user: {
            id: 'user1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'USER'
          }
        })
      });
    });
    
    // Mock token refresh API
    await page.route('**/api/v1/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'refreshed_token',
          token_type: 'bearer'
        })
      });
    });
    
    // 1. Login and verify session is created
    await userFlow.login('testuser', 'password');
    
    // Check local storage for token
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBe('session_test_token');
    
    // 2. Navigate away and return - session should persist
    await page.goto('/settings');
    await page.goto('/dashboard');
    
    // Verify still logged in
    await expect(page.locator('[data-testid="user-greeting"]')).toContainText('testuser');
    
    // 3. Simulate token expiration and refresh
    await page.evaluate(() => {
      // Set token to expired one
      localStorage.setItem('auth_token', 'expired_token');
      // Set token expiry to a past time
      localStorage.setItem('token_expiry', Date.now() - 10000);
    });
    
    // Make a request that would trigger a token refresh
    await page.goto('/projects');
    
    // Verify token was refreshed
    const refreshedToken = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(refreshedToken).toBe('refreshed_token');
    
    // 4. Test logout
    await userFlow.logout();
    
    // Verify token was removed
    const loggedOutToken = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(loggedOutToken).toBeNull();
    
    // 5. Test session timeout
    await userFlow.login('testuser', 'password');
    
    // Simulate session timeout
    await page.evaluate(() => {
      // Clear token
      localStorage.removeItem('auth_token');
    });
    
    // Try to access protected page
    await page.goto('/projects');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('Multi-device session management', async ({ browser }) => {
    // Create two contexts to simulate different devices
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
    });
    
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    const mobilePage = await mobileContext.newPage();
    const desktopPage = await desktopContext.newPage();
    
    // Setup mock APIs for both contexts
    for (const page of [mobilePage, desktopPage]) {
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'multi_device_token',
            token_type: 'bearer',
            user: {
              id: 'user1',
              username: 'testuser',
              email: 'test@example.com',
              role: 'USER'
            }
          })
        });
      });
      
      await page.route('**/api/v1/auth/logout', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });
    }
    
    // 1. Login on mobile device
    const mobileUserFlow = new UserFlowPage(mobilePage);
    await mobileUserFlow.login('testuser', 'password');
    
    // 2. Login on desktop
    const desktopUserFlow = new UserFlowPage(desktopPage);
    await desktopUserFlow.login('testuser', 'password');
    
    // Both devices should show logged in state
    await expect(mobilePage.locator('[data-testid="user-greeting"]')).toContainText('testuser');
    await expect(desktopPage.locator('[data-testid="user-greeting"]')).toContainText('testuser');
    
    // 3. Logout on mobile
    await mobileUserFlow.logout();
    
    // Mobile should be logged out, desktop still logged in
    await expect(mobilePage.locator('[data-testid="login-form"]')).toBeVisible();
    await expect(desktopPage.locator('[data-testid="user-greeting"]')).toContainText('testuser');
    
    // 4. Test "logout from all devices" functionality
    await mobileUserFlow.login('testuser', 'password');
    
    // Mock the logout all devices API
    await mobilePage.route('**/api/v1/auth/logout-all', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // Perform logout from all devices on mobile
    await mobilePage.click('[data-testid="user-menu"]');
    await mobilePage.click('[data-testid="logout-all-button"]');
    
    // Both devices should be logged out
    await expect(mobilePage.locator('[data-testid="login-form"]')).toBeVisible();
    
    // Simulate server-side session invalidation by having next request fail on desktop
    await desktopPage.route('**/api/v1/**', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Invalid or expired token' })
      });
    });
    
    // Navigate to trigger a request
    await desktopPage.goto('/projects');
    
    // Desktop should now be logged out as well
    await expect(desktopPage).toHaveURL(/.*login/);
    
    // Clean up contexts
    await mobileContext.close();
    await desktopContext.close();
  });
});
