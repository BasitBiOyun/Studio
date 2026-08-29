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
  useEffect(() => {
    loadProjectsList().then(setProjects);
  }, []);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProjectsList().then(setProjects);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateNew = async () => {
    const brand = await loadBrandSettings();
    const created = await createNewProjectFromBrand(brand, 'scouting-report');
    if (newProjectName.trim()) {
      created.name = newProjectName.trim();
      created.sharedData.player.name = newProjectName.trim().toUpperCase();
    }
    loadProjectsList().then(setProjects);
    onSelectProject(created);
    setNewProjectName('');
    setShowNewInput(false);
    onClose();
  };

  const handleDuplicate = (p: Project) => {
    const copy = duplicateProjectInList(p.id);
    if (copy) {
      loadProjectsList().then(setProjects);
      onSelectProject(copy);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      const remaining = deleteProjectFromList(id);
      setProjects(remaining);
      if (currentProject.id === id && remaining[0]) {
        onSelectProject(remaining[0]);
      }
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setErrorMsg(null);
        const imported = await importProjectFromJson(file);
        loadProjectsList().then(setProjects);
        onSelectProject(imported);
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to parse JSON project file');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-2">
            <IconFolder className="text-cyan-400" size={20} />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Project Library & Storage
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-4 bg-neutral-900/30 border-b border-neutral-800 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewInput(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-neutral-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-sm"
            >
              <IconPlus size={15} />
              <span>New Graphic</span>
            </button>

            <button
              onClick={() => exportProjectToJson(currentProject)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <IconDownload size={15} />
              <span>Export JSON</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer transition-colors">
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

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* New Project Input Field */}
        {showNewInput && (
          <div className="p-4 bg-neutral-900/80 border-b border-neutral-800 flex items-center gap-2 animate-in fade-in duration-150">
            <input
              type="text"
              placeholder="Enter player or headline..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateNew()}
              autoFocus
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={handleCreateNew}
              className="px-3 py-1.5 bg-cyan-500 text-neutral-950 font-bold text-xs rounded-lg hover:bg-cyan-400"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewInput(false)}
              className="px-3 py-1.5 bg-neutral-800 text-neutral-400 text-xs rounded-lg hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {projects.map((p) => {
            const isCurrent = p.id === currentProject.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProject(p);
                  onClose();
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-cyan-500 bg-neutral-900/90 ring-1 ring-cyan-500/40'
                    : 'border-neutral-800/80 bg-neutral-900/40 hover:bg-neutral-900 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: `${p.theme.primaryAccent}22`,
                      color: p.theme.primaryAccent,
                      border: `1px solid ${p.theme.primaryAccent}44`,
                    }}
                  >
                    {(p.sharedData?.player?.name || p.name || 'BB').substring(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">
                        {p.sharedData?.player?.name || p.name || 'Untitled Graphic'}
                      </h4>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold rounded">
                          Active
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded uppercase">
                        {p.templateType}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>{p.sharedData?.player?.club || p.aspectRatio}</span>
                      <span>•</span>
                      <span>{new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleDuplicate(p)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                    title="Duplicate Project"
                  >
                    <IconCopy size={16} />
                  </button>

                  <button
                    onClick={() => exportProjectToJson(p)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-cyan-400 hover:bg-neutral-800 transition-colors"
                    title="Export JSON"
                  >
                    <IconDownload size={16} />
                  </button>

                  {projects.length > 1 && (
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                      title="Delete Project"
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
