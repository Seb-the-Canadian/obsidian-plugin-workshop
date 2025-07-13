/**
 * Jest setup file for Obsidian Plugin Workshop tests
 */

// Mock Obsidian API for testing (will be handled in moduleNameMapper)

// Global test timeout
jest.setTimeout(30000);

// Console warnings for debugging
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (args[0]?.includes && args[0].includes('deprecated')) {
    return;
  }
  originalWarn(...args);
};

// Mock fetch for API testing
global.fetch = jest.fn();

// Setup test environment
beforeEach(() => {
  jest.clearAllMocks();
});