// Task ID: 212
// Agent Role: FrontendAgent
// Request ID: (Inherited from Overmind)
// Project: task-manager
// Timestamp: YYYY-MM-DDTHH:MM:SSZ

// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }), // Provide a mock implementation
}));

// Mock window.matchMedia for Chakra UI
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 