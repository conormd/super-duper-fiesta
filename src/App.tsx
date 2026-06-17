import { useState } from 'react';
import type { Implant } from './types';
import { Disclaimer } from './components/Disclaimer';
import { BrowseView } from './components/BrowseView';
import { IdentifyView } from './components/IdentifyView';
import { ImplantDetail } from './components/ImplantDetail';
import { SurvivorshipView } from './components/SurvivorshipView';

type Tab = 'identify' | 'browse' | 'survivorship';

export default function App() {
  const [tab, setTab] = useState<Tab>('identify');
  const [selected, setSelected] = useState<Implant | null>(null);

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
          className={`tab ${tab === 'survivorship' ? 'active' : ''}`}
          onClick={() => setTab('survivorship')}
        >
          Survivorship data
        </button>
      </nav>

      {tab === 'identify' && <IdentifyView onSelect={setSelected} />}
      {tab === 'browse' && <BrowseView onSelect={setSelected} />}
      {tab === 'survivorship' && <SurvivorshipView />}

      {selected && <ImplantDetail implant={selected} onClose={() => setSelected(null)} />}

      <footer className="foot">
        OrthoID is an open educational reference. Implant data is compiled from
        publicly available manufacturer information and is non-exhaustive. Not
        affiliated with or endorsed by any manufacturer.
      </footer>
    </div>
  );
}
