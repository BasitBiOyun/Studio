/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Project, ExportFormat, CanvasDimensions } from './types';
import { DEFAULT_PROJECT, CANVAS_DIMENSIONS } from './constants/presets';
import {
  loadCurrentProject,
  saveCurrentProject,
} from './services/storage';
import { useHistory } from './hooks/useHistory';
import { exportGraphic, copyGraphicToClipboard, isMobileDevice } from './services/exporter';
import { ScoutingCard } from './components/ScoutingCard';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { EditorSidebar } from './components/EditorSidebar';
import { TopBar } from './components/TopBar';
import { MobileDrawer } from './components/MobileDrawer';
import { ProjectLibraryModal } from './components/ProjectLibraryModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { DesignReferenceModal } from './components/DesignReferenceModal';
import { QualityCheckModal } from './components/QualityCheckModal';
import {
  IconZoomIn,
  IconZoomOut,
  IconArrowsMove,
  IconEdit,
} from '@tabler/icons-react';

export default function App() {
  const [projectState, setProjectState] = useState<Project | null>(null);
  
  useEffect(() => {
    async function init() {
      // Assuming loadCurrentProject becomes async
      const proj = await loadCurrentProject();
      setProjectState(proj);
    }
    init();
  }, []);
  const {
    currentProject,
    pushState,
    resetHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory(projectState);

  // UI modal states
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDesignGuidelinesOpen, setIsDesignGuidelinesOpen] = useState(false);
  const [isQualityCheckOpen, setIsQualityCheckOpen] = useState(false);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic canvas dimensions
  const activeDimensions: CanvasDimensions =
    CANVAS_DIMENSIONS[currentProject.aspectRatio] || CANVAS_DIMENSIONS['1:1'];

  // Zoom & Preview scaling
  const previewAreaRef = useRef<HTMLDivElement | null>(null);
  const cardElementRef = useRef<HTMLDivElement | null>(null);
  const exportElementRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(0.35);
  const [autoFit, setAutoFit] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  
  // Panning State
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState<{ x: number; y: number } | null>(null);

  // Mouse Handlers for Panning
  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    // Only allow pan on left click or middle click
    if (e.button !== 0 && e.button !== 1) return;
    setIsPanning(true);
    setLastPanPos({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!isPanning || !lastPanPos) return;
    const dx = e.clientX - lastPanPos.x;
    const dy = e.clientY - lastPanPos.y;
    setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastPanPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    setIsPanning(false);
    setLastPanPos(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      saveCurrentProject(currentProject).catch(console.error);
    }, 400);
    if (!projectState) return <div className="flex h-screen items-center justify-center bg-black text-white">Loading Editor...</div>;

  return () => clearTimeout(timer);
  }, [currentProject]);

  // Compute responsive scale for dynamic canvas dimensions inside viewport
  const updateScale = useCallback(() => {
    if (!previewAreaRef.current) return;
    const { clientWidth, clientHeight } = previewAreaRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    const padding = window.innerWidth < 768 ? 20 : 60;
    const availWidth = Math.max(clientWidth - padding, 200);
    const availHeight = Math.max(clientHeight - padding, 200);

    const fitScale = Math.min(
      availWidth / activeDimensions.width,
      availHeight / activeDimensions.height
    );
    setScale(fitScale);
  }, [activeDimensions]);

  useEffect(() => {
    updateScale();
    const handleResize = () => updateScale();
    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | null = null;
    if (previewAreaRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updateScale();
      });
      observer.observe(previewAreaRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, [updateScale]);

  // Global Keyboard Shortcuts (Undo, Redo, Save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentProject(currentProject).catch(console.error);
        showToast('Project saved locally');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, currentProject]);

  // Project state updater
  const handleProjectChange = (updated: Project) => {
    pushState(updated);
  };

  // Direct on-canvas dragging update
  const handleCanvasTransform = (x: number, y: number) => {
    const updated: Project = {
      ...currentProject,
      imageTransform: {
        ...currentProject.imageTransform,
        x,
        y,
      },
    };
    pushState(updated, true);
  };

  // Project reset
  const handleConfirmReset = () => {
    const resetProj = {
      ...DEFAULT_PROJECT,
      id: currentProject.id,
      name: currentProject.name,
    };
    resetHistory(resetProj);
    saveCurrentProject(resetProj).catch(console.error);
    showToast('Reset to default template');
  };

  // Project switch from Library
  const handleSelectProject = (proj: Project) => {
    resetHistory(proj);
    saveCurrentProject(proj).catch(console.error);
    showToast(`Loaded: ${proj.sharedData?.player?.name || proj.name}`);
  };

  // High-Res Graphic Export
  const handleExportGraphic = async (scaleMultiplier: 1 | 2 | 4, format: ExportFormat) => {
    if (!cardElementRef.current) return;
    try {
      setIsExporting(true);
      const titleSlug = (
        currentProject.sharedData?.player?.name ||
        currentProject.name ||
        'football_graphic'
      )
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, '_');

      const filename = `BasitBiOyun_${titleSlug}_${currentProject.templateType}_${activeDimensions.ratio}_${scaleMultiplier}x.${format === 'jpg' ? 'jpg' : 'png'}`;

      await exportGraphic(exportElementRef.current, {
        dimensions: activeDimensions,
        scaleMultiplier,
        format,
        filename,
        onProgress: (status) => setExportStatus(status),
      });
      showToast(`Exported ${activeDimensions.ratio} graphic successfully!`);
    } catch (err: any) {
      alert(err.message || 'Export error');
    } finally {
      setIsExporting(false);
      setExportStatus('');
    }
  };

  // Copy to Clipboard
  const handleCopyClipboard = async () => {
    if (!cardElementRef.current) return;
    try {
      setIsExporting(true);
      setExportStatus('Copying image...');
      await copyGraphicToClipboard(exportElementRef.current, activeDimensions);
      showToast('Copied high-res card to clipboard!');
    } catch (err: any) {
      alert('Could not copy image directly. You can use the Export button to download.');
    } finally {
      setIsExporting(false);
      setExportStatus('');
    }
  };

  const finalScale = autoFit ? scale : scale * zoomLevel;

  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-950 text-neutral-100 overflow-hidden select-none font-body">
      {/* Top Application Bar */}
      <TopBar
        project={currentProject}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={() => setIsResetOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        onOpenDesignGuidelines={() => setIsDesignGuidelinesOpen(true)}
        onOpenQualityCheck={() => setIsQualityCheckOpen(true)}
        onExport={handleExportGraphic}
        onCopyClipboard={handleCopyClipboard}
        isExporting={isExporting}
        exportStatus={exportStatus}
      />

      {/* Main Workspace Area (Desktop: 2 Columns / Mobile: Full Width Preview) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* DESKTOP LEFT SIDEBAR (Controls & Customizer) */}
        <div
          className={`hidden md:flex flex-shrink-0 h-full relative transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-[420px] lg:w-[460px] opacity-100' : 'w-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="w-[420px] lg:w-[460px] h-full flex-shrink-0">
            <EditorSidebar
              project={currentProject}
              onChange={handleProjectChange}
              onOpenDesignGuidelines={() => setIsDesignGuidelinesOpen(true)}
              onOpenQualityCheck={() => setIsQualityCheckOpen(true)}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => {
            setIsSidebarOpen(!isSidebarOpen);
            // Trigger a resize event to recalculate canvas scale
            setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
          }}
          className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-40 bg-neutral-800 border border-neutral-700 text-white rounded-full p-1.5 shadow-lg hover:bg-neutral-700 transition-all duration-300 ${
            isSidebarOpen ? 'left-[405px] lg:left-[445px]' : 'left-4'
          }`}
          title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`}
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* RIGHT PREVIEW CANVAS STAGE */}
        <main
          ref={previewAreaRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`flex-1 h-full bg-[#050608] relative overflow-hidden flex items-center justify-center p-2 md:p-6 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          {/* Subtle Grid Pattern in background of editor workspace */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
            }}
          />

          {/* Floating Zoom Controls Bar */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-neutral-800 shadow-xl text-neutral-300 text-xs">
            <button
              onClick={() => {
                setAutoFit(false);
                setZoomLevel((prev) => Math.max(prev - 0.2, 0.4));
              }}
              className="p-1.5 hover:text-white hover:bg-neutral-800 rounded-lg"
              title="Zoom Out"
            >
              <IconZoomOut size={16} />
            </button>

            <button
              onClick={() => {
                setAutoFit(true);
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
                updateScale();
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${
                autoFit ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-neutral-800 text-neutral-400'
              }`}
              title="Fit to Screen"
            >
              Fit
            </button>

            <button
              onClick={() => {
                setAutoFit(false);
                setZoomLevel((prev) => Math.min(prev + 0.2, 2.5));
              }}
              className="p-1.5 hover:text-white hover:bg-neutral-800 rounded-lg"
              title="Zoom In"
            >
              <IconZoomIn size={16} />
            </button>
          </div>

          {/* Mobile Bottom Quick Edit Button */}
          <div className="md:hidden absolute bottom-4 left-4 z-20">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-cyan-400 text-neutral-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <IconEdit size={16} />
              <span>Edit Graphic</span>
            </button>
          </div>

          {/* SCALED DYNAMIC GRAPHIC ARTBOARD */}
          <div
            className="relative transition-transform duration-75"
            style={{
              width: `${activeDimensions.width * finalScale}px`,
              height: `${activeDimensions.height * finalScale}px`,
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${activeDimensions.width}px`,
                height: `${activeDimensions.height}px`,
                transform: `scale(${finalScale})`,
                transformOrigin: 'top left',
                boxShadow: '0 30px 80px -15px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06)',
              }}
            >
              <InteractiveCanvas project={currentProject} onUpdateProject={pushState} interactive={true}>
                <ScoutingCard
                  ref={cardElementRef}
                  project={currentProject}
                  onUpdateTransform={handleCanvasTransform}
                  interactive={true}
                />
              </InteractiveCanvas>
            </div>
          </div>
        </main>
      </div>

      {/* MOBILE DRAWER SHEET */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        project={currentProject}
        onChange={handleProjectChange}
      />

      {/* PROJECT LIBRARY MODAL */}
      <ProjectLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        currentProject={currentProject}
        onSelectProject={handleSelectProject}
      />

      {/* RESET CONFIRMATION MODAL */}
      <ResetConfirmModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={handleConfirmReset}
      />

      {/* DESIGN SYSTEM REFERENCE MODAL */}
      <DesignReferenceModal
        isOpen={isDesignGuidelinesOpen}
        onClose={() => setIsDesignGuidelinesOpen(false)}
      />

      {/* QUALITY PRE-FLIGHT AUDIT MODAL */}
      <QualityCheckModal
        isOpen={isQualityCheckOpen}
        onClose={() => setIsQualityCheckOpen(false)}
        project={currentProject}
        onProceedExport={() => handleExportGraphic(2, 'png')}
      />

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-neutral-900/95 border border-cyan-500/40 text-cyan-200 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}

      {/* Hidden Native Resolution Render for Export */}
      <div 
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: `${activeDimensions.width}px`,
          height: `${activeDimensions.height}px`,
          
          pointerEvents: 'none',
          zIndex: -9999,
          overflow: 'hidden'
        }}
      >
        <ScoutingCard
          ref={exportElementRef}
          project={currentProject}
          interactive={false}
        />
      </div>
    </div>
  );
}
