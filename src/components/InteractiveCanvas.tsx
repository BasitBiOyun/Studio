import React, { useRef, useState, useEffect } from 'react';
import { IconLoader2, IconPhotoPlus, IconSparkles } from '@tabler/icons-react';
import { Project } from '../types';
import {
  applyTemplatePackToProject,
  parseTemplatePack,
} from '../services/templatePack';
import { upscaleImage2x } from '../services/clientUpscaler';
import {
  getTemplateVisualPolicy,
  usablePlayerImageSrc,
} from '../services/templateVisualPolicy';

interface InteractiveCanvasProps {
  children: React.ReactNode;
  project: Project;
  onUpdateProject: (p: Project) => void;
  interactive: boolean;
}

type ToolComponent = React.ComponentType<any>;

type TemplateImportEvent = CustomEvent<{
  jsonText: string;
  templateType: string;
}>;

type RemoveImageEvent = CustomEvent<{
  secondary?: boolean;
}>;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  children,
  project,
  onUpdateProject,
  interactive
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [targets, setTargets] = useState<Array<HTMLElement | SVGElement>>([]);
  const moveableRef = useRef<any>(null);
  const [MoveableComponent, setMoveableComponent] = useState<ToolComponent | null>(null);
  const [SelectoComponent, setSelectoComponent] = useState<ToolComponent | null>(null);
  const [upscalingSlot, setUpscalingSlot] = useState<'primary' | 'secondary' | null>(null);

  const activeTemplateKey = project.templateType || 'scouting-report';
  const activeTemplate = project.templates[activeTemplateKey];
  const visualPolicy = getTemplateVisualPolicy(activeTemplateKey);
  const primaryImageSrc = usablePlayerImageSrc(activeTemplate?.visuals?.playerImageSrc);
  const secondaryImageSrc = usablePlayerImageSrc(activeTemplate?.visuals?.secondaryPlayerImageSrc);
  const isComparison = activeTemplateKey === 'player-comparison';

  useEffect(() => {
    setTargets([]);
  }, [activeTemplateKey, activeTemplate?.layout?.locked]);

  useEffect(() => {
    if (!interactive) return;

    let cancelled = false;

    Promise.all([import('react-moveable'), import('react-selecto')])
      .then(([moveableModule, selectoModule]) => {
        if (cancelled) return;
        setMoveableComponent(() => moveableModule.default as ToolComponent);
        setSelectoComponent(() => selectoModule.default as ToolComponent);
      })
      .catch((error) => {
        console.warn('Interactive canvas tools could not be loaded. Core editor remains available.', error);
      });

    return () => {
      cancelled = true;
    };
  }, [interactive]);

  useEffect(() => {
    if (!interactive) return;

    const handleTemplateImport = (event: Event) => {
      const customEvent = event as TemplateImportEvent;
      const detail = customEvent.detail;
      if (!detail?.jsonText) return;
      if (detail.templateType && detail.templateType !== activeTemplateKey) {
        window.alert('The selected template changed before the JSON import completed. Please import the file again.');
        return;
      }

      const result = parseTemplatePack(detail.jsonText, activeTemplateKey);
      if (result.error || !result.data) {
        window.alert(result.error || 'Template JSON could not be imported.');
        return;
      }

      const updatedProject = applyTemplatePackToProject(project, activeTemplateKey, result.data);
      onUpdateProject(updatedProject);

      if (result.warnings.length > 0) {
        window.alert(`JSON imported. Notes: ${result.warnings.join(', ')}`);
      }
    };

    const handleRemoveImage = (event: Event) => {
      const customEvent = event as RemoveImageEvent;
      const isSecondary = Boolean(customEvent.detail?.secondary);
      const newProject = JSON.parse(JSON.stringify(project)) as Project;
      const template = newProject.templates[activeTemplateKey];
      if (!template) return;

      if (isSecondary) {
        template.visuals.secondaryPlayerImageSrc = '';
      } else {
        template.visuals.playerImageSrc = '';
      }

      newProject.updatedAt = Date.now();
      setTargets([]);
      onUpdateProject(newProject);
    };

    window.addEventListener('bbo-template-json-import', handleTemplateImport as EventListener);
    window.addEventListener('bbo-remove-player-image', handleRemoveImage as EventListener);

    return () => {
      window.removeEventListener('bbo-template-json-import', handleTemplateImport as EventListener);
      window.removeEventListener('bbo-remove-player-image', handleRemoveImage as EventListener);
    };
  }, [interactive, project, activeTemplateKey, onUpdateProject]);

  if (!activeTemplate) {
    return <div className="relative w-full h-full">{children}</div>;
  }

  const replaceVisualImage = (src: string, secondary = false) => {
    const newProject = JSON.parse(JSON.stringify(project)) as Project;
    const template = newProject.templates[activeTemplateKey];
    if (!template) return;
    if (secondary) template.visuals.secondaryPlayerImageSrc = src;
    else template.visuals.playerImageSrc = src;
    newProject.updatedAt = Date.now();
    setTargets([]);
    onUpdateProject(newProject);
  };

  const handleQuickImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    secondary = false,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { default: imageCompression } = await import('browser-image-compression');
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 2200,
        useWebWorker: true,
      });
      const reader = new FileReader();
      reader.onload = () => replaceVisualImage(String(reader.result || ''), secondary);
      reader.readAsDataURL(compressed);
    } catch (error) {
      console.error('Quick visual upload failed.', error);
      window.alert('The image could not be processed.');
    } finally {
      event.target.value = '';
    }
  };

  const handleUpscale = async (secondary = false) => {
    const source = secondary ? secondaryImageSrc : primaryImageSrc;
    if (!source || upscalingSlot) return;

    const slot = secondary ? 'secondary' : 'primary';
    setUpscalingSlot(slot);
    try {
      const upscaled = await upscaleImage2x(source);
      replaceVisualImage(upscaled, secondary);
    } catch (error) {
      console.error('Free ESRGAN upscale failed.', error);
      window.alert('AI upscale could not be completed. Check your connection and try again.');
    } finally {
      setUpscalingSlot(null);
    }
  };

  const handleDrag = (e: any) => {
    const target = e.target as HTMLElement;
    const moveableId = target.getAttribute('data-moveable-id');
    if (!moveableId) return;

    if (moveableId.startsWith('logo-')) {
      const currentX = parseFloat(target.getAttribute('data-x') || '0');
      const currentY = parseFloat(target.getAttribute('data-y') || '0');
      const newX = currentX - e.delta[0];
      const newY = currentY + e.delta[1];

      target.setAttribute('data-x', newX.toString());
      target.setAttribute('data-y', newY.toString());
      target.style.transform = e.transform;
      return;
    }

    const parent = target.parentElement;
    if (!parent) return;
    const pw = parent.offsetWidth || 1;
    const ph = parent.offsetHeight || 1;

    const dx = (e.delta[0] / pw) * 100;
    const dy = (e.delta[1] / ph) * 100;

    const currentX = parseFloat(target.getAttribute('data-x') || '0');
    const currentY = parseFloat(target.getAttribute('data-y') || '0');
    const newX = clamp(currentX + dx, -150, 150);
    const newY = clamp(currentY + dy, -150, 150);

    target.setAttribute('data-x', newX.toFixed(2));
    target.setAttribute('data-y', newY.toFixed(2));

    const scale = target.getAttribute('data-scale') || '1';
    target.style.transform = `translate(${newX}%, ${newY}%) scale(${scale})`;
  };

  const handleScale = (e: any) => {
    const target = e.target as HTMLElement;
    const id = target.getAttribute('data-moveable-id') || '';
    if (id.startsWith('logo-')) return;

    const currentScale = parseFloat(target.getAttribute('data-scale') || '1');
    const deltaScale = Number(e.delta?.[0]);
    const nextMultiplier = Number.isFinite(deltaScale) && deltaScale > 0 ? deltaScale : 1;
    const newScale = clamp(currentScale * nextMultiplier, 0.35, 3.5);

    target.setAttribute('data-scale', newScale.toFixed(2));

    const x = target.getAttribute('data-x') || '0';
    const y = target.getAttribute('data-y') || '0';
    target.style.transform = `translate(${x}%, ${y}%) scale(${newScale})`;
  };

  const updateProjectFromTarget = (target: HTMLElement) => {
    const id = target.getAttribute('data-moveable-id');
    if (!id) return;

    const x = parseFloat(target.getAttribute('data-x') || '0');
    const y = parseFloat(target.getAttribute('data-y') || '0');
    const scale = clamp(parseFloat(target.getAttribute('data-scale') || '1'), 0.35, 3.5);

    const newProject = JSON.parse(JSON.stringify(project)) as Project;
    const template = newProject.templates[activeTemplateKey];
    if (!template) return;

    if (id === 'primary-image') {
      template.visuals.imageTransform.x = clamp(x, -150, 150);
      template.visuals.imageTransform.y = clamp(y, -150, 150);
      template.visuals.imageTransform.scale = scale;
    } else if (id === 'secondary-image' && template.visuals.secondaryImageTransform) {
      template.visuals.secondaryImageTransform.x = clamp(x, -150, 150);
      template.visuals.secondaryImageTransform.y = clamp(y, -150, 150);
      template.visuals.secondaryImageTransform.scale = scale;
    } else if (id.startsWith('logo-')) {
      const idxStr = id.replace('logo-', '');
      const logo = template.visuals.logos.find((l: any, idx: number) => (l.id || idx).toString() === idxStr);
      if (logo) {
        logo.x = Number.isFinite(x) ? x : 0;
        logo.y = Number.isFinite(y) ? y : 0;
        target.style.transform = '';
      }
    }

    onUpdateProject(newProject);
  };

  const handleDragEnd = (e: any) => {
    if (!e.isDrag) return;
    updateProjectFromTarget(e.target);
  };

  const handleScaleEnd = (e: any) => {
    if (!e.isDrag) return;
    updateProjectFromTarget(e.target);
  };

  const toolsReady = Boolean(
    interactive &&
    !activeTemplate.layout?.locked &&
    MoveableComponent &&
    SelectoComponent
  );
  const selectionHasLogo = targets.some((target) =>
    (target as HTMLElement).getAttribute?.('data-moveable-id')?.startsWith('logo-')
  );

  const showQuickImageTools = Boolean(
    interactive && (
      isComparison ||
      primaryImageSrc ||
      secondaryImageSrc
    )
  );

  return (
    <div className="relative w-full h-full flex flex-col">
      <div
        ref={containerRef}
        className="relative flex-1 w-full h-full overflow-hidden canvas-container"
      >
        {children}

        {showQuickImageTools && (
          <div className="absolute top-3 right-3 z-[80] flex items-center gap-1.5 rounded-xl border border-neutral-700/80 bg-neutral-950/90 p-1.5 shadow-xl backdrop-blur-md">
            {isComparison && visualPolicy.allowPrimaryImage && (
              <label className="cursor-pointer flex items-center gap-1 px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10px] font-bold text-neutral-200">
                <IconPhotoPlus size={13} /> P1 Foto
                <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleQuickImageUpload(event, false)} />
              </label>
            )}
            {isComparison && visualPolicy.allowSecondaryImage && (
              <label className="cursor-pointer flex items-center gap-1 px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10px] font-bold text-neutral-200">
                <IconPhotoPlus size={13} /> P2 Foto
                <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleQuickImageUpload(event, true)} />
              </label>
            )}
            {primaryImageSrc && (
              <button
                type="button"
                onClick={() => void handleUpscale(false)}
                disabled={Boolean(upscalingSlot)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 hover:bg-cyan-500/25 text-[10px] font-black text-cyan-300 disabled:opacity-50"
                title="Free 2× ESRGAN upscale. Runs in your browser."
              >
                {upscalingSlot === 'primary' ? <IconLoader2 size={13} className="animate-spin" /> : <IconSparkles size={13} />}
                {isComparison ? 'P1 2×' : 'AI 2×'}
              </button>
            )}
            {secondaryImageSrc && (
              <button
                type="button"
                onClick={() => void handleUpscale(true)}
                disabled={Boolean(upscalingSlot)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 hover:bg-cyan-500/25 text-[10px] font-black text-cyan-300 disabled:opacity-50"
                title="Free 2× ESRGAN upscale for player 2. Runs in your browser."
              >
                {upscalingSlot === 'secondary' ? <IconLoader2 size={13} className="animate-spin" /> : <IconSparkles size={13} />}
                P2 2×
              </button>
            )}
          </div>
        )}

        {toolsReady && (
          <>
            <MoveableComponent
              ref={moveableRef}
              target={targets}
              draggable
              scalable={!selectionHasLogo}
              keepRatio
              snappable
              snapCenter
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              onScale={handleScale}
              onScaleEnd={handleScaleEnd}
            />
            <SelectoComponent
              container={containerRef.current}
              selectableTargets={['.moveable-target']}
              selectByClick
              selectFromInside={false}
              hitRate={0}
              onSelectEnd={(e: any) => {
                setTargets(e.selected);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};
