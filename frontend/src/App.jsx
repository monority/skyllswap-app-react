import { useEffect, useMemo, useRef, useState } from 'react';
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
  { id: 4, label: 'Matching reel base sur offres / besoins', status: 'done' },
  { id: 5, label: 'Messagerie basique entre utilisateurs', status: 'done' },
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
  const [matchHintMessage, setMatchHintMessage] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authResolved, setAuthResolved] = useState(false);
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

  const [matchFilters, setMatchFilters] = useState({ city: '', availability: '' });
  const [topMatches, setTopMatches] = useState([]);
  const [lastSeenMap, setLastSeenMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem('skillswap_lastSeen') || '{}'); }
    catch { return {}; }
  });
  const [csrfToken, setCsrfToken] = useState(null);
  const messagesEndRef = useRef(null);

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL || 'http://localhost:4000',
    [],
  );

  const apiFetch = async (path, options = {}) => {
    const nextOptions = {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        ...(csrfToken && !['/api/auth/login', '/api/auth/register', '/api/health', '/api/skills', '/api/matches'].some(p => path.startsWith(p)) ? { 'x-csrf-token': csrfToken } : {}),
      },
    };

    return fetch(`${apiBaseUrl}${path}`, nextOptions);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [healthRes, skillsRes, matchRes] = await Promise.all([
          apiFetch('/api/health'),
          apiFetch('/api/skills'),
          apiFetch('/api/matches/preview'),
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
    const fetchMe = async () => {
      setAuthResolved(false);

      try {
        const response = await apiFetch('/api/auth/me');

        if (!response.ok) {
          setCurrentUser(null);
          return;
        }

        const data = await response.json();
        setCurrentUser(data.user);
      } catch {
        setCurrentUser(null);
      } finally {
        setAuthResolved(true);
      }
    };

    fetchMe();
  }, [apiBaseUrl]);

  useEffect(() => {
    if (!authResolved) {
      return;
    }

    const fetchProfile = async () => {
      if (!currentUser) {
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
        const response = await apiFetch('/api/profile/me');

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
  }, [apiBaseUrl, authResolved, currentUser]);

  useEffect(() => {
    if (!authResolved) {
      return;
    }

    const fetchRealMatch = async () => {
      if (!currentUser) {
        try {
          const previewResponse = await apiFetch('/api/matches/preview');
          if (previewResponse.ok) {
            const previewData = await previewResponse.json();
            setMatchPreview(previewData.bestMatch || null);
          }
        } catch {
          // no-op
        }
        setTopMatches([]);
        setMatchHintMessage('Connecte-toi pour activer le matching reel depuis les profils en base.');
        return;
      }

      try {
        const params = new URLSearchParams();
        if (matchFilters.city) params.set('city', matchFilters.city);
        if (matchFilters.availability) params.set('availability', matchFilters.availability);
        const response = await apiFetch(`/api/matches/me?${params.toString()}`);

        const data = await response.json();
        if (!response.ok) {
          setMatchHintMessage(data.message || 'Matching reel indisponible pour le moment.');
          setTopMatches([]);
          return;
        }

        setTopMatches(data.topMatches || []);
        if (data.bestMatch) {
          setMatchPreview(data.bestMatch);
          setMatchHintMessage(`Matching reel actif: ${data.comparedProfiles || 0} profil(s) compares.`);
        } else {
          setMatchPreview(null);
          setMatchHintMessage(data.message || 'Aucun match reel pour le moment.');
        }
      } catch {
        setMatchHintMessage('Erreur reseau pendant le calcul du matching reel.');
      }
    };

    fetchRealMatch();
  }, [apiBaseUrl, authResolved, currentUser, matchFilters]);

  useEffect(() => {
    if (!authResolved) {
      return;
    }

    const loadConversations = async () => {
      if (!currentUser) {
        setConversations([]);
        setActiveConvId(null);
        setConvMessages([]);
        return;
      }

      try {
        const res = await apiFetch('/api/conversations');
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch {
        // no-op
      }
    };
    loadConversations();
  }, [apiBaseUrl, authResolved, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages]);

  useEffect(() => {
    if (!authResolved || !currentUser || !activeConvId) return;
    const poll = async () => {
      try {
        const res = await apiFetch(`/api/conversations/${activeConvId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setConvMessages(data.messages || []);
        }
      } catch { /* no-op */ }
    };
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [activeConvId, currentUser, authResolved, apiBaseUrl]);

  useEffect(() => {
    if (!authResolved || !currentUser) return;
    const poll = async () => {
      try {
        const res = await apiFetch('/api/conversations');
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch { /* no-op */ }
    };
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [currentUser, authResolved, apiBaseUrl]);

  const visibleSkills = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return skills;
    return skills.filter((skill) => skill.title.toLowerCase().includes(normalized));
  }, [skills, query]);

  const markConvRead = (convId, updatedAt) => {
    setLastSeenMap((prev) => {
      const next = { ...prev, [String(convId)]: updatedAt };
      localStorage.setItem('skillswap_lastSeen', JSON.stringify(next));
      return next;
    });
  };

  const isUnread = (conv) => {
    if (conv.id === activeConvId) return false;
    const lastMsg = conv.messages?.[0];
    if (!lastMsg) return false;
    const lastSeen = lastSeenMap[String(conv.id)];
    if (!lastSeen) return true;
    return new Date(conv.updatedAt) > new Date(lastSeen);
  };

  const unreadCount = conversations.filter(isUnread).length;

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
          ? {
            name: authForm.name.trim(),
            email: authForm.email.trim().toLowerCase(),
            password: authForm.password,
          }
          : {
            email: authForm.email.trim().toLowerCase(),
            password: authForm.password,
          };

      const response = await apiFetch(`/api/auth/${endpoint}`, {
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

      setCurrentUser(data.user);
      if (data.csrfToken) setCsrfToken(data.csrfToken);
      setAuthResolved(true);
      setAuthMessage(authMode === 'register' ? 'Compte cree et connecte.' : 'Connexion reussie.');
      setProfileMessage('');
      setAuthForm((previous) => ({
        ...previous,
        name: authMode === 'register' ? '' : previous.name,
        email: payload.email,
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
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // no-op
    }

    setCurrentUser(null);
    setCsrfToken(null);
    setConversations([]);
    setActiveConvId(null);
    setConvMessages([]);
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

      const response = await apiFetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
    if (!currentUser || !recipientId) return;
    try {
      const res = await apiFetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      }
    } catch {
      // no-op
    }
  };

  const loadMessages = async (convId) => {
    try {
      const res = await apiFetch(`/api/conversations/${convId}/messages`);
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
      const res = await apiFetch(`/api/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
                  autoComplete="nickname"
                  minLength={2}
                  maxLength={40}
                  required
                />
              ) : null}

              <input
                value={authForm.email}
                onChange={(event) => onAuthInput('email', event.target.value)}
                placeholder="Email"
                aria-label="Email"
                type="email"
                autoComplete="email"
                maxLength={120}
                required
              />
              <input
                value={authForm.password}
                onChange={(event) => onAuthInput('password', event.target.value)}
                placeholder="Mot de passe"
                aria-label="Mot de passe"
                type="password"
                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                minLength={8}
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
          <h2>Meilleurs matchs</h2>
          {currentUser ? (
            <div className="match-filters">
              <input
                value={matchFilters.city}
                onChange={(e) => setMatchFilters((f) => ({ ...f, city: e.target.value }))}
                placeholder="Filtrer par ville..."
                aria-label="Ville"
              />
              <select
                value={matchFilters.availability}
                onChange={(e) => setMatchFilters((f) => ({ ...f, availability: e.target.value }))}
                aria-label="Disponibilite"
              >
                <option value="">Toutes disponibilites</option>
                <option value="matin">Matin</option>
                <option value="apres-midi">Apres-midi</option>
                <option value="soir">Soir</option>
                <option value="week-end">Week-end</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          ) : null}
          {!currentUser && matchPreview ? (
            <div className="match-card">
              <p className="name">{matchPreview.pseudo}</p>
              <p>Donne: {matchPreview.gives}</p>
              <p>Recherche: {matchPreview.wants}</p>
              <p className="score">Compatibilite: {matchPreview.compatibility}%</p>
            </div>
          ) : null}
          {currentUser && topMatches.length === 0 ? (
            <p className="hint">Aucun profil correspondant. Elargis tes filtres ou complete ton profil.</p>
          ) : null}
          {currentUser ? (
            <div className="top-matches">
              {topMatches.map((match) => (
                <div key={match.matchId} className="match-item">
                  <div className="match-info">
                    <p className="name">{match.pseudo}</p>
                    <p>{match.city}{match.availability ? ` · ${match.availability}` : ''}</p>
                    <p>{match.gives}</p>
                  </div>
                  <span className="score">{match.compatibility}%</span>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => startConversation(match.matchId)}
                  >
                    Contacter
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <p className="hint">{matchHintMessage || 'Calcul du matching en cours...'}</p>
        </article>
      </section>

      <section className="panel messaging-panel">
        <h2>
          Messagerie
          {unreadCount > 0 ? <span className="badge-count">{unreadCount}</span> : null}
        </h2>
        {!currentUser ? (
          <p className="hint">Connecte-toi pour acceder a la messagerie.</p>
        ) : (
          <div className="messaging-layout">
            <aside className="conv-list">
              {conversations.length === 0 ? (
                <p className="hint">Aucune conversation. Demarre un match et clique "Contacter".</p>
              ) : (
                conversations.map((conv) => {
                  const other = conv.participants.find((p) => p.id !== currentUser.id);
                  const lastMsg = conv.messages?.[0];
                  const unread = isUnread(conv);
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      className={`conv-item${activeConvId === conv.id ? ' active' : ' secondary'}${unread ? ' unread' : ''}`}
                      onClick={() => {
                        setActiveConvId(conv.id);
                        loadMessages(conv.id);
                        markConvRead(conv.id, conv.updatedAt);
                      }}
                    >
                      <div className="conv-item-header">
                        <span className="conv-name">{other?.name || 'Utilisateur'}</span>
                        {unread ? <span className="unread-dot" aria-label="Nouveau message" /> : null}
                      </div>
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
                    <div ref={messagesEndRef} />
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
          {baseRoadmapItems.map((item) => (
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
