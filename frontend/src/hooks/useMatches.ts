import { useState, useEffect, useCallback } from 'react';
import type { Match, User, MatchFilters } from '../types';
import type { ApiFetch } from './useApi';

interface MatchesPreviewResponse {
  user: string;
  city: string;
  bestMatch: Match | null;
}

interface MatchesMeResponse {
  user: string;
  city: string;
  bestMatch: Match;
  topMatches: Match[];
  comparedProfiles: number;
  message?: string;
}

export const useMatches = (
  currentUser: User | null,
  authResolved: boolean,
  apiFetch: ApiFetch
) => {
  const [matchPreview, setMatchPreview] = useState<Match | null>(null);
  const [matchHintMessage, setMatchHintMessage] = useState('');
  const [matchFilters, setMatchFilters] = useState<MatchFilters>({
    city: '',
    availability: '',
  });
  const [topMatches, setTopMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (!authResolved) return;

    const fetchRealMatch = async () => {
      if (!currentUser) {
        try {
          const previewResponse = await apiFetch('/api/matches/preview');
          if (previewResponse.ok) {
            const previewData =
              (await previewResponse.json()) as MatchesPreviewResponse;
            setMatchPreview(previewData.bestMatch || null);
          }
        } catch {
          // no-op
        }
        setTopMatches([]);
        setMatchHintMessage(
          'Connecte-toi pour activer le matching reel depuis les profils en base.'
        );
        return;
      }

      try {
        const params = new URLSearchParams();
        if (matchFilters.city) params.set('city', matchFilters.city);
        if (matchFilters.availability)
          params.set('availability', matchFilters.availability);
        const response = await apiFetch(`/api/matches/me?${params.toString()}`);

        const data = (await response.json()) as MatchesMeResponse;
        if (!response.ok) {
          setMatchHintMessage(
            data.message || 'Matching reel indisponible pour le moment.'
          );
          setTopMatches([]);
          return;
        }

        setTopMatches(data.topMatches || []);
        if (data.bestMatch) {
          setMatchPreview(data.bestMatch);
          setMatchHintMessage(
            `Matching reel actif: ${data.comparedProfiles || 0} profil(s) compares.`
          );
        } else {
          setMatchPreview(null);
          setMatchHintMessage(
            data.message || 'Aucun match reel pour le moment.'
          );
        }
      } catch {
        setMatchHintMessage(
          'Erreur reseau pendant le calcul du matching reel.'
        );
      }
    };

    fetchRealMatch();
  }, [apiFetch, authResolved, currentUser, matchFilters]);

  const updateFilters = useCallback((filters: MatchFilters) => {
    setMatchFilters(filters);
  }, []);

  return {
    matchPreview,
    matchHintMessage,
    matchFilters,
    updateFilters,
    topMatches,
  };
};
