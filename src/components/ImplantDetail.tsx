import { useEffect } from 'react';
import type { Implant } from '../types';

interface Props {
  implant: Implant;
  onClose: () => void;
}

export function ImplantDetail({ implant, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2>{implant.name}</h2>
        <div className="badges">
          <span className="badge mfr">{implant.manufacturer}</span>
          <span className="badge">{implant.anatomy}</span>
          <span className="badge">{implant.category}</span>
          {implant.fixation !== 'N/A' && <span className="badge">{implant.fixation}</span>}
        </div>
        <div className="meta-row">
          {implant.era && <span>Market period: {implant.era}</span>}
        </div>

        <section>
          <h4>Overview</h4>
          <p>{implant.summary}</p>
        </section>

        <section>
          <h4>Radiographic identifying features</h4>
          <ul>
            {implant.identifyingFeatures.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </section>

        {implant.variants && implant.variants.length > 0 && (
          <section>
            <h4>Notable variants</h4>
            <ul>
              {implant.variants.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </section>
        )}

        {implant.notes && (
          <section>
            <p className="note">{implant.notes}</p>
          </section>
        )}
      </div>
    </div>
  );
}
