import { EMPTY_PROGRESS, type Progress } from "../core";

const KEY = "yenko:progress:v1";

/** localStorage for now; swap for IndexedDB (idb-keyval) when the data grows. */
export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY_PROGRESS, ...JSON.parse(raw) } : EMPTY_PROGRESS;
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Private mode or quota; progress just won't persist this session.
  }
}
