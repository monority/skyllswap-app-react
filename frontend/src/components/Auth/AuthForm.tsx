import { useState, useCallback, memo } from 'react';
import Button from '../UI/Button';

interface AuthFormProps {
  onLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  onRegister: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  loading: boolean;
}

function AuthForm({ onLogin, onRegister, loading }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const handleInput = useCallback((key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setMessage('');

      const email = form.email.trim().toLowerCase();

      if (mode === 'register') {
        const result = await onRegister(form.name.trim(), email, form.password);
        if (!result.success) {
          setMessage(result.message || '');
        } else {
          setMessage('Compte cree et connecte.');
        }
      } else {
        const result = await onLogin(email, form.password);
        if (!result.success) {
          setMessage(result.message || '');
        } else {
          setMessage('Connexion reussie.');
        }
      }
    },
    [form, mode, onLogin, onRegister]
  );

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-actions">
        <Button
          type="button"
          variant={mode === 'login' ? 'primary' : 'secondary'}
          onClick={() => setMode('login')}
        >
          Connexion
        </Button>
        <Button
          type="button"
          variant={mode === 'register' ? 'primary' : 'secondary'}
          onClick={() => setMode('register')}
        >
          Inscription
        </Button>
      </div>

      {mode === 'register' && (
        <input
          value={form.name}
          onChange={e => handleInput('name', e.target.value)}
          placeholder="Ton pseudo"
          autoComplete="nickname"
          minLength={2}
          maxLength={40}
          required
        />
      )}

      <input
        value={form.email}
        onChange={e => handleInput('email', e.target.value)}
        placeholder="Email"
        aria-label="Email"
        type="email"
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        maxLength={120}
        required
      />

      <input
        value={form.password}
        onChange={e => handleInput('password', e.target.value)}
        placeholder="Mot de passe"
        aria-label="Mot de passe"
        type="password"
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        minLength={8}
        required
      />

      <Button type="submit" loading={loading}>
        {mode === 'register' ? 'Creer mon compte' : 'Me connecter'}
      </Button>

      {message ? (
        <p className="hint" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}

export default memo(AuthForm);
