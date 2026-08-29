import { useState, useCallback, useEffect, useRef } from 'react';
import { Project } from '../types';

export function useHistory(initialProject: Project | null) {
  const [history, setHistory] = useState<Project[]>(initialProject ? [initialProject] : []);
  const [initialized, setInitialized] = useState(!!initialProject);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const currentProject = history[currentIndex] || initialProject || {} as Project;

  useEffect(() => {
    if (initialProject && !initialized) {
      setHistory([initialProject]);
      setCurrentIndex(0);
      setInitialized(true);
    }
  }, [initialProject, initialized]);

  const pushState = useCallback((newProject: Project, replaceCurrent = false) => {
    setHistory((prev) => {
      if (replaceCurrent) {
        const next = [...prev];
        next[currentIndex] = newProject;
        return next;
      }

      // Check if state is essentially the same to prevent bloated history
      const current = prev[currentIndex];
      if (current && JSON.stringify(current) === JSON.stringify(newProject)) {
        return prev;
      }

      const truncated = prev.slice(0, currentIndex + 1);
      const next = [...truncated, newProject];

      // Keep max 50 states
      if (next.length > 50) {
        return next.slice(next.length - 50);
      }

      return next;
    });

    if (!replaceCurrent) {
      setCurrentIndex((prev) => Math.min(prev + 1, 49));
    }
  }, [currentIndex]);

  const resetHistory = useCallback((project: Project) => {
    setHistory([project]);
    setCurrentIndex(0);
  }, []);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;

      // Allow undo/redo even when typing, or handle appropriately
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd && !e.altKey) {
        if (e.key === 'z' && !e.shiftKey) {
          if (!isInput) {
            e.preventDefault();
            undo();
          }
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          if (!isInput) {
            e.preventDefault();
            redo();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    currentProject,
    pushState,
    resetHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
