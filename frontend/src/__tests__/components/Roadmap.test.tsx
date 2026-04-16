import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Roadmap from '../../components/Layout/Roadmap';
import { ROADMAP_ITEMS } from '../../constants';

describe('Roadmap', () => {
  it('should render roadmap section', () => {
    render(<Roadmap />);
    expect(
      screen.getByRole('heading', { name: /roadmap guidee/i })
    ).toBeInTheDocument();
  });

  it('should display all roadmap items', () => {
    render(<Roadmap />);
    ROADMAP_ITEMS.forEach(item => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('should display status labels', () => {
    render(<Roadmap />);
    expect(screen.getAllByText('Fait')).toHaveLength(
      ROADMAP_ITEMS.filter(i => i.status === 'done').length
    );
  });
});
