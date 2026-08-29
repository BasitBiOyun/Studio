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
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative w-full max-h-[85vh] bg-neutral-950 border-t border-neutral-800 rounded-t-2xl shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-200">
        {/* Drawer Header Handle */}
        <div className="flex items-center justify-between p-3 border-b border-neutral-800 bg-neutral-900/60 rounded-t-2xl">
          <div className="w-10" />
          <div className="w-12 h-1.5 bg-neutral-700 rounded-full" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-neutral-800"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Embedded Sidebar Controls */}
        <div className="flex-1 overflow-hidden">
          <EditorSidebar project={project} onChange={onChange} className="border-r-0" />
        </div>
      </div>
    </div>
  );
};
