import { useMemo, useState } from 'react';
import type { Anatomy, Implant, Manufacturer } from '../types';
import { searchableText } from '../lib/search';
import { ImplantCard } from './ImplantCard';

const MANUFACTURERS: (Manufacturer | 'All')[] = [
  'All',
  'Zimmer Biomet',
  'Stryker',
  'Smith & Nephew',
  'DePuy Synthes',
];

const ANATOMIES: (Anatomy | 'All')[] = [
  'All',
  'Hip',
  'Knee',
  'Shoulder',
  'Ankle',
  'Elbow',
  'Trauma / Fracture fixation',
  'Sports medicine / Soft tissue',
];

const hasImage = (i: Implant) => !!i.views?.some((v) => v.src);

interface Props {
  implants: Implant[];
  onSelect: (implant: Implant) => void;
}

export function BrowseView({ implants, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [manufacturer, setManufacturer] = useState<Manufacturer | 'All'>('All');
  const [anatomy, setAnatomy] = useState<Anatomy | 'All'>('All');
  const [needsImageOnly, setNeedsImageOnly] = useState(false);

  const base = useMemo(() => {
    const q = query.trim().toLowerCase();
    return implants
      .filter((i) => manufacturer === 'All' || i.manufacturer === manufacturer)
      .filter((i) => anatomy === 'All' || i.anatomy === anatomy)
      .filter((i) => q === '' || searchableText(i).includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [implants, query, manufacturer, anatomy]);

  const missingCount = base.filter((i) => !hasImage(i)).length;
  const results = needsImageOnly ? base.filter((i) => !hasImage(i)) : base;

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
        <button
          type="button"
          className={`needs-img-toggle ${needsImageOnly ? 'active' : ''}`}
          onClick={() => setNeedsImageOnly((v) => !v)}
          aria-pressed={needsImageOnly}
          title="Show only implants still missing an image"
        >
          Needs image{missingCount > 0 ? ` (${missingCount})` : ''}
        </button>
      </div>

      <p className="result-count">
        {results.length} implant{results.length === 1 ? '' : 's'}
        {!needsImageOnly && missingCount > 0 && ` · ${missingCount} need an image`}
      </p>

      {results.length === 0 ? (
        <p className="empty">
          {needsImageOnly ? 'Every implant in this view has an image. 🎉' : 'No implants match these filters.'}
        </p>
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
