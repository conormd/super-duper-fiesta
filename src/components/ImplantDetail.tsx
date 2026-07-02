import { useEffect, useState } from 'react';
import type { Implant, RadiographView } from '../types';

interface Props {
  implant: Implant;
  onClose: () => void;
  onEdit?: (implant: Implant) => void;
}

const VIEW_LABELS: Record<RadiographView, string> = {
  AP: 'AP (anteroposterior)',
  Lateral: 'Lateral (mediolateral)',
  Templating: 'Templating',
};

interface ZoomTarget {
  src: string;
  caption: string;
}

function ViewSlot({
  implant,
  view,
  onZoom,
}: {
  implant: Implant;
  view: RadiographView;
  onZoom: (target: ZoomTarget) => void;
}) {
  const image = implant.views?.find((v) => v.view === view);
  return (
    <figure className="view-slot">
      <span className="view-label">{VIEW_LABELS[view]}</span>
      {image ? (
        <>
          <button
            className="zoomable"
            onClick={() =>
              onZoom({
                src: image.src,
                caption: image.caption ?? `${implant.name} — ${VIEW_LABELS[view]}`,
              })
            }
            aria-label={`Enlarge ${implant.name} ${VIEW_LABELS[view]} image`}
          >
            <img src={image.src} alt={`${implant.name} — ${VIEW_LABELS[view]} radiograph`} />
          </button>
          <figcaption>
            {image.caption && <span>{image.caption}</span>}
            {(image.credit || image.license) && (
              <span className="credit">
                {image.sourceUrl ? (
                  <a href={image.sourceUrl} target="_blank" rel="noreferrer">
                    {image.credit ?? 'Source'}
                  </a>
                ) : (
                  image.credit
                )}
                {image.license && ` · ${image.license}`}
              </span>
            )}
          </figcaption>
        </>
      ) : (
        <div className="view-placeholder">No licensed {view} image yet</div>
      )}
    </figure>
  );
}

export function ImplantDetail({ implant, onClose, onEdit }: Props) {
  const [zoom, setZoom] = useState<ZoomTarget | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Escape dismisses the lightbox first, then the modal.
      setZoom((current) => {
        if (current) return null;
        onClose();
        return current;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        {onEdit && (
          <button className="edit-btn" onClick={() => onEdit(implant)}>
            ✎ Edit
          </button>
        )}
        <h2>{implant.name}</h2>
        <div className="badges">
          <span className="badge mfr">{implant.manufacturer}</span>
          <span className="badge">{implant.anatomy}</span>
          <span className="badge">{implant.category}</span>
          {implant.fixation !== 'N/A' && <span className="badge">{implant.fixation}</span>}
          {implant.source === 'user' && <span className="badge user">Added by you</span>}
        </div>
        <div className="meta-row">
          {implant.era && <span>Market period: {implant.era}</span>}
        </div>

        <section>
          <h4>Overview</h4>
          <p>{implant.summary}</p>
        </section>

        <section>
          <h4>Reference imaging</h4>
          <div className="views">
            <ViewSlot implant={implant} view="AP" onZoom={setZoom} />
            <ViewSlot implant={implant} view="Lateral" onZoom={setZoom} />
            <ViewSlot implant={implant} view="Templating" onZoom={setZoom} />
          </div>
          {implant.imageLinks && implant.imageLinks.length > 0 && (
            <p className="view-links">
              View images externally:{' '}
              {implant.imageLinks.map((link, i) => (
                <span key={link.url}>
                  {i > 0 && ' · '}
                  <a href={link.url} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                </span>
              ))}
            </p>
          )}
        </section>

        {implant.photos && implant.photos.length > 0 && (
          <section>
            <h4>Photos</h4>
            <div className="photo-grid">
              {implant.photos.map((p, i) => (
                <figure key={i} className="photo-item">
                  <button
                    className="zoomable"
                    onClick={() =>
                      setZoom({ src: p.src, caption: p.caption ?? `${implant.name} — photo` })
                    }
                    aria-label={`Enlarge ${implant.name} photo ${i + 1}`}
                  >
                    <img src={p.src} alt={p.caption ?? `${implant.name} photo ${i + 1}`} />
                  </button>
                  {(p.caption || p.credit) && (
                    <figcaption>
                      {p.caption}
                      {p.credit && <span className="credit"> {p.credit}</span>}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        <section>
          <h4>Radiographic identifying features</h4>
          <ul>
            {implant.identifyingFeatures.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </section>

        {implant.variants && implant.variants.length > 0 && (
          <section>
            <h4>Notable variants</h4>
            <ul>
              {implant.variants.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </section>
        )}

        {implant.notes && (
          <section>
            <p className="note">{implant.notes}</p>
          </section>
        )}

        {implant.references && implant.references.length > 0 && (
          <section>
            <h4>References (via PubMed)</h4>
            <ul>
              {implant.references.map((ref, i) => (
                <li key={i}>
                  {ref.doi ? (
                    <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noreferrer">
                      {ref.title}
                    </a>
                  ) : ref.pmid ? (
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {ref.title}
                    </a>
                  ) : (
                    ref.title
                  )}
                  {` — ${ref.source}`}
                  {ref.pmid && (
                    <>
                      {' ('}
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        PMID {ref.pmid}
                      </a>
                      {')'}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {zoom && (
          <div className="lightbox" onClick={() => setZoom(null)} role="dialog" aria-modal="true">
            <button className="lightbox-close" onClick={() => setZoom(null)} aria-label="Close">
              ✕
            </button>
            <img
              className="lightbox-img"
              src={zoom.src}
              alt={zoom.caption}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="lightbox-cap">{zoom.caption}</div>
          </div>
        )}
      </div>
    </div>
  );
}
