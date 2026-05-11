'use client';

import { useCallback, useEffect, useState } from 'react';

export type Mode = 'sketchy' | 'clean';

export const MODE_STORAGE_KEY = 'mahimai_playground:clean_mode';
const CLEAN_BODY_CLASS = 'clean';

export const PRE_PAINT_MODE_SCRIPT = `try{var k='${MODE_STORAGE_KEY}',v=localStorage.getItem(k);if(v==='1')document.body.classList.add('${CLEAN_BODY_CLASS}');else document.body.classList.remove('${CLEAN_BODY_CLASS}')}catch(e){}`;

function readPersistedMode(): Mode {
  if (typeof window === 'undefined') return 'sketchy';
  try {
    return window.localStorage.getItem(MODE_STORAGE_KEY) === '1' ? 'clean' : 'sketchy';
  } catch {
    return 'sketchy';
  }
}

function writePersistedMode(mode: Mode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MODE_STORAGE_KEY, mode === 'clean' ? '1' : '0');
  } catch {
    /* private mode or quota; ignore */
  }
}

function applyBodyClass(mode: Mode): void {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle(CLEAN_BODY_CLASS, mode === 'clean');
}

export interface UseModeReturn {
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
}

export function useMode(): UseModeReturn {
  const [mode, setModeState] = useState<Mode>('sketchy');

  useEffect(() => {
    setModeState(readPersistedMode());
  }, []);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    applyBodyClass(next);
    writePersistedMode(next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next: Mode = prev === 'clean' ? 'sketchy' : 'clean';
      applyBodyClass(next);
      writePersistedMode(next);
      return next;
    });
  }, []);

  return { mode, setMode, toggleMode };
}
