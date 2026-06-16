import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Implant } from './types';
import { implants as builtInImplants } from './data/implants';
import { loadUserImplants } from './lib/userImplants';
import { Disclaimer } from './components/Disclaimer';
import { BrowseView } from './components/BrowseView';
import { IdentifyView } from './components/IdentifyView';
import { AddImplantView } from './components/AddImplantView';
import { ImplantDetail } from './components/ImplantDetail';

type Tab = 'identify' | 'browse' | 'add';

export default function App() {
  const [tab, setTab] = useState<Tab>('identify');
  const [selected, setSelected] = useState<Implant | null>(null);
  const [userImplants, setUserImplants] = useState<Implant[]>([]);

  const refreshUser = useCallback(() => {
    loadUserImplants().then(setUserImplants).catch(() => setUserImplants([]));
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const allImplants = useMemo(
    () => [...builtInImplants, ...userImplants],
    [userImplants],
  );

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
          className={`tab ${tab === 'browse' ? 'active' : ''}`}
          onClick={() => setTab('browse')}
        >
          Browse catalogue
        </button>
        <button
          className={`tab ${tab === 'add' ? 'active' : ''}`}
          onClick={() => setTab('add')}
        >
          Add implant{userImplants.length > 0 ? ` (${userImplants.length})` : ''}
        </button>
      </nav>

      {tab === 'identify' && <IdentifyView implants={allImplants} onSelect={setSelected} />}
      {tab === 'browse' && <BrowseView implants={allImplants} onSelect={setSelected} />}
      {tab === 'add' && (
        <AddImplantView
          userImplants={userImplants}
          onChange={refreshUser}
          onSelect={setSelected}
        />
      )}

      {selected && <ImplantDetail implant={selected} onClose={() => setSelected(null)} />}

      <footer className="foot">
        OrthoID is an open educational reference. Implant data is compiled from
        publicly available manufacturer information and is non-exhaustive. Not
        affiliated with or endorsed by any manufacturer.
      </footer>
    </div>
  );
}
