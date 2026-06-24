import { useMemo, useState } from 'react';
import type { Anatomy, Fixation, Implant, Manufacturer } from '../types';
import { featureScore, tokenize } from '../lib/search';
import { ImplantCard } from './ImplantCard';

const ANATOMIES: Anatomy[] = [
  'Hip',
  'Knee',
  'Shoulder',
  'Ankle',
  'Elbow',
  'Trauma / Fracture fixation',
  'Sports medicine / Soft tissue',
];

const MANUFACTURERS: (Manufacturer | 'Any / unknown')[] = [
  'Any / unknown',
  'Zimmer Biomet',
  'Stryker',
  'Smith & Nephew',
  'DePuy Synthes',
];

const FIXATIONS: (Fixation | 'Any / unknown')[] = ['Any / unknown', 'Cemented', 'Cementless'];

/** Checkbox facets for hip femoral stems. Each maps to an optional Implant
 *  field; tick what you can see and the list narrows to stems whose KNOWN
 *  value matches (stems with no value for that facet are not excluded). */
const HIP_FACETS: { field: keyof Implant; label: string; hint?: string; options: string[] }[] = [
  {
    field: 'fixation',
    label: 'Fixation',
    options: ['Cemented', 'Cementless'],
  },
  {
    field: 'cementedStyle',
    label: 'Cemented stem style',
    hint: 'Only relevant for cemented stems.',
    options: ['Taper-slip', 'Composite beam', 'French paradox'],
  },
  {
    field: 'stemShape',
    label: 'Cementless stem shape',
    hint: 'Only relevant for cementless / press-fit stems.',
    options: ['Flat tapered wedge', 'Fit-and-fill', 'Quadrangular', 'Triple taper'],
  },
  {
    field: 'stemLength',
    label: 'Stem length',
    options: ['Standard', 'Microplasty'],
  },
  {
    field: 'collar',
    label: 'Collar',
    options: ['Collared', 'Collarless'],
  },
];

interface Props {
  implants: Implant[];
  onSelect: (implant: Implant) => void;
}

export function IdentifyView({ implants, onSelect }: Props) {
  const [anatomy, setAnatomy] = useState<Anatomy | null>(null);
  const [manufacturer, setManufacturer] = useState<Manufacturer | 'Any / unknown'>('Any / unknown');
  const [fixation, setFixation] = useState<Fixation | 'Any / unknown'>('Any / unknown');
  const [facets, setFacets] = useState<Record<string, string[]>>({});
  const [features, setFeatures] = useState('');

  const isHip = anatomy === 'Hip';
  const showFixation = anatomy === 'Knee'; // Hip uses the richer facet checkboxes below

  const toggleFacet = (field: string, value: string) => {
    setFacets((prev) => {
      const current = prev[field] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  /** An implant matches a facet if it has no known value (unknown = keep) or
   *  its value is among the ticked ones. 'Either' fixation matches both. */
  const matchesFacet = (implant: Implant, field: keyof Implant, selected: string[]): boolean => {
    if (selected.length === 0) return true;
    const value = implant[field] as string | undefined;
    if (value === undefined) return true;
    if (field === 'fixation' && value === 'Either') return true;
    return selected.includes(value);
  };

  const scored = useMemo(() => {
    if (!anatomy) return [];
    const tokens = tokenize(features);
    return implants
      .filter((i) => i.anatomy === anatomy)
      .filter((i) => manufacturer === 'Any / unknown' || i.manufacturer === manufacturer)
      .filter((i) => {
        if (isHip) {
          return HIP_FACETS.every((f) => matchesFacet(i, f.field, facets[f.field as string] ?? []));
        }
        if (!showFixation || fixation === 'Any / unknown') return true;
        return i.fixation === fixation || i.fixation === 'Either';
      })
      .map((i) => ({ implant: i, score: featureScore(i, tokens) }))
      .sort((a, b) => b.score - a.score || a.implant.name.localeCompare(b.implant.name));
  }, [implants, anatomy, manufacturer, fixation, facets, features, isHip, showFixation]);

  const activeFacetCount = Object.values(facets).reduce((n, v) => n + v.length, 0);

  const reset = () => {
    setAnatomy(null);
    setManufacturer('Any / unknown');
    setFixation('Any / unknown');
    setFacets({});
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

          {isHip && (
            <div className="identify-step">
              <h3>3. Stem features you can see</h3>
              <p className="result-count" style={{ marginTop: 0, marginBottom: 14 }}>
                Tick only what you can tell for certain — each box narrows the list,
                and stems where a feature isn’t recorded are kept in.
              </p>
              {HIP_FACETS.map((f) => (
                <div key={f.field as string} className="facet-group">
                  <span className="facet-label">{f.label}</span>
                  <div className="option-row">
                    {f.options.map((opt) => {
                      const on = (facets[f.field as string] ?? []).includes(opt);
                      return (
                        <button
                          key={opt}
                          className={`option-btn chip ${on ? 'selected' : ''}`}
                          aria-pressed={on}
                          onClick={() => toggleFacet(f.field as string, opt)}
                        >
                          {on ? '✓ ' : ''}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {f.hint && (
                    <p className="result-count" style={{ margin: '6px 0 0' }}>
                      {f.hint}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

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
            <h3>{isHip || showFixation ? '4' : '3'}. Describe distinguishing features</h3>
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
              {activeFacetCount > 0 ? ` · ${activeFacetCount} feature${activeFacetCount === 1 ? '' : 's'} ticked` : ''}
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
