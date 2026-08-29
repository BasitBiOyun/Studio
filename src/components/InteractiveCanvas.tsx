import React, { useRef, useState, useEffect } from 'react';
import Moveable from 'react-moveable';
import Selecto from 'react-selecto';
import { Project } from '../types';

interface InteractiveCanvasProps {
  children: React.ReactNode;
  project: Project;
  onUpdateProject: (p: Project) => void;
  interactive: boolean;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  children,
  project,
  onUpdateProject,
  interactive
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [targets, setTargets] = useState<Array<HTMLElement | SVGElement>>([]);
  const moveableRef = useRef<Moveable>(null);

  // We need to keep a local tracking of transform deltas to apply onDragEnd
  const activeTemplateKey = project.templateType || 'scouting-report';
  const activeTemplate = project.templates[activeTemplateKey];
  if (!activeTemplate) return <div className="relative w-full h-full">{children}</div>;

  const handleDrag = (e: any) => {
    const target = e.target as HTMLElement;
    const moveableId = target.getAttribute('data-moveable-id');
    if (!moveableId) return;

    if (moveableId.startsWith('logo-')) {
      // Logos use absolute positioning with x/y as px offsets.
      // right = defaultRight - x, top = defaultTop + y
      // So if dragging, +dx means moving right -> -x needs to increase? 
      // dx is movement in px. If it moves right, dx > 0.
      // logo.x is subtracted from right, so logo.x controls moving left.
      // To move right (+dx), logo.x should decrease by dx.
      // To move down (+dy), logo.y should increase by dy.
      
      const currentX = parseFloat(target.getAttribute('data-x') || '0');
      const currentY = parseFloat(target.getAttribute('data-y') || '0');
      
      const newX = currentX - e.delta[0];
      const newY = currentY + e.delta[1];
      
      target.setAttribute('data-x', newX.toString());
      target.setAttribute('data-y', newY.toString());
      
      // Update inline style 
      // Because we used `right` and `top`, we can just override transform temporarily for smoothness,
      // or directly update right/top.
      // But we have `e.transform` which is a translate(). We can just let Moveable apply it for the frame,
      // but the initial state didn't have translate! 
      // Actually, e.transform will accumulate translate() on top of the initial right/top.
      target.style.transform = e.transform;
      
    } else {
      // Images use percentage translate
      const parent = target.parentElement;
      if (!parent) return;
      const pw = parent.offsetWidth;
      const ph = parent.offsetHeight;
      
      const dx = (e.delta[0] / pw) * 100;
      const dy = (e.delta[1] / ph) * 100;
      
      const currentX = parseFloat(target.getAttribute('data-x') || '0');
      const currentY = parseFloat(target.getAttribute('data-y') || '0');
      
      const newX = currentX + dx;
      const newY = currentY + dy;
      
      target.setAttribute('data-x', newX.toFixed(2));
      target.setAttribute('data-y', newY.toFixed(2));
      
      const scale = target.getAttribute('data-scale') || '1';
      target.style.transform = `translate(${newX}%, ${newY}%) scale(${scale})`;
    }
  };

  const handleScale = (e: any) => {
    // e.delta is [scaleX, scaleY]
    const scaleX = e.delta[0]; // Wait, delta is the difference in scale?
    // Moveable's onScale e.scale is the total scale [scaleX, scaleY]
    // wait, scale is multiplier
    const currentScale = parseFloat(e.target.getAttribute('data-scale') || '1');
    const newScale = currentScale * e.delta[0];
    
    e.target.setAttribute('data-scale', newScale.toFixed(2));
    
    const x = e.target.getAttribute('data-x') || '0';
    const y = e.target.getAttribute('data-y') || '0';
    
    e.target.style.transform = `translate(${x}%, ${y}%) scale(${newScale})`;
  };

  const handleDragEnd = (e: any) => {
    if (!e.isDrag) return;
    updateProjectFromTarget(e.target);
  };
  
  const handleScaleEnd = (e: any) => {
    if (!e.isDrag) return; // isDrag applies to scale?
    updateProjectFromTarget(e.target);
  };

  const updateProjectFromTarget = (target: HTMLElement) => {
    const id = target.getAttribute('data-moveable-id');
    if (!id) return;

    const x = parseFloat(target.getAttribute('data-x') || '0');
    const y = parseFloat(target.getAttribute('data-y') || '0');
    const scale = parseFloat(target.getAttribute('data-scale') || '1');

    const newProject = JSON.parse(JSON.stringify(project)) as Project;
    const template = newProject.templates[activeTemplateKey];
    
    if (id === 'primary-image') {
      template.visuals.imageTransform.x = x;
      template.visuals.imageTransform.y = y;
      template.visuals.imageTransform.scale = scale;
    } else if (id === 'secondary-image' && template.visuals.secondaryImageTransform) {
      template.visuals.secondaryImageTransform.x = x;
      template.visuals.secondaryImageTransform.y = y;
      template.visuals.secondaryImageTransform.scale = scale;
    } else if (id.startsWith('logo-')) {
      const idxStr = id.replace('logo-', '');
      const logo = template.visuals.logos.find((l: any, idx: number) => (l.id || idx).toString() === idxStr);
      if (logo) {
        logo.x = x;
        logo.y = y;
        // The inline style transform must be reset because we save it to x/y which affects top/right
        target.style.transform = '';
      }
    }
    onUpdateProject(newProject);
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <div 
        ref={containerRef} 
        className="relative flex-1 w-full h-full overflow-hidden canvas-container"
      >
        {children}
        
        {interactive && (
          <>
            <Moveable
              ref={moveableRef}
              target={targets}
              draggable={true}
              scalable={true}
              rotatable={true}
              keepRatio={true}
              snappable={true}
              snapCenter={true}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              onScale={handleScale}
              onScaleEnd={handleScaleEnd}
            />
            <Selecto
              container={containerRef.current}
              selectableTargets={['.moveable-target']}
              selectByClick={true}
              selectFromInside={false}
              hitRate={0}
              onSelectEnd={e => {
                setTargets(e.selected);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};
