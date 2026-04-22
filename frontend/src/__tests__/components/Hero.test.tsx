import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Hero from '../../components/Layout/Hero';

describe('Hero', () => {
  it('should render nothing (component is minimal)', () => {
    const { container } = render(<Hero apiStatus="ok" />);
    expect(container.firstChild).toBeNull();
  });
});
