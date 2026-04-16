import { useCallback } from 'react';
import { sanitize, sanitizeText, sanitizeHtml } from '../utils/sanitize';

export const useSanitize = () => {
  const sanitizeInput = useCallback((input: string): string => {
    return sanitizeText(input.trim());
  }, []);

  const sanitizeRichInput = useCallback((input: string): string => {
    return sanitize(input);
  }, []);

  const sanitizeHtmlInput = useCallback((input: string): string => {
    return sanitizeHtml(input);
  }, []);

  return {
    sanitizeInput,
    sanitizeRichInput,
    sanitizeHtmlInput,
  };
};
