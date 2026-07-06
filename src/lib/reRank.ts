/**
 * Phase 2 client — sends the uploaded radiograph plus the Tier-1 shortlist to
 * the serverless /api/identify endpoint, where Claude vision re-ranks the
 * candidates with image-grounded reasoning. Unlike Tier 1, this DOES transmit
 * the image off-device; the UI says so before the user opts in. Every failure
 * mode resolves to a thrown Error the caller can surface while keeping the
 * Tier-1 results on screen.
 */

export interface AiRankEntry {
  id: string;
  confidence: 'high' | 'moderate' | 'low';
  reasoning: string;
}

export interface AiRanking {
  ranking: AiRankEntry[];
  note: string;
}

const MAX_DIM = 1280;
const TIMEOUT_MS = 90_000;

/** Downscale to ≤1280px JPEG and return raw base64 (no data-URL prefix). */
async function toJpegBase64(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable in this browser.');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}

/** Ask Claude (via the serverless function) to re-rank the shortlist. */
export async function aiCompare(file: File, candidateIds: string[]): Promise<AiRanking> {
  const data = await toJpegBase64(file);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('/api/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        image: { data, mediaType: 'image/jpeg' },
        candidateIds,
      }),
    });
    if (!res.ok) {
      let message = `AI comparison unavailable (${res.status}).`;
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) message = body.error;
      } catch {
        // non-JSON error body — keep the status message
      }
      throw new Error(message);
    }
    return (await res.json()) as AiRanking;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('AI comparison timed out — showing similarity results only.');
    }
    throw err instanceof Error ? err : new Error('AI comparison failed.');
  } finally {
    clearTimeout(timer);
  }
}
