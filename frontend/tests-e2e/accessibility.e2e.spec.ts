/**
 * Accessibility Tests for Task Manager
 * 
 * This test suite checks for compliance with WCAG 2.1 accessibility guidelines
 * by testing keyboard navigation, screen reader compatibility, and other accessibility features.
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

// Page object for common accessibility testing operations
class AccessibilityPage {
  constructor(page) {
    this.page = page;
  }

  async goto(path) {
    await this.page.goto(path);
    await injectAxe(this.page);
  }

  async checkAccessibility(options = {}) {
    // Run accessibility checks using axe-core
    await checkA11y(this.page, null, {
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
        }
      },
      ...options
    });
  }

  async getAccessibilityViolations() {
    return await getViolations(this.page);
  }

  async checkFocusNavigation(selectors) {
    // Test that tab navigation works through all interactive elements
    await this.page.keyboard.press('Tab');
    for (const selector of selectors) {
      await expect(this.page.locator(selector)).toBeFocused();
      await this.page.keyboard.press('Tab');
    }
  }

  async testKeyboardInteraction(selector, key, expectedResult) {
    // Test that elements can be interacted with using keyboard
    await this.page.locator(selector).focus();
    await this.page.keyboard.press(key);
    await expectedResult();
  }
}

test.describe('Accessibility Tests', () => {
  let a11yPage;

  test.beforeEach(async ({ page }) => {
    a11yPage = new AccessibilityPage(page);
    
    // Set up authentication
    // Assuming we have a function to mock authentication or perform login
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user', JSON.stringify({
        id: 'user1',
        username: 'testuser',
        role: 'USER'
      }));
    });
  });

  test('Login page meets accessibility standards', async () => {
    await a11yPage.goto('/login');
    await a11yPage.checkAccessibility();
    
    // Test focus order on login form
    await a11yPage.checkFocusNavigation([
      '[data-testid="username-input"]',
      '[data-testid="password-input"]',
      '[data-testid="login-button"]',
      '[data-testid="forgot-password-link"]'
    ]);

    // Test keyboard interaction with login button
    await a11yPage.testKeyboardInteraction(
      '[data-testid="login-button"]', 
      'Enter',
      async () => {
        // Expect login form submission (mock the API call)
        await expect(a11yPage.page.locator('[data-testid="login-form-submitted"]')).toBeVisible();
      }
    );
  });

  test('Dashboard meets accessibility standards', async () => {
    await a11yPage.goto('/dashboard');
    await a11yPage.checkAccessibility();
    
    // Test dashboard navigation via keyboard
    await a11yPage.checkFocusNavigation([
      '[data-testid="projects-link"]',
      '[data-testid="tasks-link"]',
      '[data-testid="settings-link"]'
    ]);
  });

  test('Projects page meets accessibility standards', async () => {
    await a11yPage.goto('/projects');
    await a11yPage.checkAccessibility();
    
    // Verify color contrast in project cards
    const violations = await a11yPage.getAccessibilityViolations();
    const contrastViolations = violations.filter(v => v.id === 'color-contrast');
    expect(contrastViolations.length).toBe(0);
    
    // Test project card keyboard interaction
    await a11yPage.testKeyboardInteraction(
      '[data-testid="create-project-button"]',
      'Enter',
      async () => {
        await expect(a11yPage.page.locator('[data-testid="create-project-modal"]')).toBeVisible();
      }
    );
  });

  test('Tasks page meets accessibility standards', async () => {
    await a11yPage.goto('/tasks');
    await a11yPage.checkAccessibility();
    
    // Test task list keyboard navigation
    await a11yPage.checkFocusNavigation([
      '[data-testid="create-task-button"]',
      '[data-testid="filter-tasks-dropdown"]',
      '[data-testid="search-tasks-input"]',
      '[data-testid="task-item-0"]'
    ]);
    
    // Test keyboard interaction with task item
    await a11yPage.testKeyboardInteraction(
      '[data-testid="task-item-0"]',
      'Enter',
      async () => {
        await expect(a11yPage.page.locator('[data-testid="task-details-panel"]')).toBeVisible();
      }
    );
  });

  test('Task form has proper labels and ARIA attributes', async () => {
    await a11yPage.goto('/tasks/create');
    await a11yPage.checkAccessibility();
    
    // Check that form controls have proper labels
    await expect(a11yPage.page.locator('label[for="task-title"]')).toBeVisible();
    await expect(a11yPage.page.locator('label[for="task-description"]')).toBeVisible();
    await expect(a11yPage.page.locator('label[for="task-status"]')).toBeVisible();
    
    // Verify required fields have appropriate aria attributes
    await expect(a11yPage.page.locator('#task-title')).toHaveAttribute('aria-required', 'true');
    
    // Check that error messages are properly associated with inputs
    await a11yPage.page.locator('#task-title').fill('');
    await a11yPage.page.locator('[data-testid="submit-task-button"]').click();
    
    await expect(a11yPage.page.locator('#task-title-error')).toBeVisible();
    await expect(a11yPage.page.locator('#task-title')).toHaveAttribute('aria-errormessage', 'task-title-error');
    await expect(a11yPage.page.locator('#task-title')).toHaveAttribute('aria-invalid', 'true');
  });

  test('Kanban board is keyboard navigable', async () => {
    await a11yPage.goto('/tasks/board');
    await a11yPage.checkAccessibility({
      // Some exclusions might be necessary for complex drag-and-drop interfaces
      exclude: ['[data-testid="drag-drop-context"]']
    });
    
    // Test keyboard navigation between columns
    await a11yPage.checkFocusNavigation([
      '[data-testid="column-TO_DO"]',
      '[data-testid="column-IN_PROGRESS"]',
      '[data-testid="column-COMPLETED"]'
    ]);
    
    // Test keyboard interaction with task cards
    await a11yPage.testKeyboardInteraction(
      '[data-testid="task-card-1"]',
      'Enter',
      async () => {
        await expect(a11yPage.page.locator('[data-testid="task-details-modal"]')).toBeVisible();
      }
    );
    
    // Test keyboard shortcuts for moving tasks between columns
    await a11yPage.page.locator('[data-testid="task-card-1"]').focus();
    await a11yPage.page.keyboard.press('Alt+ArrowRight');
    
    // Verify task moved to the next column
    await expect(a11yPage.page.locator('[data-testid="column-IN_PROGRESS"] [data-testid="task-card-1"]')).toBeVisible();
  });

  test('Screen reader announces dynamic content changes', async () => {
    await a11yPage.goto('/tasks');
    
    // Verify live regions are properly set up
    await expect(a11yPage.page.locator('[data-testid="notification-area"]')).toHaveAttribute('aria-live', 'polite');
    
    // Trigger a notification
    await a11yPage.page.locator('[data-testid="create-task-button"]').click();
    await a11yPage.page.locator('#task-title').fill('Screen Reader Test Task');
    await a11yPage.page.locator('[data-testid="submit-task-button"]').click();
    
    // Verify notification appears in live region
    await expect(a11yPage.page.locator('[data-testid="notification-area"]')).toContainText('Task created successfully');
  });

  test('High contrast mode is supported', async () => {
    // Enable high contrast mode
    await a11yPage.page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    
    await a11yPage.goto('/dashboard');
    await a11yPage.checkAccessibility();
    
    // Verify elements are visible in high contrast mode
    await expect(a11yPage.page.locator('[data-testid="projects-link"]')).toBeVisible();
    await expect(a11yPage.page.locator('[data-testid="tasks-link"]')).toBeVisible();
    
    // Check for appropriate focus indicators in high contrast mode
    await a11yPage.page.locator('[data-testid="projects-link"]').focus();
    const focusStyles = await a11yPage.page.locator('[data-testid="projects-link"]').evaluate((el) => {
      return window.getComputedStyle(el).outlineStyle;
    });
    
    expect(focusStyles).not.toBe('none');
  });
});
