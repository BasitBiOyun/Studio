import React from 'react';
import { IconX } from '@tabler/icons-react';
import { Project } from '../types';
import { EditorSidebar } from './EditorSidebar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onChange: (updated: Project) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  project,
  onChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full bg-neutral-950 border-t border-neutral-800 rounded-t-2xl shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-200 overflow-hidden"
        style={{ maxHeight: '92dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Graphic editor controls"
      >
        <div className="flex items-center justify-between p-3 border-b border-neutral-800 bg-neutral-900/60 rounded-t-2xl shrink-0">
          <div className="w-10" />
          <div className="w-12 h-1.5 bg-neutral-700 rounded-full" />
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white bg-neutral-800 min-w-10 min-h-10 flex items-center justify-center"
            aria-label="Close editor controls"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <EditorSidebar
            project={project}
            onChange={onChange}
            className="mobile-editor-sidebar border-r-0 w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};
