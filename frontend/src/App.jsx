import { useEffect, useMemo, useState } from 'react';
import './App.css';

const parseCommaSeparated = (text) =>
  text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const baseRoadmapItems = [
  { id: 1, label: 'Auth utilisateur', status: 'done' },
  { id: 2, label: 'Creation du profil (offres / besoins)', status: 'done' },
  { id: 3, label: 'Persistance PostgreSQL + Prisma', status: 'done' },
  { id: 4, label: 'Matching reel base sur offres / besoins', status: 'in-progress' },
  { id: 5, label: 'Messagerie basique entre utilisateurs', status: 'in-progress' },
  { id: 6, label: 'Deploiement cloud (front + API + DB)', status: 'done' },
];

const roadmapStatusLabel = {
  done: 'Fait',
  'in-progress': 'En cours',
  todo: 'A faire',
};

function App() {
  const [query, setQuery] = useState('');
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking');
  const [matchPreview, setMatchPreview] = useState(null);
  const [isRealMatchLive, setIsRealMatchLive] = useState(false);
  const [matchHintMessage, setMatchHintMessage] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('skillswap_token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [profileForm, setProfileForm] = useState({
    city: '',
    availability: 'flexible',
    offersText: '',
    needsText: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [convMessages, setConvMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagingSending, setMessagingSending] = useState(false);
  const [messagingLoaded, setMessagingLoaded] = useState(false);

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL || 'http://localhost:4000',
    [],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [healthRes, skillsRes, matchRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/health`),
          fetch(`${apiBaseUrl}/api/skills`),
          fetch(`${apiBaseUrl}/api/matches/preview`),
        ]);

        if (!healthRes.ok || !skillsRes.ok || !matchRes.ok) {
          throw new Error('API unavailable');
        }

        const health = await healthRes.json();
        const skillsData = await skillsRes.json();
        const matchData = await matchRes.json();

        setApiStatus(health.status);
        setSkills(skillsData.items);
        setMatchPreview(matchData.bestMatch);
      } catch {
        setApiStatus('down');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [apiBaseUrl]);

  useEffect(() => {
    localStorage.setItem('skillswap_token', authToken);
  }, [authToken]);

  useEffect(() => {
    const fetchMe = async () => {
      if (!authToken) {
        setCurrentUser(null);
        setProfileMessage('');
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          setAuthToken('');
          setCurrentUser(null);
          return;
        }

        const data = await response.json();
        setCurrentUser(data.user);
      } catch {
        setCurrentUser(null);
      }
    };

    fetchMe();
  }, [apiBaseUrl, authToken]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authToken) {
        setProfileForm({
          city: '',
          availability: 'flexible',
          offersText: '',
          needsText: '',
        });
        return;
      }

      setProfileLoading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/api/profile/me`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          setProfileMessage('Impossible de charger le profil.');
          return;
        }

        const data = await response.json();
        const profile = data.profile || {};
        setProfileForm({
          city: profile.city || '',
          availability: profile.availability || 'flexible',
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
  }, [apiBaseUrl, authToken]);

  useEffect(() => {
    const fetchRealMatch = async () => {
      if (!authToken) {
        setIsRealMatchLive(false);
        try {
          const previewResponse = await fetch(`${apiBaseUrl}/api/matches/preview`);
          if (previewResponse.ok) {
            const previewData = await previewResponse.json();
            setMatchPreview(previewData.bestMatch || null);
          }
        } catch {
          // no-op
        }
        setMatchHintMessage('Etape suivante: passer du preview aleatoire a un matching reel en base.');
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/matches/me`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          setIsRealMatchLive(false);
          setMatchHintMessage(data.message || 'Matching reel indisponible pour le moment.');
          return;
        }

        setIsRealMatchLive(true);
        if (data.bestMatch) {
          setMatchPreview(data.bestMatch);
          setMatchHintMessage('Matching reel actif: resultat calcule depuis les profils en base.');
        } else {
          setMatchPreview(null);
          setMatchHintMessage(data.message || 'Aucun match reel pour le moment.');
        }
      } catch {
        setIsRealMatchLive(false);
        setMatchHintMessage('Erreur reseau pendant le calcul du matching reel.');
      }
    };

    fetchRealMatch();
  }, [apiBaseUrl, authToken]);

  useEffect(() => {
    const loadConversations = async () => {
      if (!authToken) {
        setConversations([]);
        setMessagingLoaded(false);
        return;
      }
      try {
        const res = await fetch(`${apiBaseUrl}/api/conversations`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
          setMessagingLoaded(true);
        }
      } catch {
        // no-op
      }
    };
    loadConversations();
  }, [apiBaseUrl, authToken]);

  const roadmapItems = useMemo(
    () =>
      baseRoadmapItems.map((item) => {
        if (item.id === 4) return { ...item, status: isRealMatchLive ? 'done' : 'in-progress' };
        if (item.id === 5) return { ...item, status: messagingLoaded ? 'done' : 'in-progress' };
        return item;
      }),
    [isRealMatchLive, messagingLoaded],
  );

  const visibleSkills = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return skills;
    return skills.filter((skill) => skill.title.toLowerCase().includes(normalized));
  }, [skills, query]);

  const onAuthInput = (key, value) => {
    setAuthForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthMessage('');
    setAuthLoading(true);

    try {
      const endpoint = authMode === 'register' ? 'register' : 'login';
      const payload =
        authMode === 'register'
          ? authForm
          : { email: authForm.email, password: authForm.password };

      const response = await fetch(`${apiBaseUrl}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthMessage(data.message || 'Erreur auth');
        return;
      }

      setAuthToken(data.token);
      setCurrentUser(data.user);
      setAuthMessage(authMode === 'register' ? 'Compte cree et connecte.' : 'Connexion reussie.');
      setProfileMessage('');
      setAuthForm((previous) => ({
        ...previous,
        password: '',
      }));
    } catch {
      setAuthMessage('Impossible de joindre le serveur auth.');
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, { method: 'POST' });
    } catch {
      // no-op
    }

    setAuthToken('');
    setCurrentUser(null);
    setAuthMessage('Session fermee.');
    setProfileMessage('');
  };

  const onProfileInput = (key, value) => {
    setProfileForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileMessage('');
    setProfileSaving(true);

    try {
      const payload = {
        city: profileForm.city,
        availability: profileForm.availability,
        offers: parseCommaSeparated(profileForm.offersText),
        needs: parseCommaSeparated(profileForm.needsText),
      };

      const response = await fetch(`${apiBaseUrl}/api/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setProfileMessage(data.message || 'Erreur de sauvegarde profil.');
        return;
      }

      const updated = data.profile || payload;
      setProfileForm({
        city: updated.city || '',
        availability: updated.availability || 'flexible',
        offersText: (updated.offers || []).join(', '),
        needsText: (updated.needs || []).join(', '),
      });
      setProfileMessage('Profil enregistre.');
    } catch {
      setProfileMessage('Impossible de joindre le serveur profil.');
    } finally {
      setProfileSaving(false);
    }
  };

  const startConversation = async (recipientId) => {
    if (!authToken || !recipientId) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ recipientId }),
      });
      if (res.ok) {
        const data = await res.json();
        const conv = data.conversation;
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === conv.id);
          return exists ? prev.map((c) => (c.id === conv.id ? conv : c)) : [conv, ...prev];
        });
        setActiveConvId(conv.id);
        setConvMessages(conv.messages || []);
        setMessagingLoaded(true);
      }
    } catch {
      // no-op
    }
  };

  const loadMessages = async (convId) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConvMessages(data.messages || []);
      }
    } catch {
      // no-op
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;
    setMessagingSending(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setConvMessages((prev) => [...prev, data.message]);
        setNewMessage('');
      }
    } catch {
      // no-op
    } finally {
      setMessagingSending(false);
    }
  };

  return (
    <main className="page" aria-busy={isLoading || profileLoading}>
      <section className="hero">
        <div className="window-chrome" aria-hidden="true">
          <span className="dot red" />
          <span className="dot amber" />
          <span className="dot green" />
        </div>
        <p className="badge">SkillSwap Local</p>
        <h1>Echange tes competences, pas ton temps.</h1>
        <p className="subtitle">
          MVP full-stack React + Express avec auth, profil editable, recherche de competences
          et preview de match local.
        </p>
        <div className="status-row">
          <span className={`status ${apiStatus === 'ok' ? 'up' : 'down'}`}>
            API: {apiStatus}
          </span>
          <span className="status muted">Ville de test: Paris</span>
        </div>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Compte</h2>

          {currentUser ? (
            <div className="auth-user">
              <p className="name">Connecte: {currentUser.name}</p>
              <p>{currentUser.email}</p>
              <button type="button" className="secondary" onClick={logout}>
                Se deconnecter
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={submitAuth}>
              <div className="auth-actions">
                <button
                  type="button"
                  className={authMode === 'login' ? '' : 'secondary'}
                  onClick={() => setAuthMode('login')}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  className={authMode === 'register' ? '' : 'secondary'}
                  onClick={() => setAuthMode('register')}
                >
                  Inscription
                </button>
              </div>

              {authMode === 'register' ? (
                <input
                  value={authForm.name}
                  onChange={(event) => onAuthInput('name', event.target.value)}
                  placeholder="Ton pseudo"
                  required
                />
              ) : null}

              <input
                value={authForm.email}
                onChange={(event) => onAuthInput('email', event.target.value)}
                placeholder="Email"
                aria-label="Email"
                type="email"
                required
              />
              <input
                value={authForm.password}
                onChange={(event) => onAuthInput('password', event.target.value)}
                placeholder="Mot de passe"
                aria-label="Mot de passe"
                type="password"
                minLength={6}
                required
              />
              <button type="submit" disabled={authLoading}>
                {authLoading ? 'Chargement...' : authMode === 'register' ? 'Creer mon compte' : 'Me connecter'}
              </button>
            </form>
          )}

          {authMessage ? <p className="hint" role="status">{authMessage}</p> : null}
        </article>

        <article className="panel">
          <h2>Mon profil</h2>

          {!currentUser ? (
            <p className="hint">Connecte-toi pour completer ton profil.</p>
          ) : (
            <form className="auth-form" onSubmit={saveProfile}>
              <label className="field-label" htmlFor="profile-city">
                Ville
              </label>
              <input
                id="profile-city"
                value={profileForm.city}
                onChange={(event) => onProfileInput('city', event.target.value)}
                placeholder="Ex: Paris"
                minLength={2}
                maxLength={60}
                required
              />

              <label className="field-label" htmlFor="profile-availability">
                Disponibilite
              </label>
              <select
                id="profile-availability"
                value={profileForm.availability}
                onChange={(event) => onProfileInput('availability', event.target.value)}
              >
                <option value="matin">Matin</option>
                <option value="apres-midi">Apres-midi</option>
                <option value="soir">Soir</option>
                <option value="week-end">Week-end</option>
                <option value="flexible">Flexible</option>
              </select>

              <label className="field-label" htmlFor="profile-offers">
                Ce que je propose
              </label>
              <textarea
                id="profile-offers"
                value={profileForm.offersText}
                onChange={(event) => onProfileInput('offersText', event.target.value)}
                placeholder="React, Design UI, Anglais"
                rows={3}
              />

              <label className="field-label" htmlFor="profile-needs">
                Ce que je recherche
              </label>
              <textarea
                id="profile-needs"
                value={profileForm.needsText}
                onChange={(event) => onProfileInput('needsText', event.target.value)}
                placeholder="Node.js, Photographie, Cuisine"
                rows={3}
              />

              <button type="submit" disabled={profileSaving || profileLoading}>
                {profileSaving ? 'Sauvegarde...' : 'Enregistrer le profil'}
              </button>
            </form>
          )}

          {profileMessage ? <p className="hint" role="status">{profileMessage}</p> : null}
        </article>

        <article className="panel">
          <h2>Recherche de competences</h2>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex: React, cuisine, anglais..."
            aria-label="Filtrer les competences"
          />

          {isLoading ? <p>Chargement des competences...</p> : null}
          {!isLoading && visibleSkills.length === 0 ? (
            <p>Aucune competence ne correspond a ta recherche.</p>
          ) : null}

          <ul className="skills-list">
            {visibleSkills.map((skill) => (
              <li key={skill.id}>
                <div>
                  <h3>{skill.title}</h3>
                  <p>Niveau: {skill.level}</p>
                </div>
                <div className="stats">
                  <span>{skill.offers} offres</span>
                  <span>{skill.needs} besoins</span>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Preview du meilleur match</h2>
          {matchPreview ? (
            <div className="match-card">
              <p className="name">{matchPreview.pseudo}</p>
              <p>Donne: {matchPreview.gives}</p>
              <p>Recherche: {matchPreview.wants}</p>
              <p className="score">Compatibilite: {matchPreview.compatibility}%</p>
              <button
                type="button"
                disabled={!authToken || !matchPreview?.matchId}
                onClick={() => matchPreview?.matchId && startConversation(matchPreview.matchId)}
              >
                Demarrer une discussion
              </button>
            </div>
          ) : (
            <p>Match indisponible (API non joignable).</p>
          )}
          <p className="hint">{matchHintMessage || 'Calcul du matching en cours...'}</p>
        </article>
      </section>

      <section className="panel messaging-panel">
        <h2>Messagerie</h2>
        {!currentUser ? (
          <p className="hint">Connecte-toi pour acceder a la messagerie.</p>
        ) : (
          <div className="messaging-layout">
            <aside className="conv-list">
              {conversations.length === 0 ? (
                <p className="hint">Aucune conversation. Demarre un match et clique "Demarrer une discussion".</p>
              ) : (
                conversations.map((conv) => {
                  const other = conv.participants.find((p) => p.id !== currentUser.id);
                  const lastMsg = conv.messages?.[0];
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      className={`conv-item${activeConvId === conv.id ? ' active' : ' secondary'}`}
                      onClick={() => {
                        setActiveConvId(conv.id);
                        loadMessages(conv.id);
                      }}
                    >
                      <span className="conv-name">{other?.name || 'Utilisateur'}</span>
                      {lastMsg && <span className="conv-preview">{lastMsg.content}</span>}
                    </button>
                  );
                })
              )}
            </aside>
            <div className="message-thread">
              {activeConvId ? (
                <>
                  <div className="messages-area">
                    {convMessages.length === 0 ? (
                      <p className="hint">Aucun message. Ecris le premier !</p>
                    ) : (
                      convMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`msg-bubble ${msg.sender?.id === currentUser.id ? 'mine' : 'theirs'}`}
                        >
                          <span className="msg-content">{msg.content}</span>
                          <span className="msg-meta">{msg.sender?.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <form className="message-form" onSubmit={sendMessage}>
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ecris un message..."
                      maxLength={500}
                      required
                    />
                    <button type="submit" disabled={messagingSending || !newMessage.trim()}>
                      {messagingSending ? '...' : 'Envoyer'}
                    </button>
                  </form>
                </>
              ) : (
                <p className="hint">Selectionne une conversation ou demarre un match.</p>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="roadmap panel">
        <h2>Roadmap guidee</h2>
        <ol className="roadmap-list">
          {roadmapItems.map((item) => (
            <li key={item.id} className="roadmap-item">
              <span>{item.label}</span>
              <span className={`roadmap-pill ${item.status}`}>
                {roadmapStatusLabel[item.status]}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

export default App;
