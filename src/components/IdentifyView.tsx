import { useMemo, useState } from 'react';
import type { Anatomy, Fixation, Implant, Manufacturer } from '../types';
import { implants } from '../data/implants';
import { featureScore, tokenize } from '../lib/search';
import { ImplantCard } from './ImplantCard';

const ANATOMIES: Anatomy[] = [
  'Hip',
  'Knee',
  'Shoulder',
  'Trauma / Fracture fixation',
  'Sports medicine / Soft tissue',
];

const MANUFACTURERS: (Manufacturer | 'Any / unknown')[] = [
  'Any / unknown',
  'Zimmer Biomet',
  'Stryker',
  'Smith & Nephew',
  'Arthrex',
  'DePuy Synthes',
];

const FIXATIONS: (Fixation | 'Any / unknown')[] = ['Any / unknown', 'Cemented', 'Cementless'];

interface Props {
  onSelect: (implant: Implant) => void;
}

export function IdentifyView({ onSelect }: Props) {
  const [anatomy, setAnatomy] = useState<Anatomy | null>(null);
  const [manufacturer, setManufacturer] = useState<Manufacturer | 'Any / unknown'>('Any / unknown');
  const [fixation, setFixation] = useState<Fixation | 'Any / unknown'>('Any / unknown');
  const [features, setFeatures] = useState('');

  const showFixation = anatomy === 'Hip' || anatomy === 'Knee';

  const scored = useMemo(() => {
    if (!anatomy) return [];
    const tokens = tokenize(features);
    return implants
      .filter((i) => i.anatomy === anatomy)
      .filter((i) => manufacturer === 'Any / unknown' || i.manufacturer === manufacturer)
      .filter((i) => {
        if (!showFixation || fixation === 'Any / unknown') return true;
        // "Either" implants are compatible with whatever fixation was observed.
        return i.fixation === fixation || i.fixation === 'Either';
      })
      .map((i) => ({ implant: i, score: featureScore(i, tokens) }))
      .sort((a, b) => b.score - a.score || a.implant.name.localeCompare(b.implant.name));
  }, [anatomy, manufacturer, fixation, features, showFixation]);

  const reset = () => {
    setAnatomy(null);
    setManufacturer('Any / unknown');
    setFixation('Any / unknown');
    setFeatures('');
  };

  return (
    <div>
      <div className="identify-step">
        <h3>1. What region is the implant in?</h3>
        <div className="option-row">
          {ANATOMIES.map((a) => (
            <button
              key={a}
              className={`option-btn ${anatomy === a ? 'selected' : ''}`}
              onClick={() => setAnatomy(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {anatomy && (
        <>
          <div className="identify-step">
            <h3>2. Manufacturer (if known)</h3>
            <div className="option-row">
              {MANUFACTURERS.map((m) => (
                <button
                  key={m}
                  className={`option-btn ${manufacturer === m ? 'selected' : ''}`}
                  onClick={() => setManufacturer(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {showFixation && (
            <div className="identify-step">
              <h3>3. Fixation seen on imaging</h3>
              <div className="option-row">
                {FIXATIONS.map((f) => (
                  <button
                    key={f}
                    className={`option-btn ${fixation === f ? 'selected' : ''}`}
                    onClick={() => setFixation(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="result-count" style={{ marginTop: 10 }}>
                Cemented = radiolucent cement mantle around the component. Cementless =
                porous/HA surface in direct bone contact.
              </p>
            </div>
          )}

          <div className="identify-step">
            <h3>{showFixation ? '4' : '3'}. Describe distinguishing features</h3>
            <input
              type="search"
              placeholder="e.g. polished tapered cemented stem, modular sleeve, helical blade…"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              style={{ width: '100%' }}
            />
            <p className="result-count" style={{ marginTop: 10 }}>
              Candidates are ranked by how many of your terms match their known
              identifying features.
            </p>
          </div>

          <div className="controls" style={{ justifyContent: 'space-between' }}>
            <span className="result-count">
              {scored.length} candidate{scored.length === 1 ? '' : 's'}
            </span>
            <button className="reset-btn" onClick={reset}>
              Start over
            </button>
          </div>

          {scored.length === 0 ? (
            <p className="empty">No candidates for this region with the current filters.</p>
          ) : (
            <div className="grid">
              {scored.map(({ implant, score }) => (
                <ImplantCard key={implant.id} implant={implant} score={score} onSelect={onSelect} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
