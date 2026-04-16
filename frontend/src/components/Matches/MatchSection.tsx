import { memo } from 'react';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Button from '../UI/Button';
import { AVAILABILITY_OPTIONS } from '../../constants';
import type { Match, User, MatchFilters } from '../../types';

interface MatchSectionProps {
  currentUser: User | null;
  matchPreview: Match | null;
  topMatches: Match[];
  matchFilters: MatchFilters;
  onFiltersChange: (filters: MatchFilters) => void;
  onStartConversation: (matchId: number) => void;
  hintMessage: string;
}

function MatchSection({
  currentUser,
  matchPreview,
  topMatches,
  matchFilters,
  onFiltersChange,
  onStartConversation,
  hintMessage,
}: MatchSectionProps) {
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...matchFilters, city: e.target.value });
  };

  const handleAvailabilityChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onFiltersChange({ ...matchFilters, availability: e.target.value });
  };

  return (
    <>
      {currentUser && (
        <div className="match-filters">
          <Input
            value={matchFilters.city}
            onChange={handleCityChange}
            placeholder="Filtrer par ville..."
            aria-label="Ville"
          />
          <Select
            value={matchFilters.availability}
            onChange={handleAvailabilityChange}
            aria-label="Disponibilite"
            options={[
              { value: '', label: 'Toutes disponibilites' },
              ...AVAILABILITY_OPTIONS,
            ]}
          />
        </div>
      )}

      {!currentUser && matchPreview && (
        <div className="match-card">
          <p className="name">{matchPreview.pseudo}</p>
          <p>Donne: {matchPreview.gives}</p>
          <p>Recherche: {matchPreview.wants}</p>
          <p className="score">Compatibilite: {matchPreview.compatibility}%</p>
        </div>
      )}

      {currentUser && topMatches.length === 0 && (
        <p className="hint">
          Aucun profil correspondant. Elargis tes filtres ou complete ton
          profil.
        </p>
      )}

      {currentUser && (
        <div className="top-matches">
          {topMatches.map(match => (
            <div key={match.matchId} className="match-item">
              <div className="match-info">
                <p className="name">{match.pseudo}</p>
                <p>
                  {match.city}
                  {match.availability ? ` · ${match.availability}` : ''}
                </p>
                <p>{match.gives}</p>
              </div>
              <span className="score">{match.compatibility}%</span>
              <Button onClick={() => onStartConversation(match.matchId)}>
                Contacter
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="hint">{hintMessage || 'Calcul du matching en cours...'}</p>
    </>
  );
}

export default memo(MatchSection);
