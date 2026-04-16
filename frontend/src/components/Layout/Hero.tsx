import { memo } from 'react';
import StatusBadge from '../UI/StatusBadge';

interface HeroProps {
  apiStatus: string;
}

function Hero({ apiStatus }: HeroProps) {
  return (
    <section className="hero">
      <div className="window-chrome" aria-hidden="true">
        <span className="dot red" />
        <span className="dot amber" />
        <span className="dot green" />
      </div>
      <p className="badge">SkillSwap Local</p>
      <h1>Echange tes competences, pas ton temps.</h1>
      <p className="subtitle">
        MVP full-stack React + Express avec auth, profil editable, recherche de
        competences et preview de match local.
      </p>
      <div className="status-row">
        <StatusBadge status={apiStatus} label="API" />
        <span className="status muted">Ville de test: Paris</span>
      </div>
    </section>
  );
}

export default memo(Hero);
