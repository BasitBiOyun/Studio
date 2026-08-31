import { useCallback, useState } from 'react';
import { Project } from '../types';

const MAX_HISTORY = 50;

interface HistoryState {
  history: Project[];
  currentIndex: number;
}

export function useHistory(initialProject: Project) {
  const [state, setState] = useState<HistoryState>({
    history: [initialProject],
    currentIndex: 0,
  });

  const currentProject = state.history[state.currentIndex] ?? initialProject;

  const pushState = useCallback((newProject: Project, replaceCurrent = false) => {
    setState((previous) => {
      const current = previous.history[previous.currentIndex];

      if (replaceCurrent) {
        if (current && JSON.stringify(current) === JSON.stringify(newProject)) return previous;
        const nextHistory = [...previous.history];
        nextHistory[previous.currentIndex] = newProject;
        return { history: nextHistory, currentIndex: previous.currentIndex };
      }

      if (current && JSON.stringify(current) === JSON.stringify(newProject)) return previous;

      let nextHistory = [
        ...previous.history.slice(0, previous.currentIndex + 1),
        newProject,
      ];

      if (nextHistory.length > MAX_HISTORY) {
        nextHistory = nextHistory.slice(nextHistory.length - MAX_HISTORY);
      }

      return {
        history: nextHistory,
        currentIndex: nextHistory.length - 1,
      };
    });
  }, []);

  const resetHistory = useCallback((project: Project) => {
    setState({ history: [project], currentIndex: 0 });
  }, []);

  const undo = useCallback(() => {
    setState((previous) => ({
      ...previous,
      currentIndex: Math.max(previous.currentIndex - 1, 0),
    }));
  }, []);

  const redo = useCallback(() => {
    setState((previous) => ({
      ...previous,
      currentIndex: Math.min(previous.currentIndex + 1, previous.history.length - 1),
    }));
  }, []);

  return {
    currentProject,
    pushState,
    resetHistory,
    undo,
    redo,
    canUndo: state.currentIndex > 0,
    canRedo: state.currentIndex < state.history.length - 1,
  };
}
