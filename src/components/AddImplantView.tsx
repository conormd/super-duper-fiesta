import { useEffect, useState } from 'react';
import type { Anatomy, Fixation, Implant, Manufacturer, ProductPhoto } from '../types';
import { implants as builtInImplants } from '../data/implants';
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
  'DePuy Synthes',
];

const ANATOMIES: Anatomy[] = [
  'Hip',
  'Knee',
  'Shoulder',
  'Ankle',
  'Elbow',
  'Trauma / Fracture fixation',
  'Sports medicine / Soft tissue',
];

const FIXATIONS: Fixation[] = ['Cementless', 'Cemented', 'Hybrid', 'Either', 'N/A'];

const BUILTIN_IDS = new Set(builtInImplants.map((i) => i.id));

interface Props {
  userImplants: Implant[];
  onChange: () => void;
  onSelect: (implant: Implant) => void;
  editTarget: Implant | null;
  onEditConsumed: () => void;
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function AddImplantView({ userImplants, onChange, onSelect, editTarget, onEditConsumed }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
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
  const [tmplImage, setTmplImage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const [saved, setSaved] = useState<string | null>(null);

  const clearForm = () => {
    setEditingId(null);
    setEditingName('');
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
    setTmplImage(null);
    setPhotos([]);
  };

  const loadImplant = (impl: Implant) => {
    setEditingId(impl.id);
    setEditingName(impl.name);
    setName(impl.name);
    setManufacturer(impl.manufacturer);
    setAnatomy(impl.anatomy);
    setCategory(impl.category);
    setFixation(impl.fixation);
    setSummary(impl.summary);
    setFeatures(impl.identifyingFeatures.join('\n'));
    setVariants((impl.variants ?? []).join(', '));
    setEra(impl.era ?? '');
    setNotes(impl.notes ?? '');
    setApImage(impl.views?.find((v) => v.view === 'AP')?.src ?? null);
    setLatImage(impl.views?.find((v) => v.view === 'Lateral')?.src ?? null);
    setTmplImage(impl.views?.find((v) => v.view === 'Templating')?.src ?? null);
    setPhotos((impl.photos ?? []).map((p) => p.src));
    setCredit(impl.views?.[0]?.credit ?? impl.photos?.[0]?.credit ?? '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When an entry is sent in for editing (from a card or detail view), load it.
  useEffect(() => {
    if (editTarget) {
      loadImplant(editTarget);
      onEditConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTarget]);

  const onSingleFile =
    (setter: (v: string | null) => void) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setter(await fileToDataUrl(file));
      e.target.value = '';
    };

  const onMultiFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const urls = await Promise.all(files.map(fileToDataUrl));
    setPhotos((prev) => [...prev, ...urls]);
    e.target.value = '';
  };

  const canSave = name.trim() !== '' && category.trim() !== '' && summary.trim() !== '';
  const isEditing = editingId !== null;
  const isOverride = editingId !== null && BUILTIN_IDS.has(editingId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    const views = [
      apImage && { view: 'AP' as const, src: apImage, credit: credit || undefined },
      latImage && { view: 'Lateral' as const, src: latImage, credit: credit || undefined },
      tmplImage && { view: 'Templating' as const, src: tmplImage, credit: credit || undefined },
    ].filter(Boolean) as Implant['views'];

    const productPhotos: ProductPhoto[] = photos.map((src) => ({
      src,
      credit: credit || undefined,
    }));

    const implant: Implant = {
      id: editingId ?? `user-${slug(manufacturer)}-${slug(name)}-${Date.now()}`,
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
    clearForm();
    onChange();
    window.setTimeout(() => setSaved(null), 4000);
  };

  const handleDelete = async (id: string) => {
    await deleteUserImplant(id);
    if (editingId === id) clearForm();
    onChange();
  };

  return (
    <div>
      <p className="add-intro">
        Add your own implants and photos, or edit any entry — including the
        built-in ones. Everything you add or change is stored only in this
        browser (on this device); nothing is uploaded. Use <strong>Export</strong>{' '}
        to back up your changes or share them so they can be added to the shared
        catalogue.
      </p>
      <p className="phi-warning">
        ⚠️ Only upload images you have the right to use, and make sure any
        clinical images are de-identified (no patient information in the image).
      </p>

      {isEditing && (
        <div className="editing-banner">
          <span>
            {isOverride ? 'Editing built-in entry: ' : 'Editing: '}
            <strong>{editingName}</strong>
            {isOverride && ' (your changes will override the built-in version on this device)'}
          </span>
          <button type="button" className="reset-btn" onClick={clearForm}>
            Cancel edit
          </button>
        </div>
      )}

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
              {apImage && (
                <span className="thumb-wrap">
                  <img className="thumb" src={apImage} alt="AP preview" />
                  <button type="button" className="thumb-remove" onClick={() => setApImage(null)} aria-label="Remove AP image">✕</button>
                </span>
              )}
            </div>
            <div className="field">
              <label>Lateral radiograph</label>
              <input type="file" accept="image/*" onChange={onSingleFile(setLatImage)} />
              {latImage && (
                <span className="thumb-wrap">
                  <img className="thumb" src={latImage} alt="Lateral preview" />
                  <button type="button" className="thumb-remove" onClick={() => setLatImage(null)} aria-label="Remove lateral image">✕</button>
                </span>
              )}
            </div>
            <div className="field">
              <label>Templating image</label>
              <input type="file" accept="image/*" onChange={onSingleFile(setTmplImage)} />
              {tmplImage && (
                <span className="thumb-wrap">
                  <img className="thumb" src={tmplImage} alt="Templating preview" />
                  <button type="button" className="thumb-remove" onClick={() => setTmplImage(null)} aria-label="Remove templating image">✕</button>
                </span>
              )}
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
            {isEditing ? 'Update implant' : 'Save implant'}
          </button>
          {isEditing && (
            <button type="button" className="reset-btn" onClick={clearForm}>
              Cancel
            </button>
          )}
          {saved && <span className="saved-msg">Saved “{saved}” ✓</span>}
        </div>
      </form>

      <div className="user-list-header">
        <h3>Your added &amp; edited entries ({userImplants.length})</h3>
        {userImplants.length > 0 && (
          <button className="reset-btn" onClick={() => exportUserImplants(userImplants)}>
            Export all (JSON)
          </button>
        )}
      </div>

      {userImplants.length === 0 ? (
        <p className="empty">
          Nothing added or edited yet. Fill in the form above to add an implant,
          or open any implant and choose “Edit” to customise it.
        </p>
      ) : (
        <div className="grid">
          {userImplants.map((i) => {
            const override = BUILTIN_IDS.has(i.id);
            return (
              <div key={i.id} className="user-card-wrap">
                <ImplantCard implant={i} onSelect={onSelect} />
                <div className="card-actions">
                  <button className="reset-btn" onClick={() => loadImplant(i)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(i.id)}>
                    {override ? 'Reset to built-in' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
