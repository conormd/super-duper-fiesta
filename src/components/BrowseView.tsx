import { useMemo, useState } from 'react';
import type { Anatomy, Implant, Manufacturer } from '../types';
import { implants } from '../data/implants';
import { searchableText } from '../lib/search';
import { ImplantCard } from './ImplantCard';

const MANUFACTURERS: (Manufacturer | 'All')[] = [
  'All',
  'Zimmer Biomet',
  'Stryker',
  'Smith & Nephew',
  'Arthrex',
  'DePuy Synthes',
];

const ANATOMIES: (Anatomy | 'All')[] = [
  'All',
  'Hip',
  'Knee',
  'Shoulder',
  'Trauma / Fracture fixation',
  'Sports medicine / Soft tissue',
];

interface Props {
  onSelect: (implant: Implant) => void;
}

export function BrowseView({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [manufacturer, setManufacturer] = useState<Manufacturer | 'All'>('All');
  const [anatomy, setAnatomy] = useState<Anatomy | 'All'>('All');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return implants
      .filter((i) => manufacturer === 'All' || i.manufacturer === manufacturer)
      .filter((i) => anatomy === 'All' || i.anatomy === anatomy)
      .filter((i) => q === '' || searchableText(i).includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [query, manufacturer, anatomy]);

  return (
    <div>
      <div className="controls">
        <input
          type="search"
          placeholder="Search by name, feature, category…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value as Manufacturer | 'All')}>
          {MANUFACTURERS.map((m) => (
            <option key={m} value={m}>
              {m === 'All' ? 'All manufacturers' : m}
            </option>
          ))}
        </select>
        <select value={anatomy} onChange={(e) => setAnatomy(e.target.value as Anatomy | 'All')}>
          {ANATOMIES.map((a) => (
            <option key={a} value={a}>
              {a === 'All' ? 'All regions' : a}
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
            <ImplantCard key={i.id} implant={i} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
