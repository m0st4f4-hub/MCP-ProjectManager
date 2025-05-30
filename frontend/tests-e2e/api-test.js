// API Test using Playwright
const { test, expect } = require('@playwright/test');

test('Task API Test - Mock', async ({ page }) => {
  // Create a mock API response
  await page.route('**/api/tasks', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            project_id: 'project-123',
            task_number: 1,
            title: 'Sample Task 1',
            description: 'This is a sample task',
            status: 'TODO',
            agent_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_archived: false
          },
          {
            project_id: 'project-123',
            task_number: 2,
            title: 'Sample Task 2',
            description: 'Another sample task',
            status: 'IN_PROGRESS',
            agent_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_archived: false
          }
        ],
        total: 2,
        page: 1,
        page_size: 10,
        has_more: false,
        message: 'Retrieved 2 tasks'
      })
    });
  });

  // Navigate to the tasks page
  await page.goto('http://localhost:3000/tasks');
  
  // Wait for the tasks to be displayed
  await page.waitForSelector('.task-list', { timeout: 5000 });
  
  // Check if tasks are displayed
  const taskTitles = await page.$$eval('.task-item .title', items => items.map(item => item.textContent));
  expect(taskTitles).toContain('Sample Task 1');
  expect(taskTitles).toContain('Sample Task 2');
  
  // Check task status
  const taskStatuses = await page.$$eval('.task-item .status', items => items.map(item => item.textContent));
  expect(taskStatuses).toContain('TODO');
  expect(taskStatuses).toContain('IN_PROGRESS');
  
  // Test task creation - mock the POST request
  await page.route('**/api/tasks', route => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            project_id: 'project-123',
            task_number: 3,
            title: 'New Task',
            description: 'A new task created via API',
            status: 'TODO',
            agent_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_archived: false
          },
          message: 'Task created successfully'
        })
      });
    }
  });
  
  // Click the create task button
  await page.click('.create-task-button');
  
  // Fill in the task creation form
  await page.fill('input[name="title"]', 'New Task');
  await page.fill('textarea[name="description"]', 'A new task created via API');
  await page.selectOption('select[name="status"]', 'TODO');
  
  // Submit the form
  await page.click('.submit-task-button');
  
  // Wait for the new task to be displayed
  await page.waitForSelector('.task-item:nth-child(3)', { timeout: 5000 });
  
  // Verify the new task is displayed
  const newTaskTitle = await page.$eval('.task-item:nth-child(3) .title', item => item.textContent);
  expect(newTaskTitle).toBe('New Task');
});

test('Direct API Request Test', async ({ request }) => {
  // Test GET /api/v1/tasks
  const response = await request.get('http://localhost:8000/api/v1/tasks');
  expect(response.ok()).toBeTruthy();
  
  const data = await response.json();
  expect(data).toHaveProperty('data');
  expect(data).toHaveProperty('total');
  expect(data).toHaveProperty('page');
  expect(data).toHaveProperty('page_size');
  
  // Test creating a task
  const createResponse = await request.post('http://localhost:8000/api/v1/projects/project-123/tasks/', {
    data: {
      title: 'API Test Task',
      description: 'Task created from Playwright API test',
      status: 'TO_DO'
    }
  });
  
  expect(createResponse.ok()).toBeTruthy();
  const createData = await createResponse.json();
  expect(createData.data.title).toBe('API Test Task');
  
  // Test getting a specific task
  const taskNumber = createData.data.task_number;
  const getTaskResponse = await request.get(`http://localhost:8000/api/v1/projects/project-123/tasks/${taskNumber}`);
  
  expect(getTaskResponse.ok()).toBeTruthy();
  const taskData = await getTaskResponse.json();
  expect(taskData.data.title).toBe('API Test Task');
  
  // Test updating a task
  const updateResponse = await request.put(`http://localhost:8000/api/v1/projects/project-123/tasks/${taskNumber}`, {
    data: {
      title: 'Updated API Test Task',
      status: 'IN_PROGRESS'
    }
  });
  
  expect(updateResponse.ok()).toBeTruthy();
  const updateData = await updateResponse.json();
  expect(updateData.data.title).toBe('Updated API Test Task');
  expect(updateData.data.status).toBe('IN_PROGRESS');
  
  // Test deleting a task
  const deleteResponse = await request.delete(`http://localhost:8000/api/v1/projects/project-123/tasks/${taskNumber}`);
  expect(deleteResponse.ok()).toBeTruthy();
});
