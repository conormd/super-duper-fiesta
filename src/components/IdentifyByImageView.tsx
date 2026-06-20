import { useCallback, useEffect, useRef, useState } from 'react';
import type { Implant } from '../types';
import { isIndexReady, matchImage, type ImageMatch } from '../lib/imageMatch';
import { ImplantCard } from './ImplantCard';

interface Props {
  implants: Implant[];
  onSelect: (implant: Implant) => void;
}

type Status = 'checking' | 'no-index' | 'idle' | 'matching' | 'done' | 'error';

export function IdentifyByImageView({ implants, onSelect }: Props) {
  const [status, setStatus] = useState<Status>('checking');
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<ImageMatch[]>([]);
  const [error, setError] = useState<string>('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    isIndexReady().then((ready) => setStatus(ready ? 'idle' : 'no-index'));
  }, []);

  // Revoke the object URL when it changes or the view unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const byId = useCallback(
    (id: string) => implants.find((i) => i.id === id),
    [implants],
  );

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      setStatus('error');
      return;
    }
    setError('');
    setResults([]);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setStatus('matching');
    try {
      const matches = await matchImage(file, 5);
      setResults(matches);
      setStatus('done');
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  if (status === 'no-index') {
    return (
      <div className="identify-step">
        <h3>Identify by image</h3>
        <p className="empty">
          The reference image index hasn’t been built yet. Run{' '}
          <code>npm run build:embeddings</code> to generate{' '}
          <code>public/embeddings.json</code>, then reload.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="identify-step">
        <h3>Upload a radiograph to find visual matches</h3>
        <p className="result-count" style={{ marginTop: 0, marginBottom: 14 }}>
          Your image is compared on-device against the reference library and the
          closest implant families are ranked by visual similarity. This is a
          shortlist to speed up review — not an identification. Nothing is
          uploaded to a server at this step.
        </p>

        <button
          type="button"
          className={`upload-drop ${dragging ? 'dragging' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {preview ? (
            <img className="upload-preview" src={preview} alt="Uploaded radiograph" />
          ) : (
            <span>
              <strong>Choose an image</strong> or drag &amp; drop a radiograph here
            </span>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        {status === 'matching' && (
          <p className="result-count" style={{ marginTop: 14 }}>
            Analysing image… the matching model loads on first use and is then
            cached.
          </p>
        )}
        {status === 'error' && (
          <p className="empty" style={{ marginTop: 14 }}>
            {error}
          </p>
        )}
      </div>

      {status === 'done' && (
        <>
          <div className="controls">
            <span className="result-count">
              {results.length} closest match{results.length === 1 ? '' : 'es'}, most
              similar first
            </span>
          </div>
          {results.length === 0 ? (
            <p className="empty">No matches found in the reference library.</p>
          ) : (
            <div className="grid">
              {results.map((m) => {
                const implant = byId(m.implantId);
                if (!implant) return null;
                return (
                  <div key={m.implantId} className="match-cell">
                    <span className="sim-pill">
                      {Math.round(m.score * 100)}% visual similarity
                    </span>
                    <ImplantCard implant={implant} onSelect={onSelect} />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
