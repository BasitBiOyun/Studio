import type { AssetKind } from './db';

export const ASSET_KINDS: AssetKind[] = [
  'player-cutout',
  'club-logo',
  'competition-logo',
  'custom-image',
];

export const ASSET_KIND_LABELS: Record<AssetKind, string> = {
  'player-cutout': 'Player Cutout',
  'club-logo': 'Club Logo',
  'competition-logo': 'Competition / League Logo',
  'custom-image': 'Custom Image',
};

function fallbackHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export async function hashAssetData(value: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle || typeof TextEncoder === 'undefined') return fallbackHash(value);
  const bytes = new TextEncoder().encode(value);
  const digest = await subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
