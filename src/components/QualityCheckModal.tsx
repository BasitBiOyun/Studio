import React from 'react';
import { Project } from '../types';
import { runDesignQualityAudit, QualityAuditResult } from '../services/qualityChecker';
import { IconCheck, IconAlertTriangle, IconAlertCircle, IconShieldCheck, IconX } from '@tabler/icons-react';

interface QualityCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onProceedExport?: () => void;
}

export const QualityCheckModal: React.FC<QualityCheckModalProps> = ({
  isOpen,
  onClose,
  project,
  onProceedExport,
}) => {
  if (!isOpen) return null;

  const result: QualityAuditResult = runDesignQualityAudit(project);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm select-none">
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ maxHeight: '92dvh' }}
        role="dialog"
        aria-modal="true"
        aria-label="Design quality audit"
      >
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 flex items-center justify-between gap-3 bg-neutral-950/60 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black flex-shrink-0 ${
                result.passed
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
              }`}
            >
              <IconShieldCheck size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide truncate">
                Design Quality Pre-Flight
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate">
                Score: <span className="font-bold text-white">{result.score}/100</span> •{' '}
                {result.passed ? 'Ready for Export' : 'Attention Recommended'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-w-10 min-h-10 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center"
            aria-label="Close quality audit"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="p-3 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-3">
          {result.issues.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <IconCheck size={24} />
              </div>
              <h3 className="text-sm font-bold text-white uppercase">
                Core Checks Passed
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Required template content, primary contrast, key metrics and required player visuals passed the current pre-flight checks.
              </p>
            </div>
          ) : (
            result.issues.map((issue) => (
              <div
                key={issue.id}
                className={`p-3 sm:p-3.5 rounded-xl border flex items-start gap-3 ${
                  issue.severity === 'error'
                    ? 'bg-red-950/20 border-red-900/40 text-red-200'
                    : issue.severity === 'warning'
                    ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                    : 'bg-neutral-950/40 border-neutral-800 text-neutral-300'
                }`}
              >
                {issue.severity === 'error' && (
                  <IconAlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                )}
                {issue.severity === 'warning' && (
                  <IconAlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                {issue.severity === 'info' && (
                  <IconCheck size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0 text-xs">
                  <div className="font-bold uppercase tracking-wider break-words">{issue.title}</div>
                  <div className="mt-0.5 opacity-90 break-words">{issue.description}</div>
                  {issue.recommendation && (
                    <div className="mt-1 text-[11px] opacity-75 italic break-words">
                      Tip: {issue.recommendation}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div
          className="px-3 sm:px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/60 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0"
          style={{ paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={onClose}
            className="px-3.5 py-2.5 min-h-10 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-900 sm:bg-transparent"
          >
            Review Editor
          </button>

          {onProceedExport && (
            <button
              onClick={() => {
                onClose();
                onProceedExport();
              }}
              className="px-4 py-2.5 min-h-10 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Export Anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
};