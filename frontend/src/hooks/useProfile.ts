import { useState, useEffect, useCallback } from 'react';
import { parseCommaSeparated } from '../utils';
import type { ProfileFormData, User, Availability } from '../types';
import type { ApiFetch } from './useApi';

interface ProfileResponse {
  profile: {
    city: string;
    availability: string;
    offers: string[];
    needs: string[];
  };
}

interface UpdateProfileResponse {
  profile: {
    city: string;
    availability: string;
    offers: string[];
    needs: string[];
  };
  message?: string;
}

const defaultProfileForm: ProfileFormData = {
  city: '',
  availability: 'flexible',
  offersText: '',
  needsText: '',
};

export const useProfile = (
  currentUser: User | null,
  apiFetch: ApiFetch,
  authResolved: boolean
) => {
  const [profileForm, setProfileForm] =
    useState<ProfileFormData>(defaultProfileForm);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    if (!authResolved) return;

    const fetchProfile = async () => {
      if (!currentUser) {
        setProfileForm(defaultProfileForm);
        return;
      }

      setProfileLoading(true);
      try {
        const response = await apiFetch('/api/profile/me');

        if (!response.ok) {
          setProfileMessage('Impossible de charger le profil.');
          return;
        }

        const data = (await response.json()) as ProfileResponse;
        const profile = data.profile || {};
        setProfileForm({
          city: profile.city || '',
          availability: (profile.availability as Availability) || 'flexible',
          offersText: (profile.offers || []).join(', '),
          needsText: (profile.needs || []).join(', '),
        });
      } catch {
        setProfileMessage('Erreur reseau pendant le chargement du profil.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [apiFetch, authResolved, currentUser]);

  const updateProfileField = useCallback(
    (key: keyof ProfileFormData, value: string) => {
      setProfileForm(prev => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const saveProfile = useCallback(async (): Promise<{ success: boolean }> => {
    setProfileMessage('');
    setProfileSaving(true);

    try {
      const payload = {
        city: profileForm.city,
        availability: profileForm.availability,
        offers: parseCommaSeparated(profileForm.offersText),
        needs: parseCommaSeparated(profileForm.needsText),
      };

      const response = await apiFetch('/api/profile/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as UpdateProfileResponse;
      if (!response.ok) {
        setProfileMessage(data.message || 'Erreur de sauvegarde profil.');
        return { success: false };
      }

      const updated = data.profile || payload;
      setProfileForm({
        city: updated.city || '',
        availability: (updated.availability as Availability) || 'flexible',
        offersText: (updated.offers || []).join(', '),
        needsText: (updated.needs || []).join(', '),
      });
      setProfileMessage('Profil enregistre.');
      return { success: true };
    } catch {
      setProfileMessage('Impossible de joindre le serveur profil.');
      return { success: false };
    } finally {
      setProfileSaving(false);
    }
  }, [apiFetch, profileForm]);

  return {
    profileForm,
    updateProfileField,
    saveProfile,
    profileLoading,
    profileSaving,
    profileMessage,
    setProfileMessage,
  };
};
