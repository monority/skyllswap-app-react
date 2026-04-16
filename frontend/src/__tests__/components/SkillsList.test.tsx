import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SkillsList from '../../components/Skills/SkillsList';
import type { Skill } from '../../types';

const mockSkills: Skill[] = [
  { id: 1, title: 'JavaScript', level: 'Intermediaire', offers: 14, needs: 9 },
  { id: 2, title: 'React', level: 'Avance', offers: 12, needs: 18 },
  { id: 3, title: 'Python', level: 'Debutant', offers: 8, needs: 12 },
];

describe('SkillsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render skills list', () => {
    render(
      <SkillsList
        skills={mockSkills}
        query=""
        onQueryChange={vi.fn()}
        isLoading={false}
      />
    );
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <SkillsList
        skills={[]}
        query=""
        onQueryChange={vi.fn()}
        isLoading={true}
      />
    );
    expect(screen.getByText(/chargement des competences/i)).toBeInTheDocument();
  });

  it('should show empty state when no skills', () => {
    render(
      <SkillsList
        skills={[]}
        query=""
        onQueryChange={vi.fn()}
        isLoading={false}
      />
    );
    expect(screen.getByText(/aucune competence/i)).toBeInTheDocument();
  });

  it('should call onQueryChange when input changes', () => {
    const onQueryChange = vi.fn();
    render(
      <SkillsList
        skills={mockSkills}
        query=""
        onQueryChange={onQueryChange}
        isLoading={false}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Java' },
    });

    expect(onQueryChange).toHaveBeenCalledWith('Java');
  });

  it('should display skill levels', () => {
    render(
      <SkillsList
        skills={mockSkills}
        query=""
        onQueryChange={vi.fn()}
        isLoading={false}
      />
    );
    expect(screen.getByText(/niveau: intermediaire/i)).toBeInTheDocument();
    expect(screen.getByText(/niveau: avance/i)).toBeInTheDocument();
  });
});
