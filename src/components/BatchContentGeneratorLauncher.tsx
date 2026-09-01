import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { generateBatchContentSet, saveBatchContentSet } from '../services/batchContentGenerator';
import { loadCurrentProject } from '../services/storage';

export const BatchContentGeneratorLauncher: React.FC = () => {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;

    const resolveHost = () => {
      if (cancelled) return;
      const node = document.querySelector<HTMLElement>('[data-testid="studio-tools-panel"]');
      if (node) {
        setHost(node);
        observer?.disconnect();
      }
    };

    resolveHost();
    if (!document.querySelector('[data-testid="studio-tools-panel"]')) {
      observer = new MutationObserver(resolveHost);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  if (!host) return null;

  const generate = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      const source = await loadCurrentProject();
      const outputs = generateBatchContentSet(source);
      await saveBatchContentSet(outputs);
      setMessage(`${outputs.length} output saved to Projects Library`);
      window.dispatchEvent(new CustomEvent('bbo-project-library-updated'));
    } catch (error) {
      console.error('Batch content generation failed.', error);
      setMessage('Batch generation failed');
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div data-testid="batch-content-generator" className="mt-2 border-t border-neutral-800 pt-2 px-1">
      <button
        type="button"
        data-testid="batch-content-generate"
        onClick={generate}
        disabled={busy}
        className="w-full min-h-9 rounded-lg border border-fuchsia-900/80 bg-fuchsia-950/35 px-3 py-2 text-left text-[10px] font-black uppercase tracking-wide text-fuchsia-300 hover:border-fuchsia-700 disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? 'Generating Content Set…' : 'Generate Content Set'}
      </button>
      <div className="mt-1 text-[9px] leading-snug text-neutral-500">
        Main + vertical, with stat/thread outputs only when the active project contains source facts.
      </div>
      {message && <div data-testid="batch-content-result" className="mt-1 text-[9px] font-semibold text-fuchsia-300">{message}</div>}
    </div>,
    host,
  );
};
