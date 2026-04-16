import { describe, it, expect } from 'vitest';
import {
  parseCommaSeparated,
  escapeHtml,
  truncateText,
  validateEmail,
  sanitizeInput,
} from '../utils';

describe('parseCommaSeparated', () => {
  it('should parse comma separated values', () => {
    expect(parseCommaSeparated('React, Node.js, Python')).toEqual([
      'React',
      'Node.js',
      'Python',
    ]);
  });

  it('should trim whitespace', () => {
    expect(parseCommaSeparated('React , Node.js , Python')).toEqual([
      'React',
      'Node.js',
      'Python',
    ]);
  });

  it('should filter empty values', () => {
    expect(parseCommaSeparated('React, , Python')).toEqual(['React', 'Python']);
  });

  it('should return empty array for empty string', () => {
    expect(parseCommaSeparated('')).toEqual([]);
  });
});

describe('escapeHtml', () => {
  it('should escape HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('should escape ampersand', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('truncateText', () => {
  it('should truncate long text', () => {
    expect(truncateText('This is a very long text', 10)).toBe('This is a ...');
  });

  it('should not truncate short text', () => {
    expect(truncateText('Short', 10)).toBe('Short');
  });

  it('should handle null input', () => {
    expect(truncateText(null, 10)).toBe('');
  });

  it('should handle undefined input', () => {
    expect(truncateText(undefined, 10)).toBe('');
  });

  it('should truncate text with default maxLength', () => {
    const longText = 'a'.repeat(60);
    const result = truncateText(longText);
    expect(result.length).toBeGreaterThan(0);
    expect(result.endsWith('...')).toBe(true);
  });
});

describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
  });
});

describe('sanitizeInput', () => {
  it('should remove dangerous characters', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
      'scriptalert("xss")/script'
    );
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('should limit to 1000 characters', () => {
    const longText = 'a'.repeat(1500);
    expect(sanitizeInput(longText).length).toBe(1000);
  });
});
