import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Skill } from '../types';

export type ApiFetch = (
  path: string,
  options?: RequestInit
) => Promise<Response>;

export const useApi = () => {
  const [csrfToken, setCsrfTokenInternal] = useState<string | null>(null);

  const setCsrfToken = useCallback((token: string | null) => {
    setCsrfTokenInternal(token);
    apiService.setCsrfToken(token);
  }, []);

  const clearCsrfToken = useCallback(() => {
    setCsrfTokenInternal(null);
    apiService.clearCsrfToken();
  }, []);

  const apiFetch = useCallback(
    async (path: string, options?: RequestInit): Promise<Response> => {
      return apiService.request(path, options);
    },
    []
  );

  return {
    apiFetch,
    csrfToken,
    setCsrfToken,
    clearCsrfToken,
  };
};

interface HealthResponse {
  status: 'ok' | 'down' | 'checking';
  service?: string;
}

interface SkillsResponse {
  count: number;
  items: Skill[];
}

export const useApiInitialization = () => {
  const { apiFetch } = useApi();
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'down'>(
    'checking'
  );
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [healthRes, skillsRes] = await Promise.all([
          apiFetch('/api/health'),
          apiFetch('/api/skills'),
        ]);

        if (!healthRes.ok || !skillsRes.ok) {
          throw new Error('API unavailable');
        }

        const health = (await healthRes.json()) as HealthResponse;
        const skillsData = (await skillsRes.json()) as SkillsResponse;

        setApiStatus(health.status);
        setSkills(skillsData.items || []);
      } catch {
        setApiStatus('down');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [apiFetch]);

  return { apiStatus, skills, isLoading };
};
