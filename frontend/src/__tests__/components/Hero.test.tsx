import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from '../../components/Layout/Hero';

describe('Hero', () => {
  it('should render hero section', () => {
    render(<Hero apiStatus="ok" />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should display API status', () => {
    render(<Hero apiStatus="ok" />);
    expect(screen.getByText(/api: ok/i)).toBeInTheDocument();
  });

  it('should show down status when API is down', () => {
    render(<Hero apiStatus="down" />);
    expect(screen.getByText(/api: down/i)).toBeInTheDocument();
  });

  it('should display title and subtitle', () => {
    render(<Hero apiStatus="ok" />);
    expect(screen.getByText(/echange tes competences/i)).toBeInTheDocument();
  });
});
