import type { Implant } from '../types';
import { radiopaediaSearchUrl } from '../lib/search';

interface Props {
  implant: Implant;
  score?: number;
  onSelect: (implant: Implant) => void;
}

export function ImplantCard({ implant, score, onSelect }: Props) {
  return (
    <div className="card">
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
      <a
        className="card-link"
        href={radiopaediaSearchUrl(implant)}
        target="_blank"
        rel="noreferrer"
      >
        Radiopaedia ↗
      </a>
    </div>
  );
}
