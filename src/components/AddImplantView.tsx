import { useState } from 'react';
import type { Anatomy, Fixation, Implant, Manufacturer, ProductPhoto } from '../types';
import {
  deleteUserImplant,
  exportUserImplants,
  fileToDataUrl,
  putUserImplant,
} from '../lib/userImplants';
import { ImplantCard } from './ImplantCard';

const MANUFACTURERS: Manufacturer[] = [
  'Zimmer Biomet',
  'Stryker',
  'Smith & Nephew',
  'Arthrex',
  'DePuy Synthes',
];

const ANATOMIES: Anatomy[] = [
  'Hip',
  'Knee',
  'Shoulder',
  'Trauma / Fracture fixation',
  'Sports medicine / Soft tissue',
];

const FIXATIONS: Fixation[] = ['Cementless', 'Cemented', 'Hybrid', 'Either', 'N/A'];

interface Props {
  userImplants: Implant[];
  onChange: () => void;
  onSelect: (implant: Implant) => void;
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function AddImplantView({ userImplants, onChange, onSelect }: Props) {
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState<Manufacturer>('Zimmer Biomet');
  const [anatomy, setAnatomy] = useState<Anatomy>('Hip');
  const [category, setCategory] = useState('');
  const [fixation, setFixation] = useState<Fixation>('Cementless');
  const [summary, setSummary] = useState('');
  const [features, setFeatures] = useState('');
  const [variants, setVariants] = useState('');
  const [era, setEra] = useState('');
  const [notes, setNotes] = useState('');
  const [credit, setCredit] = useState('');

  const [apImage, setApImage] = useState<string | null>(null);
  const [latImage, setLatImage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const [saved, setSaved] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setCategory('');
    setSummary('');
    setFeatures('');
    setVariants('');
    setEra('');
    setNotes('');
    setCredit('');
    setApImage(null);
    setLatImage(null);
    setPhotos([]);
  };

  const onSingleFile =
    (setter: (v: string | null) => void) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setter(file ? await fileToDataUrl(file) : null);
    };

  const onMultiFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const urls = await Promise.all(files.map(fileToDataUrl));
    setPhotos((prev) => [...prev, ...urls]);
  };

  const canSave = name.trim() !== '' && category.trim() !== '' && summary.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    const views = [
      apImage && { view: 'AP' as const, src: apImage, credit: credit || undefined },
      latImage && { view: 'Lateral' as const, src: latImage, credit: credit || undefined },
    ].filter(Boolean) as Implant['views'];

    const productPhotos: ProductPhoto[] = photos.map((src) => ({
      src,
      credit: credit || undefined,
    }));

    const implant: Implant = {
      id: `user-${slug(manufacturer)}-${slug(name)}-${Date.now()}`,
      name: name.trim(),
      manufacturer,
      anatomy,
      category: category.trim(),
      fixation,
      summary: summary.trim(),
      identifyingFeatures: features
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
      variants: variants
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      era: era.trim() || undefined,
      notes: notes.trim() || undefined,
      views: views && views.length ? views : undefined,
      photos: productPhotos.length ? productPhotos : undefined,
      source: 'user',
    };
    if (!implant.variants?.length) delete implant.variants;

    await putUserImplant(implant);
    setSaved(implant.name);
    reset();
    onChange();
    window.setTimeout(() => setSaved(null), 4000);
  };

  const handleDelete = async (id: string) => {
    await deleteUserImplant(id);
    onChange();
  };

  return (
    <div>
      <p className="add-intro">
        Add your own implants and photos. Everything you add is stored only in
        this browser (on this device) — nothing is uploaded. Use{' '}
        <strong>Export</strong> to back up your entries or to share them so they
        can be added to the shared catalogue.
      </p>
      <p className="phi-warning">
        ⚠️ Only upload images you have the right to use, and make sure any
        clinical images are de-identified (no patient information in the image).
      </p>

      <form className="add-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Avenir" />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Manufacturer *</label>
            <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value as Manufacturer)}>
              {MANUFACTURERS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Region *</label>
            <select value={anatomy} onChange={(e) => setAnatomy(e.target.value as Anatomy)}>
              {ANATOMIES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Fixation</label>
            <select value={fixation} onChange={(e) => setFixation(e.target.value as Fixation)}>
              {FIXATIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Category *</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Cementless femoral stem"
          />
        </div>

        <div className="field">
          <label>Summary *</label>
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="One-line description shown on the card"
          />
        </div>

        <div className="field">
          <label>Identifying features (one per line)</label>
          <textarea
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            rows={3}
            placeholder={'Flat wedge taper\nProximal porous coating'}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Variants (comma-separated)</label>
            <input value={variants} onChange={(e) => setVariants(e.target.value)} placeholder="Standard, High-offset" />
          </div>
          <div className="field">
            <label>Market period</label>
            <input value={era} onChange={(e) => setEra(e.target.value)} placeholder="2010s–present" />
          </div>
        </div>

        <div className="field">
          <label>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>

        <fieldset className="image-fields">
          <legend>Images</legend>
          <div className="field-row">
            <div className="field">
              <label>AP radiograph</label>
              <input type="file" accept="image/*" onChange={onSingleFile(setApImage)} />
              {apImage && <img className="thumb" src={apImage} alt="AP preview" />}
            </div>
            <div className="field">
              <label>Lateral radiograph</label>
              <input type="file" accept="image/*" onChange={onSingleFile(setLatImage)} />
              {latImage && <img className="thumb" src={latImage} alt="Lateral preview" />}
            </div>
          </div>
          <div className="field">
            <label>Product photos (you can add several)</label>
            <input type="file" accept="image/*" multiple onChange={onMultiFile} />
            {photos.length > 0 && (
              <div className="thumb-row">
                {photos.map((p, i) => (
                  <span key={i} className="thumb-wrap">
                    <img className="thumb" src={p} alt={`Photo ${i + 1}`} />
                    <button
                      type="button"
                      className="thumb-remove"
                      onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                      aria-label="Remove photo"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="field">
            <label>Image credit / source (applied to all images)</label>
            <input value={credit} onChange={(e) => setCredit(e.target.value)} placeholder="e.g. Own photo, Dept. of Radiology" />
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="primary-btn" disabled={!canSave}>
            Save implant
          </button>
          {saved && <span className="saved-msg">Saved “{saved}” ✓</span>}
        </div>
      </form>

      <div className="user-list-header">
        <h3>Your added implants ({userImplants.length})</h3>
        {userImplants.length > 0 && (
          <button className="reset-btn" onClick={() => exportUserImplants(userImplants)}>
            Export all (JSON)
          </button>
        )}
      </div>

      {userImplants.length === 0 ? (
        <p className="empty">Nothing added yet. Fill in the form above to add your first implant.</p>
      ) : (
        <div className="grid">
          {userImplants.map((i) => (
            <div key={i.id} className="user-card-wrap">
              <ImplantCard implant={i} onSelect={onSelect} />
              <button className="delete-btn" onClick={() => handleDelete(i.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
