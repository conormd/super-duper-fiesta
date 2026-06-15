import type { Implant } from '../types';

/** Combined searchable text for an implant, lower-cased. */
export function searchableText(i: Implant): string {
  return [
    i.name,
    i.manufacturer,
    i.anatomy,
    i.category,
    i.summary,
    ...(i.variants ?? []),
    ...i.identifyingFeatures,
    i.notes ?? '',
  ]
    .join(' ')
    .toLowerCase();
}

/** Split a free-text query into meaningful tokens. */
export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3);
}

/**
 * Count how many distinct query tokens appear in the implant's searchable text.
 * Used to rank candidates in the guided identification flow.
 */
export function featureScore(implant: Implant, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const text = searchableText(implant);
  return tokens.filter((t) => text.includes(t)).length;
}
