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