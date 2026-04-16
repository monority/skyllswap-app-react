import { memo } from 'react';
import { ROADMAP_ITEMS, ROADMAP_STATUS_LABELS } from '../../constants';

function Roadmap() {
  return (
    <section className="roadmap panel">
      <h2>Roadmap guidee</h2>
      <ol className="roadmap-list">
        {ROADMAP_ITEMS.map(item => (
          <li key={item.id} className="roadmap-item">
            <span>{item.label}</span>
            <span className={`roadmap-pill ${item.status}`}>
              {ROADMAP_STATUS_LABELS[item.status]}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default memo(Roadmap);
