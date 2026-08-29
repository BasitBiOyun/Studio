import React, { useState } from 'react';
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconRotate2,
  IconDownload,
  IconCopy,
  IconFolder,
  IconMenu2,
  IconCheck,
  IconLoader2,
  IconShieldCheck,
} from '@tabler/icons-react';
import { Project, ExportFormat } from '../types';
import { CANVAS_DIMENSIONS } from '../constants/presets';
import { exportProjectToJson } from '../services/storage';

interface TopBarProps {
  project: Project;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onOpenLibrary: () => void;
  onOpenMobileDrawer: () => void;
  onOpenDesignGuidelines: () => void;
  onOpenQualityCheck: () => void;
  onExport: (scale: 1 | 2 | 4, format: ExportFormat) => Promise<void>;
  onCopyClipboard: () => Promise<void>;
  isExporting: boolean;
  exportStatus: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  project,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onOpenLibrary,
  onOpenMobileDrawer,
  onOpenQualityCheck,
  onExport,
  onCopyClipboard,
  isExporting,
  exportStatus,
}) => {
  const [scaleMultiplier, setScaleMultiplier] = useState<1 | 2 | 4>(1);
  const [exportFormat, setExportFormat] = useState<ExportFormat | 'json'>('png');
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const currentDim = CANVAS_DIMENSIONS[project.aspectRatio] || CANVAS_DIMENSIONS['1:1'];
  const exportWidth = currentDim.width * scaleMultiplier;

  const handleCopy = async () => {
    try {
      await onCopyClipboard();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The app-level copy handler surfaces the error.
    }
  };

  const handleExportClick = async (scale: 1 | 2 | 4, format: ExportFormat | 'json') => {
    setShowExportMenu(false);
    if (format === 'json') {
      exportProjectToJson(project);
      return;
    }
    await onExport(scale, format);
  };

  return (
    <header className="h-14 bg-neutral-950/95 border-b border-neutral-800 px-3 md:px-5 flex items-center justify-between z-30 select-none">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button
          onClick={onOpenMobileDrawer}
          className="md:hidden p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
          title="Open Editor Controls"
        >
          <IconMenu2 size={20} />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black text-xs shadow-md flex-shrink-0">
            BBO
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="text-xs font-black text-white tracking-wide uppercase">
              BasitBiOyun Studio
            </h1>
            <p className="text-[10px] text-neutral-400 truncate max-w-[180px]">
              {project.name || project.sharedData?.player?.name}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-bold text-neutral-300">
          <span className="text-cyan-400 font-black">{currentDim.ratio}</span>
          <span className="text-neutral-500">•</span>
          <span>{currentDim.width}×{currentDim.height}</span>
        </div>

        <button
          onClick={onOpenLibrary}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors ml-1"
          title="Projects Library"
        >
          <IconFolder size={15} className="text-cyan-400" />
          <span className="hidden sm:inline">Projects</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800/80">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Undo (Ctrl+Z)"
          >
            <IconArrowBackUp size={18} />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Redo (Ctrl+Shift+Z)"
          >
            <IconArrowForwardUp size={18} />
          </button>

          <div className="w-[1px] h-4 bg-neutral-800 mx-0.5" />

          <button
            onClick={onReset}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-all"
            title="Reset to Default"
          >
            <IconRotate2 size={18} />
          </button>
        </div>

        <button
          onClick={onOpenQualityCheck}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 hover:bg-neutral-800 hover:text-cyan-400 transition-colors"
          title="Pre-Flight Quality Audit"
        >
          <IconShieldCheck size={16} className="text-cyan-400" />
          <span>QA Audit</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          disabled={isExporting}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          title="Copy Image to Clipboard"
        >
          {copied ? (
            <>
              <IconCheck size={16} className="text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <IconCopy size={16} />
              <span>Copy</span>
            </>
          )}
        </button>

        <div className="relative">
          <div className="flex items-center rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/10">
            <button
              onClick={() => handleExportClick(scaleMultiplier, exportFormat)}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-900 rounded-l-[7px] text-xs font-bold text-white transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <IconLoader2 size={16} className="animate-spin text-cyan-400" />
                  <span className="truncate max-w-[120px]">
                    {exportStatus || 'Exporting...'}
                  </span>
                </>
              ) : (
                <>
                  <IconDownload size={16} className="text-cyan-400" />
                  <span>{exportFormat === 'json' ? 'Export JSON' : `Export ${exportWidth}px`}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowExportMenu((prev) => !prev)}
              disabled={isExporting}
              className="px-2 py-1.5 bg-neutral-950 hover:bg-neutral-900 rounded-r-[7px] border-l border-neutral-800 text-neutral-300 hover:text-white text-xs"
              title="Change Resolution & Format"
            >
              ▼
            </button>
          </div>

          {showExportMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute right-0 mt-1.5 w-60 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2 z-50 space-y-2">
                <div className="px-2">
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Export Format
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['png', 'jpg', 'json'] as Array<ExportFormat | 'json'>).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setExportFormat(fmt)}
                        className={`py-1 rounded text-xs font-bold uppercase ${
                          exportFormat === fmt
                            ? 'bg-cyan-500 text-black'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {exportFormat !== 'json' && (
                  <div className="border-t border-neutral-800 pt-2 px-2">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 mt-2">
                      Resolution Multiplier
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => setScaleMultiplier(4)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          scaleMultiplier === 4
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                            : 'text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        <div>
                          <div>4× Ultra High-Res</div>
                          <div className="text-[10px] text-neutral-500">
                            {currentDim.width * 4} × {currentDim.height * 4} px
                          </div>
                        </div>
                        {scaleMultiplier === 4 && <IconCheck size={14} />}
                      </button>
                      <button
                        onClick={() => setScaleMultiplier(2)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          scaleMultiplier === 2
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                            : 'text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        <div>
                          <div>2× High-Res</div>
                          <div className="text-[10px] text-neutral-500">
                            {currentDim.width * 2} × {currentDim.height * 2} px
                          </div>
                        </div>
                        {scaleMultiplier === 2 && <IconCheck size={14} />}
                      </button>
                      <button
                        onClick={() => setScaleMultiplier(1)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          scaleMultiplier === 1
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                            : 'text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        <div>
                          <div>1× Native Resolution</div>
                          <div className="text-[10px] text-neutral-500">
                            {currentDim.width} × {currentDim.height} px
                          </div>
                        </div>
                        {scaleMultiplier === 1 && <IconCheck size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => handleExportClick(scaleMultiplier, exportFormat)}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-[11px] py-2 rounded-lg shadow-md transition-colors"
                  >
                    Confirm Export
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
