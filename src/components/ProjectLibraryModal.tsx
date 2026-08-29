import React, { useState, useEffect } from 'react';
import {
  IconX,
  IconPlus,
  IconCopy,
  IconTrash,
  IconDownload,
  IconUpload,
  IconFolder,
} from '@tabler/icons-react';
import { Project } from '../types';
import {
  loadProjectsList,
  createNewProjectFromBrand,
  duplicateProjectInList,
  deleteProjectFromList,
  exportProjectToJson,
  importProjectFromJson,
  loadBrandSettings,
} from '../services/storage';

interface ProjectLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: Project;
  onSelectProject: (proj: Project) => void;
}

export const ProjectLibraryModal: React.FC<ProjectLibraryModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  onSelectProject,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadProjectsList().then(setProjects).catch((error) => {
      console.error('Failed to load project library.', error);
      setErrorMsg('Could not load saved projects.');
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const refreshProjects = async () => {
    const nextProjects = await loadProjectsList();
    setProjects(nextProjects);
    return nextProjects;
  };

  const handleCreateNew = async () => {
    if (isBusy) return;
    try {
      setIsBusy(true);
      setErrorMsg(null);
      const brand = await loadBrandSettings();
      const created = await createNewProjectFromBrand(brand, 'scouting-report');
      if (newProjectName.trim()) {
        created.name = newProjectName.trim();
        created.sharedData.player.name = newProjectName.trim().toUpperCase();
      }
      onSelectProject(created);
      await refreshProjects();
      setNewProjectName('');
      setShowNewInput(false);
      onClose();
    } catch (error) {
      console.error('Failed to create project.', error);
      setErrorMsg('Could not create a new graphic.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDuplicate = async (p: Project) => {
    if (isBusy) return;
    try {
      setIsBusy(true);
      setErrorMsg(null);
      const copy = await duplicateProjectInList(p.id);
      if (!copy) {
        setErrorMsg('Could not find the project to duplicate.');
        return;
      }
      onSelectProject(copy);
      await refreshProjects();
    } catch (error) {
      console.error('Failed to duplicate project.', error);
      setErrorMsg('Could not duplicate this project.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusy || !confirm('Are you sure you want to delete this project?')) return;

    try {
      setIsBusy(true);
      setErrorMsg(null);
      const remaining = await deleteProjectFromList(id);
      setProjects(remaining);
      if (currentProject.id === id && remaining[0]) {
        onSelectProject(remaining[0]);
      }
    } catch (error) {
      console.error('Failed to delete project.', error);
      setErrorMsg('Could not delete this project.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isBusy) return;

    try {
      setIsBusy(true);
      setErrorMsg(null);
      const imported = await importProjectFromJson(file);
      onSelectProject(imported);
      await refreshProjects();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse JSON project file');
    } finally {
      e.target.value = '';
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        style={{ maxHeight: '92dvh' }}
        role="dialog"
        aria-modal="true"
        aria-label="Project library"
      >
        <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border-b border-neutral-800 bg-neutral-900/60 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <IconFolder className="text-cyan-400 flex-shrink-0" size={20} />
            <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate">
              Project Library & Storage
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 min-w-10 min-h-10 flex items-center justify-center"
            aria-label="Close project library"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="p-3 sm:p-4 bg-neutral-900/30 border-b border-neutral-800 flex flex-wrap gap-2 items-center justify-between shrink-0">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowNewInput(true)}
              disabled={isBusy}
              className="flex items-center gap-1.5 px-3 py-2 min-h-10 rounded-lg bg-cyan-500 text-neutral-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-sm disabled:opacity-50"
            >
              <IconPlus size={15} />
              <span>New Graphic</span>
            </button>

            <button
              onClick={() => exportProjectToJson(currentProject)}
              className="flex items-center gap-1.5 px-3 py-2 min-h-10 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <IconDownload size={15} />
              <span>Export JSON</span>
            </button>

            <label className={`flex items-center gap-1.5 px-3 py-2 min-h-10 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer transition-colors ${isBusy ? 'opacity-50 pointer-events-none' : ''}`}>
              <IconUpload size={15} />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          <span className="text-[11px] text-neutral-500">
            {projects.length} Saved {projects.length === 1 ? 'Graphic' : 'Graphics'}
          </span>
        </div>

        {errorMsg && (
          <div className="mx-3 sm:mx-4 mt-3 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {showNewInput && (
          <div className="p-3 sm:p-4 bg-neutral-900/80 border-b border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in fade-in duration-150 shrink-0">
            <input
              type="text"
              placeholder="Enter player or headline..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleCreateNew()}
              autoFocus
              disabled={isBusy}
              className="flex-1 min-w-0 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-base sm:text-xs text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => void handleCreateNew()}
                disabled={isBusy}
                className="flex-1 sm:flex-none px-3 py-2 min-h-10 bg-cyan-500 text-neutral-950 font-bold text-xs rounded-lg hover:bg-cyan-400 disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewInput(false)}
                disabled={isBusy}
                className="flex-1 sm:flex-none px-3 py-2 min-h-10 bg-neutral-800 text-neutral-400 text-xs rounded-lg hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {projects.map((p) => {
            const isCurrent = p.id === currentProject.id;
            const activeTheme = p.templates?.[p.templateType]?.theme || p.templates?.['scouting-report']?.theme;
            const accent = activeTheme?.primaryAccent || '#22d3ee';
            const displayName = p.name || p.sharedData?.player?.name || 'Untitled Graphic';

            return (
              <div
                key={p.id}
                onClick={() => {
                  if (isBusy) return;
                  onSelectProject(p);
                  onClose();
                }}
                className={`p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-cyan-500 bg-neutral-900/90 ring-1 ring-cyan-500/40'
                    : 'border-neutral-800/80 bg-neutral-900/40 hover:bg-neutral-900 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
                    style={{
                      backgroundColor: `${accent}22`,
                      color: accent,
                      border: `1px solid ${accent}44`,
                    }}
                  >
                    {displayName.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        {displayName}
                      </h4>
                      {isCurrent && (
                        <span className="hidden sm:inline px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold rounded flex-shrink-0">
                          Active
                        </span>
                      )}
                      <span className="hidden md:inline text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded uppercase flex-shrink-0">
                        {p.templateType}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5 min-w-0">
                      <span className="truncate">{p.sharedData?.player?.club || p.aspectRatio}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline flex-shrink-0">{new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => void handleDuplicate(p)}
                    disabled={isBusy}
                    className="p-2 min-w-9 min-h-9 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-40 flex items-center justify-center"
                    title="Duplicate Project"
                    aria-label="Duplicate project"
                  >
                    <IconCopy size={16} />
                  </button>

                  <button
                    onClick={() => exportProjectToJson(p)}
                    className="hidden sm:flex p-2 min-w-9 min-h-9 rounded-lg text-neutral-400 hover:text-cyan-400 hover:bg-neutral-800 transition-colors items-center justify-center"
                    title="Export JSON"
                    aria-label="Export project JSON"
                  >
                    <IconDownload size={16} />
                  </button>

                  {projects.length > 1 && (
                    <button
                      onClick={(e) => void handleDelete(p.id, e)}
                      disabled={isBusy}
                      className="p-2 min-w-9 min-h-9 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors disabled:opacity-40 flex items-center justify-center"
                      title="Delete Project"
                      aria-label="Delete project"
                    >
                      <IconTrash size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};