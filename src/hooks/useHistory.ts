import { useState, useCallback } from 'react';
import { Project } from '../types';

const MAX_HISTORY = 50;

export function useHistory(initialProject: Project) {
  const [history, setHistory] = useState<Project[]>([initialProject]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentProject = history[currentIndex] ?? initialProject;

  const pushState = useCallback((newProject: Project, replaceCurrent = false) => {
    setHistory((previousHistory) => {
      if (replaceCurrent) {
        const nextHistory = [...previousHistory];
        nextHistory[currentIndex] = newProject;
        return nextHistory;
      }

      const current = previousHistory[currentIndex];
      if (current && JSON.stringify(current) === JSON.stringify(newProject)) {
        return previousHistory;
      }

      const nextHistory = [
        ...previousHistory.slice(0, currentIndex + 1),
        newProject,
      ];

      return nextHistory.length > MAX_HISTORY
        ? nextHistory.slice(nextHistory.length - MAX_HISTORY)
        : nextHistory;
    });

    if (!replaceCurrent) {
      setCurrentIndex((index) => Math.min(index + 1, MAX_HISTORY - 1));
    }
  }, [currentIndex]);

  const resetHistory = useCallback((project: Project) => {
    setHistory([project]);
    setCurrentIndex(0);
  }, []);

  const undo = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, history.length - 1));
  }, [history.length]);

  return {
    currentProject,
    pushState,
    resetHistory,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
}
