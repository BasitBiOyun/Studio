import { db, AssetKind, AssetLibraryRecord } from './db';
import { ASSET_KIND_LABELS, ASSET_KINDS, hashAssetData } from './assetLibraryModel';

export { ASSET_KIND_LABELS, ASSET_KINDS, hashAssetData } from './assetLibraryModel';

function normalizedName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').slice(0, 120) || 'Untitled Asset';
}

function inferMimeType(dataUrl: string, fallback = 'image/*'): string {
  const match = /^data:([^;,]+)[;,]/i.exec(dataUrl);
  return match?.[1] || fallback;
}

export async function listAssets(): Promise<AssetLibraryRecord[]> {
  return db.assets.orderBy('updatedAt').reverse().toArray();
}

export async function addAsset(input: {
  name: string;
  kind: AssetKind;
  dataUrl: string;
  mimeType?: string;
}): Promise<{ asset: AssetLibraryRecord; duplicate: boolean }> {
  const dataUrl = String(input.dataUrl || '').trim();
  if (!dataUrl.startsWith('data:image/')) throw new Error('Only image assets can be stored.');

  const hash = await hashAssetData(dataUrl);
  const duplicate = await db.assets.where('[kind+hash]').equals([input.kind, hash]).first();
  if (duplicate) return { asset: duplicate, duplicate: true };

  const now = Date.now();
  const asset: AssetLibraryRecord = {
    id: `asset-${now}-${Math.random().toString(36).slice(2, 10)}`,
    name: normalizedName(input.name),
    kind: input.kind,
    dataUrl,
    mimeType: input.mimeType || inferMimeType(dataUrl),
    hash,
    createdAt: now,
    updatedAt: now,
  };

  await db.assets.add(asset);
  return { asset, duplicate: false };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error('Could not read asset file.'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
}

export async function addFileAsset(
  file: File,
  kind: AssetKind,
  name = file.name.replace(/\.[^.]+$/, ''),
): Promise<{ asset: AssetLibraryRecord; duplicate: boolean }> {
  const dataUrl = await fileToDataUrl(file);
  return addAsset({ name, kind, dataUrl, mimeType: file.type || undefined });
}

export async function renameAsset(id: string, name: string): Promise<void> {
  await db.assets.update(id, { name: normalizedName(name), updatedAt: Date.now() });
}

export async function removeAsset(id: string): Promise<void> {
  await db.assets.delete(id);
}
