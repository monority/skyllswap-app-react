import { useState, useMemo, useCallback, lazy, Suspense } from 'react';

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
  Header,
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
  const [isChatOpen, setIsChatOpen] = useState(false);

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
      if (result.success) {
        setProfileMessage('');
      }
      return result;
    },
    [login, setProfileMessage]
  );

  const handleRegister = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await register(name, email, password);
      if (result.success) {
        setProfileMessage('');
      }
      return result;
    },
    [register, setProfileMessage]
  );

  const handleLogout = useCallback(async () => {
    await logout();
    setProfileMessage('');
  }, [logout, setProfileMessage]);

  const handleFiltersChange = useCallback(
    (filters: MatchFilters) => {
      updateFilters(filters);
    },
    [updateFilters]
  );

  const handleStartConversation = useCallback(
    async (matchId: number) => {
      await startConversation(matchId);
      setIsChatOpen(true);
    },
    [startConversation]
  );

  return (
    <>
      <Seo />
      <div className="page-wrapper">
        <Header apiStatus={apiStatus} user={currentUser} onLogout={handleLogout} onOpenMessages={() => setIsChatOpen(true)} unreadCount={unreadCount} />

        {currentUser ? (
          /* LOGGED IN: Full Dashboard */
          <main className="dashboard" aria-busy={isLoading || profileLoading}>
            <section className="panel">
              <h2>Mon profil</h2>
              <div className="panel-content">
                <ProfileForm
                  form={profileForm}
                  onUpdateField={updateProfileField}
                  onSave={saveProfile}
                  loading={profileLoading}
                  saving={profileSaving}
                  message={profileMessage}
                />
              </div>
            </section>

            <section className="panel">
              <h2>Recherche</h2>
              <div className="panel-content">
                <SkillsList
                  skills={visibleSkills}
                  query={query}
                  onQueryChange={setQuery}
                  isLoading={isLoading}
                />
              </div>
            </section>

            <section className="panel">
              <h2>Matchs</h2>
              <div className="panel-content">
                <Suspense fallback={<SectionLoader />}>
                  <MatchSection
                    currentUser={currentUser}
                    matchPreview={matchPreview}
                    topMatches={topMatches}
                    matchFilters={matchFilters}
                    onFiltersChange={handleFiltersChange}
                    onStartConversation={handleStartConversation}
                    hintMessage={matchHintMessage}
                  />
                </Suspense>
              </div>
            </section>
          </main>
        ) : (
          /* NOT LOGGED IN: Auth Landing Page */
          <main className="auth-landing" aria-busy={isLoading}>
            <div className="auth-landing-card">
              <div className="auth-landing-brand">
                <div className="auth-logo">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h1>SkillSwap</h1>
                <p>Échangez vos compétences, apprenez ensemble</p>
              </div>

              <AuthForm
                onLogin={handleLogin}
                onRegister={handleRegister}
                loading={false}
              />
            </div>
          </main>
        )}

        {/* Chat Modal */}
        {isChatOpen && (
          <div className="chat-modal">
            <div className="chat-modal-header">
              <h3>Messagerie</h3>
              <button
                className="chat-close"
                onClick={() => setIsChatOpen(false)}
                aria-label="Fermer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="chat-modal-body">
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
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
