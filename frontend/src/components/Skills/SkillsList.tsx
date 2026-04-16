import { memo } from 'react';
import Input from '../UI/Input';
import type { Skill } from '../../types';

interface SkillCardProps {
  skill: Skill;
}

function SkillCard({ skill }: SkillCardProps) {
  return (
    <li>
      <div>
        <h3>{skill.title}</h3>
        <p>Niveau: {skill.level}</p>
      </div>
      <div className="stats">
        <span>{skill.offers} offres</span>
        <span>{skill.needs} besoins</span>
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
    <div>
      <Input
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        placeholder="Ex: React, cuisine, anglais..."
        aria-label="Filtrer les competences"
      />

      {isLoading ? (
        <p>Chargement des competences...</p>
      ) : skills.length === 0 ? (
        <p>Aucune competence ne correspond a ta recherche.</p>
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
