import { useEffect, useState } from 'react';
import type { Implant } from '../types';

interface Props {
  implant: Implant;
  score?: number;
  onSelect: (implant: Implant) => void;
}

export function ImplantCard({ implant, score, onSelect }: Props) {
  const [zoom, setZoom] = useState(false);

  const cardImage =
    implant.views?.find((v) => v.view === 'AP')?.src ??
    implant.views?.find((v) => v.view === 'Templating')?.src ??
    implant.views?.[0]?.src;

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  return (
    <div className="card">
      {cardImage ? (
        <button
          className="card-thumb-btn"
          onClick={() => setZoom(true)}
          aria-label={`Enlarge ${implant.name} image`}
        >
          <img
            className="card-thumb"
            src={cardImage}
            alt={`${implant.name} radiograph`}
            loading="lazy"
          />
        </button>
      ) : (
        <div className="card-thumb card-thumb--empty">No image yet</div>
      )}
      <button className="card-main" onClick={() => onSelect(implant)}>
        <h3>
          {implant.name}
          {score !== undefined && score > 0 && (
            <span className="score-pill">{score} match{score > 1 ? 'es' : ''}</span>
          )}
        </h3>
        <div className="badges">
          <span className="badge mfr">{implant.manufacturer}</span>
          <span className="badge">{implant.anatomy}</span>
          <span className="badge">{implant.category}</span>
          {implant.source === 'user' && <span className="badge user">Added by you</span>}
        </div>
        <p className="summary">{implant.summary}</p>
      </button>

      {zoom && cardImage && (
        <div className="lightbox" onClick={() => setZoom(false)} role="dialog" aria-modal="true">
          <button className="lightbox-close" onClick={() => setZoom(false)} aria-label="Close">
            ✕
          </button>
          <img
            className="lightbox-img"
            src={cardImage}
            alt={`${implant.name} radiograph`}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="lightbox-cap">{implant.name}</div>
        </div>
      )}
    </div>
  );
}
