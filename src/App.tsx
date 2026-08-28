import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Implant } from './types';
import { implants as builtInImplants } from './data/implants';
import { loadUserImplants } from './lib/userImplants';
import { Disclaimer } from './components/Disclaimer';
import { BrowseView } from './components/BrowseView';
import { IdentifyView } from './components/IdentifyView';
import { IdentifyByImageView } from './components/IdentifyByImageView';
import { AddImplantView } from './components/AddImplantView';
import { SpineHardwareView } from './components/SpineHardwareView';
import { ImplantDetail } from './components/ImplantDetail';

type Tab = 'identify' | 'image' | 'browse' | 'add' | 'spine';

/** Merge user entries over the built-in set; a user entry with the same id
 *  replaces (overrides) the built-in one, keeping its position. */
function mergeById(base: Implant[], overrides: Implant[]): Implant[] {
  const map = new Map(base.map((i) => [i.id, i]));
  for (const o of overrides) map.set(o.id, o);
  return [...map.values()];
}

export default function App() {
  const [tab, setTab] = useState<Tab>('identify');
  const [selected, setSelected] = useState<Implant | null>(null);
  const [userImplants, setUserImplants] = useState<Implant[]>([]);
  const [editTarget, setEditTarget] = useState<Implant | null>(null);

  const refreshUser = useCallback(() => {
    loadUserImplants().then(setUserImplants).catch(() => setUserImplants([]));
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const allImplants = useMemo(
    () => mergeById(builtInImplants, userImplants),
    [userImplants],
  );

  const handleEdit = (implant: Implant) => {
    setEditTarget(implant);
    setSelected(null);
    setTab('add');
  };

  return (
    <div className="app">
      <header className="masthead">
        <h1>OrthoID</h1>
        <p className="tagline">
          Radiographic identification aid for orthopaedic implants — Zimmer Biomet,
          Stryker, Smith &amp; Nephew, Arthrex, and DePuy Synthes.
        </p>
      </header>

      <Disclaimer />

      <nav className="tabs">
        <button
          className={`tab ${tab === 'identify' ? 'active' : ''}`}
          onClick={() => setTab('identify')}
        >
          Guided identification
        </button>
        <button
          className={`tab ${tab === 'image' ? 'active' : ''}`}
          onClick={() => setTab('image')}
        >
          Identify by image
        </button>
        <button
          className={`tab ${tab === 'browse' ? 'active' : ''}`}
          onClick={() => setTab('browse')}
        >
          Browse catalogue
        </button>
        <button
          className={`tab ${tab === 'add' ? 'active' : ''}`}
          onClick={() => setTab('add')}
        >
          Add / edit{userImplants.length > 0 ? ` (${userImplants.length})` : ''}
        </button>
        <button
          className={`tab ${tab === 'spine' ? 'active' : ''}`}
          onClick={() => setTab('spine')}
        >
          Spine hardware
        </button>
      </nav>

      {tab === 'identify' && <IdentifyView implants={allImplants} onSelect={setSelected} />}
      {tab === 'image' && <IdentifyByImageView implants={allImplants} onSelect={setSelected} />}
      {tab === 'browse' && <BrowseView implants={allImplants} onSelect={setSelected} />}
      {tab === 'add' && (
        <AddImplantView
          userImplants={userImplants}
          onChange={refreshUser}
          onSelect={setSelected}
          editTarget={editTarget}
          onEditConsumed={() => setEditTarget(null)}
        />
      )}
      {tab === 'spine' && <SpineHardwareView />}

      {selected && (
        <ImplantDetail
          implant={selected}
          onClose={() => setSelected(null)}
          onEdit={handleEdit}
        />
      )}

      <footer className="foot">
        OrthoID is an open educational reference. Implant data is compiled from
        publicly available manufacturer information and is non-exhaustive. Not
        affiliated with or endorsed by any manufacturer.
      </footer>
    </div>
  );
}
