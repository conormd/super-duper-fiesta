import { useMemo, useState } from 'react';
import { spineHardware } from '../data/spineHardware';

const UNKNOWN_MANUFACTURER = 'Manufacturer not listed';

export function SpineHardwareView() {
  const [query, setQuery] = useState('');
  const [manufacturer, setManufacturer] = useState('Any / unknown');

  const manufacturers = useMemo(() => {
    const names = new Set(spineHardware.map((s) => s.manufacturer || UNKNOWN_MANUFACTURER));
    return ['Any / unknown', ...[...names].sort((a, b) => a.localeCompare(b))];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return spineHardware
      .filter((s) => {
        const mfr = s.manufacturer || UNKNOWN_MANUFACTURER;
        if (manufacturer !== 'Any / unknown' && mfr !== manufacturer) return false;
        if (!q) return true;
        return s.model.toLowerCase().includes(q) || mfr.toLowerCase().includes(q);
      })
      .sort((a, b) => a.model.localeCompare(b.model));
  }, [query, manufacturer]);

  return (
    <div>
      <div className="identify-step">
        <h3>Spine hardware — reference index</h3>
        <p className="result-count" style={{ marginTop: 0, marginBottom: 14 }}>
          A name-and-manufacturer index of spine hardware, cross-referenced to{' '}
          <a href="https://implantidentifier.app/implant-library/spine" target="_blank" rel="noreferrer">
            ImplantIdentifier.app
          </a>
          . This is a separate, lighter-weight list from the main catalogue —
          no radiographs or identifying features are documented here yet;
          follow the link for each device to view its profile externally.
        </p>
        <div className="field-row">
          <input
            type="search"
            placeholder="Search by model or manufacturer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 2 }}
          />
          <select
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            style={{ flex: 1 }}
          >
            {manufacturers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="controls">
        <span className="result-count">
          {filtered.length} of {spineHardware.length} devices
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="empty">No matches for that search.</p>
      ) : (
        <div className="spine-list">
          {filtered.map((s) => (
            <a
              key={s.id}
              className="spine-row"
              href={s.profileUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span className="spine-model">{s.model}</span>
              <span className="spine-mfr">{s.manufacturer || UNKNOWN_MANUFACTURER}</span>
              <span className="spine-link">View profile ↗</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
