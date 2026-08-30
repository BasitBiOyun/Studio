import React, { useRef, useState, useEffect } from 'react';
import { IconFileImport, IconTrash } from '@tabler/icons-react';
import { Project } from '../types';
import {
  applyTemplatePackToProject,
  parseTemplatePack,
  templatePackLabel,
} from '../services/templatePack';

interface InteractiveCanvasProps {
  children: React.ReactNode;
  project: Project;
  onUpdateProject: (p: Project) => void;
  interactive: boolean;
}

type ToolComponent = React.ComponentType<any>;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  children,
  project,
  onUpdateProject,
  interactive
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const templateJsonInputRef = useRef<HTMLInputElement>(null);
  const [targets, setTargets] = useState<Array<HTMLElement | SVGElement>>([]);
  const moveableRef = useRef<any>(null);
  const [MoveableComponent, setMoveableComponent] = useState<ToolComponent | null>(null);
  const [SelectoComponent, setSelectoComponent] = useState<ToolComponent | null>(null);

  const activeTemplateKey = project.templateType || 'scouting-report';
  const activeTemplate = project.templates[activeTemplateKey];

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

  if (!activeTemplate) {
    return <div className="relative w-full h-full">{children}</div>;
  }

  const removePlayerImage = (isSecondary = false) => {
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

  const handleTemplateJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = parseTemplatePack(String(reader.result || ''), activeTemplateKey);
      if (result.error || !result.data) {
        window.alert(result.error || 'Template JSON could not be imported.');
        if (templateJsonInputRef.current) templateJsonInputRef.current.value = '';
        return;
      }

      const updatedProject = applyTemplatePackToProject(project, activeTemplateKey, result.data);
      onUpdateProject(updatedProject);

      if (result.warnings.length > 0) {
        window.alert(`JSON imported. Notes: ${result.warnings.join(', ')}`);
      }

      if (templateJsonInputRef.current) templateJsonInputRef.current.value = '';
    };
    reader.readAsText(file);
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

  return (
    <div className="relative w-full h-full flex flex-col">
      <div
        ref={containerRef}
        className="relative flex-1 w-full h-full overflow-hidden canvas-container"
      >
        {children}

        {interactive && (
          <div className="absolute top-3 right-3 z-[90] flex flex-wrap justify-end gap-1.5 max-w-[72%] pointer-events-auto">
            <input
              ref={templateJsonInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleTemplateJsonUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => templateJsonInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-950/90 border border-neutral-700 text-white text-[11px] font-bold shadow-xl backdrop-blur-md hover:border-cyan-500 hover:text-cyan-300"
              title={`Import ${templatePackLabel(activeTemplateKey)} JSON`}
            >
              <IconFileImport size={14} />
              <span>Import {templatePackLabel(activeTemplateKey)} JSON</span>
            </button>

            {activeTemplate.visuals.playerImageSrc && (
              <button
                type="button"
                onClick={() => removePlayerImage(false)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/85 border border-red-800/70 text-red-200 text-[11px] font-bold shadow-xl backdrop-blur-md hover:bg-red-900"
                title="Remove primary player image. Undo is available."
              >
                <IconTrash size={14} />
                <span>Remove Player Image</span>
              </button>
            )}

            {activeTemplate.visuals.secondaryPlayerImageSrc && (
              <button
                type="button"
                onClick={() => removePlayerImage(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/85 border border-red-800/70 text-red-200 text-[11px] font-bold shadow-xl backdrop-blur-md hover:bg-red-900"
                title="Remove secondary player image. Undo is available."
              >
                <IconTrash size={14} />
                <span>Remove Player 2</span>
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
