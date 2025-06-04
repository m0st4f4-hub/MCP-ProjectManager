/**
 * TASK MANAGER SYSTEM - FRONTEND TEST UTILITIES
 * NASA/SpaceX Grade Test Infrastructure for React Components
 *
 * Test Classification: MISSION-CRITICAL
 * Test Control: TMS-ATP-002-UTILS
 * Version: 2.0.0
 * Compliance: NASA NPR 7150.2, SpaceX Software Standards
 */

import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import our theme and providers
// import { theme } from '@/theme'

// Mock query client with test-friendly defaults
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Comprehensive provider wrapper for testing
const AllTheProviders = ({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
}) => {
  const testQueryClient = queryClient || createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      <ChakraProvider>{children}</ChakraProvider>
    </QueryClientProvider>
  );
};

// Convenience wrapper for component tests
export const TestWrapper = ({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
}) => <AllTheProviders queryClient={queryClient}>{children}</AllTheProviders>;

// Enhanced render function with provider options
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & {
    queryClient?: QueryClient;
  },
) => {
  const { queryClient, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={queryClient}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Re-export everything from testing library
export * from "@testing-library/react";
export { customRender as render };

// Export test query client factory
export { createTestQueryClient };

// Mock Next.js router factory with comprehensive defaults
export const createMockRouter = (overrides: Record<string, any> = {}) => ({
  basePath: "",
  pathname: "/",
  route: "/",
  asPath: "/",
  query: {},
  push: vi.fn().mockResolvedValue(true),
  replace: vi.fn().mockResolvedValue(true),
  reload: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn().mockResolvedValue(undefined),
  beforePopState: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  locale: "en",
  locales: ["en"],
  defaultLocale: "en",
  ...overrides,
});

// Mock fetch responses for API testing
export const mockFetchResponse = (data: any, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  } as Response);
};

// Mock API error responses
export const mockApiError = (message: string, status = 400) => {
  const errorResponse = {
    error: { message, code: status },
  };
  mockFetchResponse(errorResponse, status);
};

// Utility for testing async operations
export const waitForAsyncOperation = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Test data selectors aligned with backend data models
export const dataTestIds = {
  // Task-related selectors
  task: {
    card: "task-card",
    title: "task-title",
    description: "task-description",
    status: "task-status",
    assignee: "task-assignee",
    createButton: "task-create-button",
    editButton: "task-edit-button",
    deleteButton: "task-delete-button",
    form: "task-form",
    list: "task-list",
    filterStatus: "task-filter-status",
    filterAssignee: "task-filter-assignee",
  },
  // Project-related selectors
  project: {
    card: "project-card",
    name: "project-name",
    description: "project-description",
    progress: "project-progress",
    taskCount: "project-task-count",
    createButton: "project-create-button",
    editButton: "project-edit-button",
    deleteButton: "project-delete-button",
    form: "project-form",
    list: "project-list",
  },
  // User-related selectors
  user: {
    avatar: "user-avatar",
    name: "user-name",
    email: "user-email",
    role: "user-role",
    loginForm: "login-form",
    profileMenu: "profile-menu",
  },
  // Navigation and layout
  nav: {
    sidebar: "sidebar",
    breadcrumb: "breadcrumb",
    menu: "main-menu",
    logo: "app-logo",
  },
  // Common UI elements
  common: {
    modal: "modal",
    confirmDialog: "confirm-dialog",
    loadingSpinner: "loading-spinner",
    errorMessage: "error-message",
    successMessage: "success-message",
    searchInput: "search-input",
    pagination: "pagination",
    sortButton: "sort-button",
  },
} as const;

// Custom matchers for enhanced testing
export const customMatchers = {
  toHaveDataTestId: (received: HTMLElement, testId: string) => {
    const element = received.querySelector(`[data-testid="${testId}"]`);
    return {
      pass: !!element,
      message: () =>
        `Expected element ${element ? "not " : ""}to have data-testid="${testId}"`,
    };
  },
};

// Performance testing utilities
export const measureRenderTime = async (
  renderFn: () => Promise<void> | void,
) => {
  const start = performance.now();
  await renderFn();
  const end = performance.now();
  return end - start;
};

// Accessibility testing helpers
export const checkA11y = async (container: HTMLElement) => {
  // Import axe-core dynamically to avoid bundling in production
  const { axe } = await import("axe-core");
  return axe.run(container);
};
