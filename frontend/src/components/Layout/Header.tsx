import { memo } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface HeaderProps {
  apiStatus: string;
  user?: User | null;
  onLogout?: () => Promise<void>;
  onOpenMessages?: () => void;
  unreadCount?: number;
}

function Header({ apiStatus, user, onLogout, onOpenMessages, unreadCount }: HeaderProps) {
  const isOnline = apiStatus === 'online';
  const isLoading = apiStatus === 'loading';

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">SkillSwap</span>
        </div>
        <span className="header-tagline">Échange de compétences local</span>
      </div>

      <div className="header-right">
        {user && onOpenMessages && (
          <button className="header-messages" title="Messages" onClick={onOpenMessages}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            {unreadCount && unreadCount > 0 && (
              <span className="header-messages-badge">{unreadCount}</span>
            )}
          </button>
        )}
        {user ? (
          <div className="header-user">
            <span className="header-user-name">{user.name}</span>
            {onLogout && (
              <button className="header-logout" onClick={onLogout} title="Se déconnecter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div
            className={`header-status ${isLoading ? 'header-status--loading' : !isOnline ? 'header-status--offline' : ''
              }`}
          >
            <span className="header-status__dot" />
            <span>{isLoading ? 'Connexion...' : isOnline ? 'En ligne' : 'Hors ligne'}</span>
          </div>
        )}
        <span className="header-meta">Paris</span>
      </div>
    </header>
  );
}

export default memo(Header);
