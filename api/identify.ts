/**
 * Phase 2 — Claude vision re-ranking. POST { image: { data, mediaType },
 * candidateIds: string[] } with the uploaded radiograph (base64) and the
 * Tier-1 shortlist. Candidate details are resolved server-side from the
 * implant dataset; Claude compares the image against each candidate's
 * documented identifying features and returns a re-ranked list with
 * plain-language reasoning. Educational aid only — never a diagnosis.
 *
 * Requires ANTHROPIC_API_KEY as a Vercel environment variable.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { implants } from '../src/data/implants';

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8';

const ALLOWED_MEDIA = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type AllowedMedia = (typeof ALLOWED_MEDIA)[number];

/** ~4 MB of base64 keeps us under Vercel's request body limit. */
const MAX_IMAGE_B64_CHARS = 4 * 1024 * 1024;

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    ranking: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          confidence: { type: 'string', enum: ['high', 'moderate', 'low'] },
          reasoning: { type: 'string' },
        },
        required: ['id', 'confidence', 'reasoning'],
        additionalProperties: false,
      },
    },
    note: { type: 'string' },
  },
  required: ['ranking', 'note'],
  additionalProperties: false,
} as const;

function candidateSummary(id: string): string | null {
  const i = implants.find((x) => x.id === id);
  if (!i) return null;
  const attrs = [
    `fixation: ${i.fixation}`,
    i.cementedStyle && `cemented style: ${i.cementedStyle}`,
    i.stemShape && `stem shape: ${i.stemShape}`,
    i.collar && `collar: ${i.collar}`,
  ]
    .filter(Boolean)
    .join('; ');
  return [
    `### ${i.id}`,
    `${i.name} — ${i.manufacturer} (${i.anatomy}, ${i.category})`,
    attrs,
    `Identifying features:`,
    ...i.identifyingFeatures.map((f) => `- ${f}`),
    i.notes ? `Caveat: ${i.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'AI comparison is not configured on this deployment.' });
  }

  const { image, candidateIds } = (req.body ?? {}) as {
    image?: { data?: string; mediaType?: string };
    candidateIds?: unknown;
  };

  if (!image?.data || typeof image.data !== 'string') {
    return res.status(400).json({ error: 'image.data (base64) is required' });
  }
  if (image.data.length > MAX_IMAGE_B64_CHARS) {
    return res.status(413).json({ error: 'Image too large — resize before uploading.' });
  }
  if (!ALLOWED_MEDIA.includes(image.mediaType as AllowedMedia)) {
    return res.status(400).json({ error: `image.mediaType must be one of ${ALLOWED_MEDIA.join(', ')}` });
  }
  if (
    !Array.isArray(candidateIds) ||
    candidateIds.length < 2 ||
    candidateIds.length > 8 ||
    !candidateIds.every((c): c is string => typeof c === 'string')
  ) {
    return res.status(400).json({ error: 'candidateIds must be 2–8 implant ids' });
  }

  const summaries = candidateIds.map(candidateSummary).filter((s): s is string => s !== null);
  if (summaries.length < 2) {
    return res.status(400).json({ error: 'candidateIds did not match known implants' });
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      system:
        'You are assisting with an educational reference tool (OrthoID) that helps ' +
        'clinicians narrow down which orthopaedic implant appears on a radiograph. ' +
        'You are given one radiograph and a shortlist of candidate implants with their ' +
        'documented radiographic identifying features. Compare what is actually visible ' +
        'in the image against each candidate. Rank ALL provided candidates from most to ' +
        'least consistent with the image. Ground every judgement in visible evidence ' +
        '(stem geometry, collar, coating pattern, cement mantle, modularity, component ' +
        'shape); if the image quality or view limits assessment, say so and lower your ' +
        'confidence. This is an educational aid: never present the result as a ' +
        'definitive identification, and put any overall caveat in `note`.',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: image.mediaType as AllowedMedia,
                data: image.data,
              },
            },
            {
              type: 'text',
              text:
                `Candidate implants (visual-similarity shortlist, unordered):\n\n` +
                summaries.join('\n\n') +
                `\n\nRank all candidates by consistency with the radiograph, with one to ` +
                `three sentences of image-grounded reasoning each.`,
            },
          ],
        },
      ],
      output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
    });

    if (response.stop_reason === 'refusal') {
      return res.status(502).json({ error: 'The model declined to analyse this image.' });
    }
    const text = response.content.find((b) => b.type === 'text')?.text;
    if (!text) {
      return res.status(502).json({ error: 'Empty model response.' });
    }
    const parsed = JSON.parse(text) as {
      ranking: { id: string; confidence: string; reasoning: string }[];
      note: string;
    };
    // Only return candidates we were actually asked about.
    const askedIds = new Set(candidateIds);
    parsed.ranking = parsed.ranking.filter((r) => askedIds.has(r.id));
    return res.status(200).json(parsed);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'AI comparison is busy — try again shortly.' });
    }
    if (error instanceof Anthropic.APIError) {
      console.error('Anthropic API error', error.status, error.message);
      return res.status(502).json({ error: 'AI comparison failed.' });
    }
    console.error('identify error', error);
    return res.status(500).json({ error: 'Unexpected error.' });
  }
}
