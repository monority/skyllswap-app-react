import { memo } from 'react';
import Input from '../UI/Input';
import type { Skill } from '../../types';

interface SkillCardProps {
  skill: Skill;
}

function SkillCard({ skill }: SkillCardProps) {
  return (
    <li className="skill-item">
      <div className="skill-item__icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2 3.5 7v10L12 22l8.5-5V7L12 2z" />
          <path d="m7 10 5 3 5-3" />
        </svg>
      </div>
      <div className="skill-item__content">
        <h3 className="skill-item__title">{skill.title}</h3>
        <span className="skill-item__level">{skill.level}</span>
      </div>
      <div className="skill-item__stats">
        <span className="badge badge--success">{skill.offers} offres</span>
        <span className="badge badge--warning">{skill.needs} besoins</span>
      </div>
    </li>
  );
}

interface SkillsListProps {
  skills: Skill[];
  query: string;
  onQueryChange: (query: string) => void;
  isLoading: boolean;
}

function SkillsList({ skills, query, onQueryChange, isLoading }: SkillsListProps) {
  const totalOffers = skills.reduce((sum, skill) => sum + skill.offers, 0);
  const totalNeeds = skills.reduce((sum, skill) => sum + skill.needs, 0);

  return (
    <div className="skills-container">
      <div className="skills-hero">
        <div className="skills-hero__icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2 4 6v5c0 5.25 3.45 10.16 8 11 4.55-.84 8-5.75 8-11V6l-8-4z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <div className="skills-hero__content">
          <p className="skills-hero__eyebrow">Compétences</p>
          <h3 className="skills-hero__title">Parcourez, filtrez et comparez les savoir-faire disponibles.</h3>
          <p className="skills-hero__sub">Les badges vous aident à repérer rapidement les offres et les besoins.</p>
        </div>
        <div className="skills-hero__stats">
          <span className="skills-hero__pill skills-hero__pill--offers">{totalOffers} offres</span>
          <span className="skills-hero__pill skills-hero__pill--needs">{totalNeeds} besoins</span>
        </div>
      </div>

      <div className="skills-search">
        <svg className="skills-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <Input
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Rechercher une compétence..."
          aria-label="Filtrer les compétences"
          className="skills-search__input"
        />
      </div>

      {isLoading ? (
        <div className="skills-empty">
          <div className="skills-empty__spinner" />
          <p>Chargement...</p>
        </div>
      ) : skills.length === 0 ? (
        <div className="skills-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <p>Aucune compétence trouvée</p>
        </div>
      ) : (
        <ul className="skills-list">
          {skills.map(skill => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(SkillsList);
