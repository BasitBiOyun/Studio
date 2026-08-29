import React, { useEffect, useState } from 'react';
import { IconHistory, IconRestore, IconX } from '@tabler/icons-react';
import { Project } from '../types';
import { ProjectVersionRecord } from '../services/db';
import { listProjectVersions, restoreProjectVersion } from '../services/storage';

interface ProjectVersionsModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onRestore: (project: Project) => void;
}

function formatVersionTime(value: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export const ProjectVersionsModal: React.FC<ProjectVersionsModalProps> = ({
  isOpen,
  project,
  onClose,
  onRestore,
}) => {
  const [versions, setVersions] = useState<ProjectVersionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !project) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    listProjectVersions(project.id)
      .then((items) => {
        if (!cancelled) setVersions(items);
      })
      .catch((err) => {
        console.error('Failed to load project versions.', err);
        if (!cancelled) setError('Could not load version history.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handleRestore = async (version: ProjectVersionRecord) => {
    if (restoringId) return;
    if (!window.confirm(`Restore the version from ${formatVersionTime(version.createdAt)}? The current state will be kept in history.`)) return;

    try {
      setRestoringId(version.id);
      setError(null);
      const restored = await restoreProjectVersion(version.id);
      onRestore(restored);
      onClose();
    } catch (err) {
      console.error('Failed to restore project version.', err);
      setError('Could not restore this version.');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '88dvh' }}
        role="dialog"
        aria-modal="true"
        aria-label="Project version history"
      >
        <div className="p-3 sm:p-4 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <IconHistory size={20} className="text-cyan-400 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Version History</h2>
              <p className="text-[11px] text-neutral-400 truncate">{project.name || 'Untitled Graphic'} · last 10 saved states</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-w-10 min-h-10 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center"
            aria-label="Close version history"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2">
          {error && (
            <div className="p-3 rounded-xl border border-red-900/50 bg-red-950/30 text-xs text-red-300">{error}</div>
          )}

          {loading ? (
            <div className="py-10 text-center text-xs text-neutral-500">Loading saved versions…</div>
          ) : versions.length === 0 ? (
            <div className="py-10 text-center">
              <IconHistory size={28} className="mx-auto text-neutral-600 mb-2" />
              <div className="text-sm font-bold text-neutral-300">No earlier version yet</div>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Earlier states appear here automatically after you edit and save this graphic.
              </p>
            </div>
          ) : (
            versions.map((version, index) => (
              <div
                key={version.id}
                className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white">{formatVersionTime(version.createdAt)}</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {version.project.templateType.replace(/-/g, ' ')} · {version.project.aspectRatio}
                    {index === 0 ? ' · Most recent backup' : ''}
                  </div>
                </div>
                <button
                  onClick={() => void handleRestore(version)}
                  disabled={Boolean(restoringId)}
                  className="flex items-center gap-1.5 px-3 py-2 min-h-10 rounded-lg bg-neutral-800 hover:bg-cyan-500 hover:text-black text-neutral-200 text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <IconRestore size={16} />
                  <span>Restore</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
