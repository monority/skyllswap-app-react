import { useState, useCallback } from 'react';
import type { MatchFilters } from '../types';

const DEFAULT_FILTERS: MatchFilters = {
  city: '',
  availability: '',
};

export function useMatchFilters(initialFilters?: Partial<MatchFilters>) {
  const [filters, setFilters] = useState<MatchFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const updateFilters = useCallback((newFilters: Partial<MatchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = filters.city !== '' || filters.availability !== '';

  return {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
  };
}
