import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  IconCheck,
  IconPhoto,
  IconPencil,
  IconSearch,
  IconTrash,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { Project } from '../types';
import type { AssetKind, AssetLibraryRecord } from '../services/db';
import {
  ASSET_KIND_LABELS,
  ASSET_KINDS,
  addFileAsset,
  listAssets,
  removeAsset,
  renameAsset,
} from '../services/assetLibrary';
import {
  AssetTargetKey,
  applyAssetToProject,
  getAssetTargets,
} from '../services/assetTargets';

interface AssetLibraryModalProps {
  open: boolean;
  project: Project;
  onChange: (project: Project) => void;
  onClose: () => void;
  isTr?: boolean;
}

export const AssetLibraryModal: React.FC<AssetLibraryModalProps> = ({
  open,
  project,
  onChange,
  onClose,
  isTr = false,
}) => {
  const [assets, setAssets] = useState<AssetLibraryRecord[]>([]);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | AssetKind>('all');
  const [uploadKind, setUploadKind] = useState<AssetKind>('player-cutout');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [targetSelections, setTargetSelections] = useState<Record<string, AssetTargetKey>>({});
  const uploadRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    const records = await listAssets();
    setAssets(records);
  };

  useEffect(() => {
    if (!open) return;
    void refresh();
  }, [open]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase(isTr ? 'tr-TR' : 'en-US');
    return assets.filter((asset) => {
      if (kindFilter !== 'all' && asset.kind !== kindFilter) return false;
      if (!term) return true;
      const haystack = `${asset.name} ${ASSET_KIND_LABELS[asset.kind]}`.toLocaleLowerCase(isTr ? 'tr-TR' : 'en-US');
      return haystack.includes(term);
    });
  }, [assets, search, kindFilter, isTr]);

  if (!open) return null;

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setBusy(true);
    let duplicateCount = 0;
    try {
      for (const file of files) {
        const result = await addFileAsset(file, uploadKind);
        if (result.duplicate) duplicateCount += 1;
      }
      await refresh();
      setStatus(
        duplicateCount
          ? (isTr ? `${duplicateCount} tekrar depolanmadı.` : `${duplicateCount} duplicate asset(s) were not stored again.`)
          : (isTr ? 'Varlık kütüphaneye eklendi.' : 'Asset added to the library.'),
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Asset upload failed.');
    } finally {
      setBusy(false);
      if (uploadRef.current) uploadRef.current.value = '';
    }
  };

  const handleRename = async (asset: AssetLibraryRecord) => {
    const nextName = window.prompt(isTr ? 'Yeni ad' : 'New asset name', asset.name);
    if (!nextName?.trim()) return;
    await renameAsset(asset.id, nextName);
    await refresh();
  };

  const handleRemove = async (asset: AssetLibraryRecord) => {
    const confirmed = window.confirm(
      isTr
        ? 'Varlık kütüphaneden silinsin mi? Mevcut projelerde kullanılan görseller korunur.'
        : 'Remove this asset from the library? Existing projects keep their copied visual data.',
    );
    if (!confirmed) return;
    await removeAsset(asset.id);
    await refresh();
    setStatus(isTr ? 'Kütüphane kaydı silindi. Proje değişmedi.' : 'Library record removed. Project state was not changed.');
  };

  const handleApply = (asset: AssetLibraryRecord) => {
    const targets = getAssetTargets(project, asset.kind);
    const targetKey = targetSelections[asset.id] || targets[0]?.key;
    if (!targetKey) {
      setStatus(isTr ? 'Bu şablonda bu varlık türü için uygun slot yok.' : 'This template has no compatible slot for that asset type.');
      return;
    }
    onChange(applyAssetToProject(project, asset, targetKey));
    setStatus(isTr ? 'Varlık seçili semantic slota uygulandı.' : 'Asset applied to the selected semantic slot.');
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/75 p-3 sm:p-6" data-testid="asset-library-modal">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-800 px-4 py-3 sm:px-5">
          <div>
            <div className="text-sm font-black uppercase tracking-wider text-white">{isTr ? 'Varlık Kütüphanesi' : 'Asset Library'}</div>
            <div className="mt-0.5 text-[10px] text-neutral-500">{isTr ? 'Yerel IndexedDB · backend yok · görseller tekrar yüklenmez' : 'Local IndexedDB · no backend · reuse without re-uploading'}</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 hover:text-white" aria-label="Close asset library" data-testid="asset-library-close">
            <IconX size={18} />
          </button>
        </div>

        <div className="grid gap-3 border-b border-neutral-800 p-4 md:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <IconSearch size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={isTr ? 'Ada göre ara…' : 'Search by name…'}
              className="w-full rounded-lg border border-neutral-700 bg-black/50 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-cyan-500"
              data-testid="asset-library-search"
            />
          </label>

          <select value={kindFilter} onChange={(event) => setKindFilter(event.target.value as 'all' | AssetKind)} className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-300">
            <option value="all">{isTr ? 'Tüm Türler' : 'All Types'}</option>
            {ASSET_KINDS.map((kind) => <option key={kind} value={kind}>{ASSET_KIND_LABELS[kind]}</option>)}
          </select>

          <div className="flex min-w-0 gap-2">
            <select value={uploadKind} onChange={(event) => setUploadKind(event.target.value as AssetKind)} className="min-w-0 rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-2 text-[11px] text-neutral-300">
              {ASSET_KINDS.map((kind) => <option key={kind} value={kind}>{ASSET_KIND_LABELS[kind]}</option>)}
            </select>
            <label className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black ${busy ? 'bg-neutral-800 text-neutral-500' : 'bg-cyan-500 text-black hover:bg-cyan-400'}`}>
              <IconUpload size={15} /> {busy ? (isTr ? 'Ekleniyor' : 'Adding') : (isTr ? 'Ekle' : 'Add')}
              <input ref={uploadRef} type="file" accept="image/*" multiple onChange={handleUpload} disabled={busy} className="hidden" data-testid="asset-library-upload-input" />
            </label>
          </div>
        </div>

        {status && <div className="border-b border-neutral-800 bg-neutral-900/60 px-4 py-2 text-[10px] font-semibold text-cyan-300" data-testid="asset-library-status">{status}</div>}

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 bg-black/20 text-center">
              <IconPhoto size={28} className="mb-2 text-neutral-700" />
              <div className="text-xs font-bold text-neutral-400">{isTr ? 'Kayıtlı varlık bulunamadı.' : 'No saved assets found.'}</div>
              <div className="mt-1 text-[10px] text-neutral-600">{isTr ? 'Oyuncu kesiti, kulüp logosu, lig logosu veya özel görsel ekleyebilirsin.' : 'Add a player cutout, club logo, competition logo or custom image.'}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((asset) => {
                const targets = getAssetTargets(project, asset.kind);
                const targetValue = targetSelections[asset.id] || targets[0]?.key || '';
                return (
                  <div key={asset.id} className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/70" data-asset-name={asset.name}>
                    <div className="flex h-36 items-center justify-center bg-black/50 p-3">
                      <img src={asset.dataUrl} alt={asset.name} className="max-h-full max-w-full object-contain" draggable={false} />
                    </div>
                    <div className="space-y-2 p-3">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-black text-white">{asset.name}</div>
                        <div className="mt-0.5 text-[9px] uppercase tracking-wider text-neutral-500">{ASSET_KIND_LABELS[asset.kind]}</div>
                      </div>

                      {targets.length > 0 ? (
                        <select
                          value={targetValue}
                          onChange={(event) => setTargetSelections((previous) => ({ ...previous, [asset.id]: event.target.value as AssetTargetKey }))}
                          className="w-full rounded-lg border border-neutral-700 bg-black/40 px-2 py-2 text-[10px] text-neutral-300"
                          data-action="target"
                        >
                          {targets.map((target) => <option key={target.key} value={target.key}>{target.label}</option>)}
                        </select>
                      ) : (
                        <div className="rounded-lg border border-amber-900/60 bg-amber-950/20 px-2 py-2 text-[9px] text-amber-300">{isTr ? 'Bu şablonda uygun slot yok.' : 'No compatible slot in this template.'}</div>
                      )}

                      <div className="grid grid-cols-[1fr_auto_auto] gap-1.5">
                        <button type="button" disabled={!targets.length} onClick={() => handleApply(asset)} className="flex items-center justify-center gap-1 rounded-lg bg-cyan-500 px-2 py-2 text-[10px] font-black text-black disabled:bg-neutral-800 disabled:text-neutral-600" data-action="apply">
                          <IconCheck size={13} /> {isTr ? 'Uygula' : 'Apply'}
                        </button>
                        <button type="button" onClick={() => void handleRename(asset)} className="rounded-lg border border-neutral-700 bg-neutral-900 p-2 text-neutral-400 hover:text-white" aria-label={`Rename ${asset.name}`} data-action="rename"><IconPencil size={13} /></button>
                        <button type="button" onClick={() => void handleRemove(asset)} className="rounded-lg border border-red-900/60 bg-red-950/20 p-2 text-red-400 hover:text-red-300" aria-label={`Remove ${asset.name}`} data-action="remove"><IconTrash size={13} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
