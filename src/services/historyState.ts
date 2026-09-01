import { Project } from '../types';

export const MAX_HISTORY = 50;

export interface HistoryState {
  history: Project[];
  currentIndex: number;
}

function projectsEqual(left: Project | undefined, right: Project): boolean {
  return Boolean(left) && JSON.stringify(left) === JSON.stringify(right);
}

export function createHistoryState(project: Project): HistoryState {
  return { history: [project], currentIndex: 0 };
}

export function pushHistoryState(
  previous: HistoryState,
  newProject: Project,
  replaceCurrent = false,
): HistoryState {
  const current = previous.history[previous.currentIndex];

  if (replaceCurrent) {
    if (projectsEqual(current, newProject)) return previous;
    const nextHistory = [...previous.history];
    nextHistory[previous.currentIndex] = newProject;
    return { history: nextHistory, currentIndex: previous.currentIndex };
  }

  if (projectsEqual(current, newProject)) return previous;

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
}

export function resetHistoryState(project: Project): HistoryState {
  return createHistoryState(project);
}

export function undoHistoryState(previous: HistoryState): HistoryState {
  return {
    ...previous,
    currentIndex: Math.max(previous.currentIndex - 1, 0),
  };
}

export function redoHistoryState(previous: HistoryState): HistoryState {
  return {
    ...previous,
    currentIndex: Math.min(previous.currentIndex + 1, previous.history.length - 1),
  };
}

export function currentHistoryProject(state: HistoryState, fallback: Project): Project {
  return state.history[state.currentIndex] ?? fallback;
}
