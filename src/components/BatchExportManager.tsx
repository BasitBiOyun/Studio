import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { CanvasAspectRatio, ExportFormat, Project } from '../types';
import { CANVAS_DIMENSIONS } from '../constants/presets';
import { exportGraphic } from '../services/exporter';
import { ScoutingCard } from './ScoutingCard';

const BATCH_RATIOS: CanvasAspectRatio[] = ['1:1', '4:5', '16:9', 'x-landscape'];

export interface BatchExportOptions {
  scaleMultiplier: 1 | 2 | 4;
  format: ExportFormat;
  onProgress?: (status: string) => void;
}

export interface BatchExportManagerHandle {
  exportAllRatios: (options: BatchExportOptions) => Promise<void>;
}

interface BatchExportManagerProps {
  project: Project;
}

function titleSlug(project: Project): string {
  return (project.name || project.sharedData?.player?.name || 'football_graphic')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_');
}

function nextPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

export const BatchExportManager = forwardRef<BatchExportManagerHandle, BatchExportManagerProps>(
  ({ project }, ref) => {
    const [ratio, setRatio] = useState<CanvasAspectRatio>(project.aspectRatio);
    const cardRef = useRef<HTMLDivElement | null>(null);
    const exportProject = useMemo(() => ({ ...project, aspectRatio: ratio }), [project, ratio]);
    const dimensions = CANVAS_DIMENSIONS[ratio];

    useImperativeHandle(ref, () => ({
      exportAllRatios: async ({ scaleMultiplier, format, onProgress }) => {
        const originalRatio = ratio;

        try {
          for (let index = 0; index < BATCH_RATIOS.length; index += 1) {
            const nextRatio = BATCH_RATIOS[index];
            flushSync(() => setRatio(nextRatio));
            await nextPaint();

            const node = cardRef.current;
            if (!node) throw new Error(`Batch export surface was not ready for ${nextRatio}.`);

            const nextDimensions = CANVAS_DIMENSIONS[nextRatio];
            const extension = format === 'jpg' ? 'jpg' : format === 'webp' ? 'webp' : 'png';
            const filename = `BasitBiOyun_${titleSlug(project)}_${project.templateType}_${nextRatio}_${scaleMultiplier}x.${extension}`;

            await exportGraphic(node, {
              dimensions: nextDimensions,
              scaleMultiplier,
              format,
              filename,
              onProgress: (status) => onProgress?.(`[${index + 1}/${BATCH_RATIOS.length}] ${nextRatio} · ${status}`),
            });
          }
        } finally {
          flushSync(() => setRatio(originalRatio));
        }
      },
    }), [project, ratio]);

    return (
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-20000px',
          left: '-20000px',
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: -9999,
        }}
      >
        <ScoutingCard ref={cardRef} project={exportProject} interactive={false} />
      </div>
    );
  },
);

BatchExportManager.displayName = 'BatchExportManager';
