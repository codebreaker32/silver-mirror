import { useCallback, useEffect, useState } from 'react';
import { getSaved, loadSaved, subscribeSaved, toggleSaved } from './store';

export interface SavedState {
  /** Saved catalogue ids, newest first. */
  saved: string[];
  isSaved: (id: string) => boolean;
  /** Returns true when the product is now saved. */
  toggle: (id: string) => boolean;
}

/** Products saved on this phone (SecureStore). Shared across every caller. */
export function useSaved(): SavedState {
  const [saved, setSaved] = useState<string[]>(getSaved);
  useEffect(() => {
    const off = subscribeSaved(setSaved);
    void loadSaved();
    setSaved(getSaved());
    return off;
  }, []);
  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);
  return { saved, isSaved, toggle: toggleSaved };
}

export { toggleSaved, loadSaved } from './store';
