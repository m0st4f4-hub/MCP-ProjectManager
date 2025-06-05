import { TaskStatus } from '../src/types/task'

Page.route('**/api/v1/projects/*/tasks/*', (route) => {
        if (route.request().method() === 'PATCH') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                project_id: 'proj1',
                task_number: 1,
                title: 'Initial Test Task',
                description: 'This is a test task',
                status: 'IN_PROGRESS',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_archived: false,
              }
            })
          })
        }
      })

      // Simulate drag and drop from TO_DO to IN_PROGRESS column
      const taskCard = taskPage.page.locator('[data-testid="task-proj1-1"]')
      const inProgressColumn = taskPage.page.locator('[data-testid="kanban-column-IN_PROGRESS"]')
      
      await taskCard.dragTo(inProgressColumn)
      await taskPage.expectTaskStatus('proj1-1', 'IN_PROGRESS')
    })

    test('should update task status via status dropdown', async () => {
      await taskPage.gotoTasks()
      
      // Mock status update
      await taskPage.page.route('**/api/v1/projects/*/tasks/*', (route) => {
        if (route.request().method() === 'PATCH') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                project_id: 'proj1',
                task_number: 1,
                title: 'Initial Test Task',
                description: 'This is a test task',
                status: 'COMPLETED',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_archived: false,
              }
            })
          })
        }
      })

      await taskPage.changeTaskStatus('proj1-1', 'COMPLETED')
      await taskPage.expectTaskStatus('proj1-1', 'COMPLETED')
    })
  })

  test.describe('Search and Filtering', () => {
    test('should search tasks by title', async () => {
      // Setup multiple tasks for search testing
      await taskPage.page.route('**/api/v1/tasks*', (route) => {
        const url = route.request().url()
        const searchParams = new URL(url).searchParams
        const search = searchParams.get('search')
        
        let tasks = [
          {
            project_id: 'proj1',
            task_number: 1,
            title: 'Frontend Development',
            description: 'Build the frontend',
            status: TaskStatus.TO_DO,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_archived: false,
          },
          {
            project_id: 'proj1',
            task_number: 2,
            title: 'Backend API',
            description: 'Create REST API',
            status: 'IN_PROGRESS',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_archived: false,
          }
        ]
        
        if (search) {
          tasks = tasks.filter(task => 
            task.title.toLowerCase().includes(search.toLowerCase())
          )
        }
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: tasks,
            total: tasks.length,
            page: 1,
            pageSize: 20,
          })
        })
      })

      await taskPage.gotoTasks()
      await taskPage.expectTaskCount(2)
      
      await taskPage.searchTasks('Frontend')
      await taskPage.expectTaskCount(1)
      await taskPage.expectTaskVisible('Frontend Development')
      await taskPage.expectTaskNotVisible('Backend API')
    })

    test('should filter tasks by status', async () => {
      await taskPage.page.route('**/api/v1/tasks*', (route) => {
        const url = route.request().url()
        const searchParams = new URL(url).searchParams
        const status = searchParams.get('status')
        
        let tasks = [
          {
            project_id: 'proj1',
            task_number: 1,
            title: 'Todo Task',
            status: TaskStatus.TO_DO,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_archived: false,
          },
          {
            project_id: 'proj1',
            task_number: 2,
            title: 'In Progress Task',
            status: 'IN_PROGRESS',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_archived: false,
          }
        ]
        
        if (status && status !== 'all') {
          tasks = tasks.filter(task => task.status === status)
        }
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: tasks,
            total: tasks.length,
            page: 1,
            pageSize: 20,
          })
        })
      })

      await taskPage.gotoTasks()
      await taskPage.expectTaskCount(2)
      
      await taskPage.filterByStatus(TaskStatus.TO_DO)
      await taskPage.expectTaskCount(1)
      await taskPage.expectTaskVisible('Todo Task')
    })
  })

  test.describe('View Switching', () => {
    test('should switch between list and kanban views', async () => {
      await taskPage.gotoTasks()
      
      // Should start in list view
      await expect(taskPage.page.locator('[data-testid="list-view"]')).toBeVisible()
      
      // Switch to kanban view
      await taskPage.switchToKanbanView()
      await expect(taskPage.page.locator('[data-testid="kanban-view"]')).toBeVisible()
      await expect(taskPage.page.locator('[data-testid="list-view"]')).not.toBeVisible()
      
      // Switch back to list view
      await taskPage.switchToListView()
      await expect(taskPage.page.locator('[data-testid="list-view"]')).toBeVisible()
      await expect(taskPage.page.locator('[data-testid="kanban-view"]')).not.toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('should display error when API fails', async () => {
      await taskPage.page.route('**/api/v1/tasks', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              message: 'Internal server error',
              code: 'SERVER_ERROR'
            }
          })
        })
      })

      await taskPage.gotoTasks()
      
      await expect(taskPage.page.locator('[data-testid="task-error"]')).toBeVisible()
      await expect(taskPage.page.locator('text=Internal server error')).toBeVisible()
    })

    test('should allow retry after error', async () => {
      let callCount = 0
      
      await taskPage.page.route('**/api/v1/tasks', (route) => {
        callCount++
        
        if (callCount === 1) {
          // First call fails
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
              error: {
                message: 'Server temporarily unavailable',
                code: 'SERVER_ERROR'
              }
            })
          })
        } else {
          // Retry succeeds
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: [{
                project_id: 'proj1',
                task_number: 1,
                title: 'Recovered Task',
                status: TaskStatus.TO_DO,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_archived: false,
              }],
              total: 1,
              page: 1,
              pageSize: 20,
            })
          })
        }
      })

      await taskPage.gotoTasks()
      
      // Should show error initially
      await expect(taskPage.page.locator('[data-testid="task-error"]')).toBeVisible()
      
      // Click retry
      await taskPage.page.click('[data-testid="retry-button"]')
      
      // Should show tasks after retry
      await taskPage.expectTaskVisible('Recovered Task')
      await expect(taskPage.page.locator('[data-testid="task-error"]')).not.toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip()
      }
      
      const taskPage = new TaskManagementPage(page)
      await taskPage.gotoTasks()
      
      // Mobile-specific interactions
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
      
      // Test mobile-friendly task creation
      await taskPage.createTask('Mobile Task', 'Created on mobile')
      await taskPage.expectTaskVisible('Mobile Task')
    })
  })

  test.describe('Performance', () => {
    test('should load tasks quickly', async () => {
      // Mock large dataset
      const largeTasks = Array.from({ length: 100 }, (_, i) => ({
        project_id: 'proj1',
        task_number: i + 1,
        title: `Task ${i + 1}`,
        description: `Description for task ${i + 1}`,
        status: TaskStatus.TO_DO,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_archived: false,
      }))
      
      await taskPage.page.route('**/api/v1/tasks', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: largeTasks,
            total: largeTasks.length,
            page: 1,
            pageSize: 100,
          })
        })
      })

      const startTime = Date.now()
      await taskPage.gotoTasks()
      
      // Wait for all tasks to be rendered
      await taskPage.expectTaskCount(100)
      
      const loadTime = Date.now() - startTime
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })
  })
})
