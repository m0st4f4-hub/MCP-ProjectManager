/**
 * Session Management Tests for Task Manager
 * 
 * This test suite focuses on verifying proper session handling, including token
 * storage, refresh, and logout functionality.
 */

import { test, expect } from '@playwright/test';

// Helper class for session management testing
class SessionPage {
  constructor(page) {
    this.page = page;
  }

  async login(username, password) {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="username-input"]', username);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for login to complete and dashboard to load
    await this.page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 5000 });
  }

  async logout() {
    await this.page.click('[data-testid="user-menu-button"]');
    await this.page.click('[data-testid="logout-button"]');
    
    // Wait for redirect to login page
    await this.page.waitForURL('**/login');
  }

  async getAuthToken() {
    return await this.page.evaluate(() => localStorage.getItem('auth_token'));
  }

  async getRefreshCookie() {
    const cookies = await this.page.context().cookies();
    const cookie = cookies.find((c) => c.name === 'refresh_token');
    return cookie ? cookie.value : null;
  }

  async getAuthTokenExpiryTime() {
    return await this.page.evaluate(() => localStorage.getItem('token_expiry'));
  }
  
  async mockTokenExpiration() {
    await this.page.evaluate(() => {
      // Set token expiry to a past time
      const pastTime = Date.now() - 10000; // 10 seconds ago
      localStorage.setItem('token_expiry', pastTime.toString());
    });
  }
  
  async triggerTokenRefresh() {
    // Navigate to a protected page that would trigger a token refresh
    await this.page.goto('/projects');
  }
  
  async checkIsLoggedIn() {
    const token = await this.getAuthToken();
    return token !== null && token !== '';
  }
}

test.describe('Session Management', () => {
  let sessionPage;

  test.beforeEach(async ({ page }) => {
    sessionPage = new SessionPage(page);
    
    // Mock the login API
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'set-cookie': 'refresh_token=test_cookie; HttpOnly; Secure; Path=/'
        },
        body: JSON.stringify({
          access_token: 'mock_token_123',
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
    
    // Mock the token refresh API
    await page.route('**/api/v1/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'refreshed_token_456',
          token_type: 'bearer'
        })
      });
    });
  });

  test('should store authentication token after login', async () => {
    await sessionPage.login('testuser', 'password');

    // Verify token is stored in localStorage
    const token = await sessionPage.getAuthToken();
    expect(token).toBe('mock_token_123');

    // Refresh cookie should be set
    const cookie = await sessionPage.getRefreshCookie();
    expect(cookie).not.toBeNull();

    // Verify user is redirected to dashboard
    await expect(sessionPage.page).toHaveURL(/.*dashboard/);
  });

  test('should clear authentication token on logout', async () => {
    await sessionPage.login('testuser', 'password');
    
    // Verify logged in
    expect(await sessionPage.checkIsLoggedIn()).toBe(true);
    
    // Logout
    await sessionPage.logout();
    
    // Verify token is removed
    const token = await sessionPage.getAuthToken();
    expect(token).toBeNull();

    const cookie = await sessionPage.getRefreshCookie();
    expect(cookie).toBeNull();
    
    // Verify redirected to login page
    await expect(sessionPage.page).toHaveURL(/.*login/);
  });

  test('should refresh token when it expires', async () => {
    await sessionPage.login('testuser', 'password');
    
    // Mock token expiration
    await sessionPage.mockTokenExpiration();
    
    // Trigger token refresh
    await sessionPage.triggerTokenRefresh();
    
    // Verify token was refreshed
    const newToken = await sessionPage.getAuthToken();
    expect(newToken).toBe('refreshed_token_456');

    // Cookie should still be present
    const cookie = await sessionPage.getRefreshCookie();
    expect(cookie).not.toBeNull();
    
    // Verify still on a protected page
    await expect(sessionPage.page).toHaveURL(/.*projects/);
  });

  test('should redirect to login when session is invalid', async () => {
    await sessionPage.login('testuser', 'password');
    
    // Simulate backend rejecting the token
    await sessionPage.page.route('**/api/v1/projects', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Invalid authentication credentials'
        })
      });
    });
    
    // Try to access a protected resource
    await sessionPage.page.goto('/projects');
    
    // Should be redirected to login
    await expect(sessionPage.page).toHaveURL(/.*login/);
    
    // Token should be cleared
    const token = await sessionPage.getAuthToken();
    expect(token).toBeNull();

    const cookie = await sessionPage.getRefreshCookie();
    expect(cookie).toBeNull();
  });

  test('should handle session timeout gracefully', async () => {
    await sessionPage.login('testuser', 'password');
    
    // Simulate removing the token as if the session timed out
    await sessionPage.page.evaluate(() => {
      localStorage.removeItem('auth_token');
    });
    
    // Try to access a protected page
    await sessionPage.page.goto('/projects');
    
    // Should be redirected to login
    await expect(sessionPage.page).toHaveURL(/.*login/);
    
    // Should show a friendly message
    await expect(sessionPage.page.locator('[data-testid="session-expired-message"]')).toBeVisible();
  });
  
  test('should maintain session across multiple tabs', async ({ browser }) => {
    // Create two contexts to simulate different tabs
    const context = await browser.newContext();
    
    const tab1 = await context.newPage();
    const tab2 = await context.newPage();
    
    const sessionPage1 = new SessionPage(tab1);
    const sessionPage2 = new SessionPage(tab2);
    
    // Set up mock responses for both tabs
    for (const page of [tab1, tab2]) {
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'shared_token_789',
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
    }
    
    // Login on tab 1
    await sessionPage1.login('testuser', 'password');
    
    // Verify logged in on tab 1
    expect(await sessionPage1.getAuthToken()).toBe('shared_token_789');
    
    // Navigate to dashboard on tab 2 (should automatically use the shared token)
    await tab2.goto('/dashboard');
    
    // Verify tab 2 is also logged in using the same token
    expect(await sessionPage2.getAuthToken()).toBe('shared_token_789');
    
    // Verify tab 2 shows the authenticated content
    await expect(tab2.locator('[data-testid="user-greeting"]')).toBeVisible();
    
    // Log out from tab 1
    await sessionPage1.logout();
    
    // Refresh tab 2
    await tab2.reload();
    
    // Verify tab 2 is also logged out
    await expect(tab2).toHaveURL(/.*login/);
    
    // Clean up context
    await context.close();
  });
});
