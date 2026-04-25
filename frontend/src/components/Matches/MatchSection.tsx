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

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...matchFilters, availability: e.target.value });
  };

  const averageCompatibility = topMatches.length > 0
    ? Math.round(topMatches.reduce((sum, match) => sum + match.compatibility, 0) / topMatches.length)
    : 0;

  return (
    <div className="matches-container">
      <div className="matches-hero">
        <div className="matches-hero__icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="m8 12 3 3 5-5" />
          </svg>
        </div>
        <div className="matches-hero__body">
          <p className="matches-hero__eyebrow">Matching</p>
          <h3 className="matches-hero__title">Des profils compatibles.</h3>
          <p className="matches-hero__text">Affinez par ville et disponibilité, puis ouvrez une conversation depuis les profils les plus proches.</p>
        </div>
        <div className="matches-hero__stats">
          <span className="matches-hero__pill matches-hero__pill--count">{topMatches.length} résultats</span>
          <span className="matches-hero__pill matches-hero__pill--score">{averageCompatibility}% moyen</span>
        </div>
      </div>

      {currentUser && (
        <div className="matches-filters">
          <div className="matches-filter">
            <svg className="matches-filter__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <Input
              value={matchFilters.city}
              onChange={handleCityChange}
              placeholder="Ville..."
              aria-label="Ville"
              className="matches-filter__input"
            />
          </div>
          <Select
            value={matchFilters.availability}
            onChange={handleAvailabilityChange}
            aria-label="Disponibilité"
            options={[
              { value: '', label: 'Toutes dispo.' },
              ...AVAILABILITY_OPTIONS,
            ]}
          />
        </div>
      )}
      {!currentUser && matchPreview && (
        <div className="match-preview">
          <div className="match-preview__header">
            <span className="match-preview__name">{matchPreview.pseudo}</span>
            <span className="badge badge--primary">{matchPreview.compatibility}%</span>
          </div>
          <div className="match-preview__body">
            <p><strong>Donne:</strong> {matchPreview.gives}</p>
            <p><strong>Recherche:</strong> {matchPreview.wants}</p>
          </div>
        </div>
      )}

      {currentUser && topMatches.length === 0 && (
        <div className="matches-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m8 12 3 3 5-5"></path>
          </svg>
          <p>Aucun profil correspondant</p>
          <span>Élargis tes filtres ou complète ton profil</span>
        </div>
      )}

      {currentUser && (
        <div className="matches-list">
          {topMatches.map(match => (
            <div key={match.matchId} className="match-row">
              <div className="match-row__avatar-wrap">
                <div className="match-row__avatar">
                  {match.pseudo.charAt(0).toUpperCase()}
                </div>
                <span className="match-row__avatar-glow" aria-hidden="true" />
              </div>
              <div className="match-row__info">
                <div className="match-row__header">
                  <span className="match-row__name">{match.pseudo}</span>
                  <span className="match-score">{match.compatibility}%</span>
                </div>
                {(match.city || match.availability) && (
                  <span className="match-row__meta">
                    {match.city}{match.availability ? ` · ${match.availability}` : ''}
                  </span>
                )}
                <div className="match-row__chips">
                  {match.city && <span className="match-row__chip">{match.city}</span>}
                  {match.availability && <span className="match-row__chip match-row__chip--soft">{match.availability}</span>}
                </div>
                <div className="match-row__skills">
                  <span className="match-row__give">
                    <span className="match-row__skill-prefix">↑</span>
                    <span className="match-row__skill-text">{match.gives}</span>
                  </span>
                  <span className="match-row__want">
                    <span className="match-row__skill-prefix">↓</span>
                    <span className="match-row__skill-text">{match.wants}</span>
                  </span>
                </div>
              </div>
              <div className="match-row__actions">
                <span className="match-row__action-label">Démarrer un échange</span>
                <Button size="sm" onClick={() => onStartConversation(match.matchId)}>
                  Contacter
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="matches-hint">{hintMessage || 'Calcul du matching en cours...'}</p>
    </div>
  );
}

export default memo(MatchSection);
