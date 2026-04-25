import { memo } from 'react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import { AVAILABILITY_OPTIONS } from '../../constants';
import type { ProfileFormData } from '../../types';

interface ProfileFormProps {
  form: ProfileFormData;
  onUpdateField: (key: keyof ProfileFormData, value: string) => void;
  onSave: () => Promise<{ success: boolean }>;
  loading: boolean;
  saving: boolean;
  message: string;
}

function ProfileForm({
  form,
  onUpdateField,
  onSave,
  loading,
  saving,
  message,
}: ProfileFormProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave();
  };

  if (!form) {
    return <p className="hint">Connecte-toi pour completer ton profil.</p>;
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-section">
        <div className="profile-section__header">
          <span className="profile-section__icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <span className="profile-section-label">Localisation</span>
        </div>
        <Input
          label="Ville"
          id="profile-city"
          value={form.city}
          onChange={e => onUpdateField('city', e.target.value)}
          placeholder="Ex: Paris"
          minLength={2}
          maxLength={60}
          required
        />
        <Select
          label="Disponibilité"
          id="profile-availability"
          value={form.availability}
          onChange={e => onUpdateField('availability', e.target.value)}
          options={AVAILABILITY_OPTIONS}
        />
      </div>

      <div className="profile-section">
        <div className="profile-section__header">
          <span className="profile-section__icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2 3.5 7v10L12 22l8.5-5V7L12 2z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <span className="profile-section-label">Compétences</span>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="profile-offers">
            Ce que je propose
          </label>
          <textarea
            id="profile-offers"
            className="input textarea"
            value={form.offersText}
            onChange={e => onUpdateField('offersText', e.target.value)}
            placeholder="React, Design UI, Anglais"
            rows={2}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="profile-needs">
            Ce que je recherche
          </label>
          <textarea
            id="profile-needs"
            className="input textarea"
            value={form.needsText}
            onChange={e => onUpdateField('needsText', e.target.value)}
            placeholder="Node.js, Photographie, Cuisine"
            rows={2}
          />
        </div>
      </div>

      <Button type="submit" disabled={saving || loading}>
        {saving ? 'Sauvegarde...' : 'Enregistrer le profil'}
      </Button>

      {message ? (
        <p className="hint" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}

export default memo(ProfileForm);
