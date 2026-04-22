import { memo } from 'react';
import Input from '../UI/Input';
import type { Skill } from '../../types';

interface SkillCardProps {
  skill: Skill;
}

function SkillCard({ skill }: SkillCardProps) {
  return (
    <li className="skill-item">
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

function SkillsList({
  skills,
  query,
  onQueryChange,
  isLoading,
}: SkillsListProps) {
  return (
    <div className="skills-container">
      <div className="skills-search">
        <svg className="skills-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <Input
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Rechercher une compétence..."
          aria-label="Filtrer les competences"
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
