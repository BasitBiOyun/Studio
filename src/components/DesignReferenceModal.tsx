import React from 'react';
import { IconX, IconCheck, IconBan, IconSparkles, IconBulb } from '@tabler/icons-react';

interface DesignReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesignReferenceModal: React.FC<DesignReferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm select-none">
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ maxHeight: '92dvh' }}
        role="dialog"
        aria-modal="true"
        aria-label="BasitBiOyun editorial design system"
      >
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 flex items-center justify-between gap-3 bg-neutral-950/60 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <IconSparkles size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-black text-white uppercase tracking-wide truncate">
                BasitBiOyun Editorial Design System
              </h2>
              <p className="hidden sm:block text-xs text-neutral-400 truncate">
                Football Graphics Standard & Quality Guidelines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-w-10 min-h-10 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center"
            aria-label="Close design guide"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="p-3 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 sm:space-y-6 text-sm text-neutral-300">
          <div className="p-3 sm:p-5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-start gap-3 sm:gap-4">
            <IconBulb size={22} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h3 className="font-bold text-white uppercase text-xs tracking-wider mb-1">
                Visual Philosophy
              </h3>
              <p className="text-neutral-300 text-xs leading-relaxed">
                "In football, simplicity is the most difficult thing." Every graphic produced under the BasitBiOyun brand must look like a high-end sports editorial publication: sharp typography, balanced negative space, high-contrast data cards, and zero decorative fluff.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl bg-red-950/20 border border-red-900/40 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-red-400 font-bold uppercase text-xs tracking-wider">
                <IconBan size={16} />
                <span>Strictly Forbidden (Anti-Slop)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span><span>Excessive glassmorphism or muddy blur stacks</span></li>
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span><span>Random neon rainbow glows & floating blobs</span></li>
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span><span>Oversized pill cards or nested cards in cards</span></li>
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span><span>Generic SaaS verbs or non-football iconography</span></li>
                <li className="flex items-start gap-2"><span className="text-red-400">✕</span><span>Unanchored player cutouts without torso fade</span></li>
              </ul>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-xs tracking-wider">
                <IconCheck size={16} />
                <span>Mandatory Sports Standard</span>
              </div>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span><span>High-contrast display fonts (Barlow Condensed, Anton)</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span><span>Tabular high-precision metric numerals (/90, %, xG)</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span><span>Tactical line overlays & deep stadium atmosphere</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span><span>Seamless bottom gradient fade on player cutouts</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span><span>Consistent BasitBiOyun signature footer attribution</span></li>
              </ul>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Aspect Ratio Strategy for X/Twitter
            </h4>
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="font-black text-white">1:1 Square</div>
                <div className="text-[10px] text-neutral-500">2400×2400</div>
                <div className="text-[9px] text-cyan-400 mt-1">Multi-Image Grid</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="font-black text-white">4:5 Portrait</div>
                <div className="text-[10px] text-neutral-500">2400×3000</div>
                <div className="text-[9px] text-cyan-400 mt-1">Mobile Feed Dominance</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="font-black text-white">16:9 Cinema</div>
                <div className="text-[10px] text-neutral-500">3200×1800</div>
                <div className="text-[9px] text-cyan-400 mt-1">Broadcast / Video</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="font-black text-white">X-Landscape</div>
                <div className="text-[10px] text-neutral-500">2400×1350</div>
                <div className="text-[9px] text-cyan-400 mt-1">Single Post Hero</div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="px-3 sm:px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/60 flex justify-end shrink-0"
          style={{ paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 min-h-10 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
