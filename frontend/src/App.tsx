import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import './App.css';

import { useApi, useApiInitialization } from './hooks/useApi';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { useMessaging } from './hooks/useMessaging';
import { useMatches } from './hooks/useMatches';
import { useDebounce } from './hooks/useDebounce';

import {
  AuthForm,
  ProfileForm,
  SkillsList,
  Hero,
  Roadmap,
  Button,
  Seo,
} from './components';

const MatchSection = lazy(() =>
  import('./components/Matches/MatchSection').then(m => ({ default: m.default }))
);
const MessagingPanel = lazy(() =>
  import('./components/Messaging/MessagingPanel').then(m => ({ default: m.default }))
);

import type { MatchFilters } from './types';

function SectionLoader() {
  return (
    <div className="section-loader" aria-live="polite">
      <span className="loader-spinner" />
      <span className="sr-only">Chargement...</span>
    </div>
  );
}

function App() {
  const [query, setQuery] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const { apiStatus, skills, isLoading } = useApiInitialization();

  const { apiFetch } = useApi();

  const { currentUser, authResolved, login, register, logout } =
    useAuth(apiFetch);

  const {
    profileForm,
    updateProfileField,
    saveProfile,
    profileLoading,
    profileSaving,
    profileMessage,
    setProfileMessage,
  } = useProfile(currentUser, apiFetch, authResolved);

  const {
    conversations,
    activeConvId,
    selectConversation,
    convMessages,
    newMessage,
    setNewMessage,
    sendMessage,
    startConversation,
    messagesEndRef,
    isUnread,
    unreadCount,
    messagingSending,
  } = useMessaging(currentUser, authResolved, apiFetch);

  const {
    matchPreview,
    matchHintMessage,
    matchFilters,
    updateFilters,
    topMatches,
  } = useMatches(currentUser, authResolved, apiFetch);

  const debouncedQuery = useDebounce(query, 300);

  const visibleSkills = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (!normalized) return skills;
    return skills.filter(skill =>
      skill.title.toLowerCase().includes(normalized)
    );
  }, [skills, debouncedQuery]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const result = await login(email, password);
      if (!result.success) {
        setAuthMessage(result.message || '');
      } else {
        setAuthMessage('Connexion reussie.');
        setProfileMessage('');
      }
      return result;
    },
    [login, setProfileMessage]
  );

  const handleRegister = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await register(name, email, password);
      if (!result.success) {
        setAuthMessage(result.message || '');
      } else {
        setAuthMessage('Compte cree et connecte.');
        setProfileMessage('');
      }
      return result;
    },
    [register, setProfileMessage]
  );

  const handleLogout = useCallback(async () => {
    await logout();
    setAuthMessage('Session fermee.');
    setProfileMessage('');
  }, [logout, setProfileMessage]);

  const handleFiltersChange = useCallback(
    (filters: MatchFilters) => {
      updateFilters(filters);
    },
    [updateFilters]
  );

  return (
    <>
      <Seo />
      <main className="page" aria-busy={isLoading || profileLoading}>
      <Hero apiStatus={apiStatus} />

      <section className="grid">
        <article className="panel">
          <h2>Compte</h2>

          {currentUser ? (
            <div className="auth-user">
              <p className="name">Connecte: {currentUser.name}</p>
              <p>{currentUser.email}</p>
              <Button onClick={handleLogout}>Se deconnecter</Button>
            </div>
          ) : (
            <AuthForm
              onLogin={handleLogin}
              onRegister={handleRegister}
              loading={false}
            />
          )}

          {authMessage ? (
            <p className="hint" role="status">
              {authMessage}
            </p>
          ) : null}
        </article>

        <article className="panel">
          <h2>Mon profil</h2>
          <ProfileForm
            form={profileForm}
            onUpdateField={updateProfileField}
            onSave={saveProfile}
            loading={profileLoading}
            saving={profileSaving}
            message={profileMessage}
          />
        </article>

        <article className="panel">
          <h2>Recherche de competences</h2>
          <SkillsList
            skills={visibleSkills}
            query={query}
            onQueryChange={setQuery}
            isLoading={isLoading}
          />
        </article>

        <article className="panel">
          <h2>Meilleurs matchs</h2>
          <Suspense fallback={<SectionLoader />}>
            <MatchSection
              currentUser={currentUser}
              matchPreview={matchPreview}
              topMatches={topMatches}
              matchFilters={matchFilters}
              onFiltersChange={handleFiltersChange}
              onStartConversation={startConversation}
              hintMessage={matchHintMessage}
            />
          </Suspense>
        </article>
      </section>

      <section className="panel messaging-panel">
        <h2>
          Messagerie
          {unreadCount > 0 ? (
            <span className="badge-count">{unreadCount}</span>
          ) : null}
        </h2>
        <Suspense fallback={<SectionLoader />}>
          <MessagingPanel
            currentUser={currentUser}
            conversations={conversations}
            activeConvId={activeConvId}
            onSelectConversation={selectConversation}
            messages={convMessages}
            newMessage={newMessage}
            onNewMessageChange={setNewMessage}
            onSendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
            isUnread={isUnread}
            sending={messagingSending}
          />
        </Suspense>
      </section>

      <Roadmap />
    </main>
    </>
  );
}

export default App;
