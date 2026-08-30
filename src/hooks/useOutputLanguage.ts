import { useSyncExternalStore } from 'react';
import {
  getOutputLanguage,
  setOutputLanguage,
  subscribeOutputLanguage,
  type OutputLanguage,
} from '../services/outputLanguage';

export function useOutputLanguage(): OutputLanguage {
  return useSyncExternalStore(
    subscribeOutputLanguage,
    getOutputLanguage,
    () => 'en',
  );
}

export { setOutputLanguage };
