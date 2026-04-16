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
    <form className="auth-form" onSubmit={handleSubmit}>
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
        label="Disponibilite"
        id="profile-availability"
        value={form.availability}
        onChange={e => onUpdateField('availability', e.target.value)}
        options={AVAILABILITY_OPTIONS}
      />

      <label className="field-label" htmlFor="profile-offers">
        Ce que je propose
      </label>
      <textarea
        id="profile-offers"
        value={form.offersText}
        onChange={e => onUpdateField('offersText', e.target.value)}
        placeholder="React, Design UI, Anglais"
        rows={3}
      />

      <label className="field-label" htmlFor="profile-needs">
        Ce que je recherche
      </label>
      <textarea
        id="profile-needs"
        value={form.needsText}
        onChange={e => onUpdateField('needsText', e.target.value)}
        placeholder="Node.js, Photographie, Cuisine"
        rows={3}
      />

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
