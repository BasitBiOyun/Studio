import React from 'react';
import { IconAlertTriangle, IconRotate2, IconX } from '@tabler/icons-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-5 z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            <IconAlertTriangle size={24} />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-bold text-white mb-1">Reset Current Project?</h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              This will restore all player info, stats, strengths, tactical profile, colors, and layout
              back to the default Momodou Sonko template. You can still use Undo (Ctrl+Z) to revert if needed.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors shadow-md shadow-red-600/20"
              >
                <IconRotate2 size={15} />
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
