import { useMemo, useState } from 'react';
import type {
  Manufacturer,
  ProcedureType,
  SurvivorshipFixation,
  SurvivorshipImplant,
} from '../types';
import { survivorshipImplants } from '../data/survivorship';

const PROCEDURES: (ProcedureType | 'All')[] = [
  'All',
  'Total hip',
  'Total knee',
  'Partial knee',
];

const MANUFACTURERS: (Manufacturer | 'All')[] = [
  'All',
  'Zimmer Biomet',
  'Stryker',
  'Smith & Nephew',
  'DePuy Synthes',
];

const FIXATIONS: (SurvivorshipFixation | 'All')[] = [
  'All',
  'Cemented',
  'Cementless',
  'Hybrid',
];

function searchText(i: SurvivorshipImplant): string {
  return [i.name, i.manufacturer, i.component, i.descriptor, i.notes ?? '']
    .join(' ')
    .toLowerCase();
}

function SurvivorshipCard({ implant }: { implant: SurvivorshipImplant }) {
  const verified = implant.figures.filter((f) => f.verified);
  return (
    <div className="card sv-card">
      <h3>{implant.name}</h3>
      <div className="badges">
        <span className="badge mfr">{implant.manufacturer}</span>
        <span className="badge">{implant.component}</span>
        {implant.fixation.map((f) => (
          <span key={f} className={`badge fix fix-${f.toLowerCase()}`}>
            {f}
          </span>
        ))}
      </div>
      <p className="summary">{implant.descriptor}</p>

      <div className="sv-figures">
        <span className="view-label">Published survivorship</span>
        {verified.length > 0 ? (
          <ul className="sv-figure-list">
            {verified.map((f, idx) => (
              <li key={idx}>
                <strong>
                  {f.value}%
                  {f.ci95 && (
                    <span className="sv-ci">
                      {' '}
                      (95% CI {f.ci95[0]}–{f.ci95[1]})
                    </span>
                  )}
                </strong>{' '}
                {f.metric} at {f.followUpYears} yr
                {f.fixation && ` · ${f.fixation}`}
                <br />
                <a href={f.sourceUrl} target="_blank" rel="noreferrer">
                  {f.registry} — {f.source} ↗
                </a>
                {f.note && <span className="sv-note"> · {f.note}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="sv-pending">
            Read the current cumulative percent revision (CPR) for this implant
            directly in the registry report:
          </p>
        )}
        <div className="sv-links">
          {implant.registryLinks.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>

      {implant.literature && implant.literature.length > 0 && (
        <div className="sv-lit">
          <span className="view-label">Supporting literature (via PubMed)</span>
          <ul className="sv-figure-list">
            {implant.literature.map((ref, i) => (
              <li key={i}>
                {ref.doi ? (
                  <a
                    href={`https://doi.org/${ref.doi}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {ref.title}
                  </a>
                ) : (
                  ref.title
                )}
                {` — ${ref.source}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {implant.notes && <p className="note">{implant.notes}</p>}
    </div>
  );
}

export function SurvivorshipView() {
  const [query, setQuery] = useState('');
  const [procedure, setProcedure] = useState<ProcedureType | 'All'>('All');
  const [manufacturer, setManufacturer] = useState<Manufacturer | 'All'>('All');
  const [fixation, setFixation] = useState<SurvivorshipFixation | 'All'>('All');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return survivorshipImplants
      .filter((i) => procedure === 'All' || i.procedure === procedure)
      .filter((i) => manufacturer === 'All' || i.manufacturer === manufacturer)
      .filter((i) => fixation === 'All' || i.fixation.includes(fixation))
      .filter((i) => q === '' || searchText(i).includes(q));
  }, [query, procedure, manufacturer, fixation]);

  return (
    <div>
      <div className="disclaimer" role="note">
        <strong>How to read this.</strong> This is a quick index of published
        registry survivorship for commonly used hip and knee implants from
        Zimmer Biomet, Stryker, Smith &amp; Nephew, and DePuy Synthes. Embedded
        cumulative-percent-revision (CPR) figures are from the{' '}
        <strong>AOANJRR</strong>; each card also links to other publicly
        available registries — <strong>NJR</strong> (UK), <strong>NZJR</strong>{' '}
        (NZ), the Norwegian register, and <strong>ODEP</strong> implant ratings
        — so you can cross-check at source. Numeric values are shown inline only
        where they have been verified against the cited source — never
        estimated. Metrics differ between registries (e.g. CPR vs revisions per
        100 component-years), so confirm the registry, report, and the specific
        bearing/fixation cohort before any clinical use.
      </div>

      <div className="controls">
        <input
          type="search"
          placeholder="Search by implant, manufacturer, feature…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={procedure}
          onChange={(e) => setProcedure(e.target.value as ProcedureType | 'All')}
        >
          {PROCEDURES.map((p) => (
            <option key={p} value={p}>
              {p === 'All' ? 'All procedures' : p}
            </option>
          ))}
        </select>
        <select
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value as Manufacturer | 'All')}
        >
          {MANUFACTURERS.map((m) => (
            <option key={m} value={m}>
              {m === 'All' ? 'All manufacturers' : m}
            </option>
          ))}
        </select>
        <select
          value={fixation}
          onChange={(e) =>
            setFixation(e.target.value as SurvivorshipFixation | 'All')
          }
        >
          {FIXATIONS.map((f) => (
            <option key={f} value={f}>
              {f === 'All' ? 'All fixation' : f}
            </option>
          ))}
        </select>
      </div>

      <p className="result-count">
        {results.length} implant{results.length === 1 ? '' : 's'}
      </p>

      {results.length === 0 ? (
        <p className="empty">No implants match these filters.</p>
      ) : (
        <div className="grid">
          {results.map((i) => (
            <SurvivorshipCard key={i.id} implant={i} />
          ))}
        </div>
      )}
    </div>
  );
}
