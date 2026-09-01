import { useCallback, useState } from 'react';
import { Project } from '../types';
import {
  createHistoryState,
  currentHistoryProject,
  pushHistoryState,
  redoHistoryState,
  resetHistoryState,
  undoHistoryState,
} from '../services/historyState';

export function useHistory(initialProject: Project) {
  const [state, setState] = useState(() => createHistoryState(initialProject));

  const currentProject = currentHistoryProject(state, initialProject);

  const pushState = useCallback((newProject: Project, replaceCurrent = false) => {
    setState((previous) => pushHistoryState(previous, newProject, replaceCurrent));
  }, []);

  const resetHistory = useCallback((project: Project) => {
    setState(resetHistoryState(project));
  }, []);

  const undo = useCallback(() => {
    setState(undoHistoryState);
  }, []);

  const redo = useCallback(() => {
    setState(redoHistoryState);
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
