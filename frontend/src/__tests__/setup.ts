import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Use globalThis for fetch (fetch is already declared globally in DOM types)
globalThis.fetch = vi.fn();

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

window.scrollTo = vi.fn();
