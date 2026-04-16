import { describe, it, expect } from 'vitest';
import { useDebounce } from '../../hooks/useDebounce';

describe('useDebounce', () => {
  it('should be defined', () => {
    expect(useDebounce).toBeDefined();
  });

  it('should export useDebouncedCallback', async () => {
    const { useDebouncedCallback } = await import('../../hooks/useDebounce');
    expect(useDebouncedCallback).toBeDefined();
  });
});
