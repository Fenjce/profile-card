import { useState, useCallback } from "react";

// Global save state to prevent multiple simultaneous saves
let globalIsSaving = false;
const listeners = new Set<(isSaving: boolean) => void>();

export function useSaveState() {
  const [isSaving, setIsSaving] = useState(globalIsSaving);

  // Subscribe to global save state changes
  useState(() => {
    const listener = (newState: boolean) => setIsSaving(newState);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  });

  const startSaving = useCallback(() => {
    if (globalIsSaving) return false; // Already saving
    globalIsSaving = true;
    listeners.forEach((listener) => listener(true));
    return true;
  }, []);

  const stopSaving = useCallback(() => {
    globalIsSaving = false;
    listeners.forEach((listener) => listener(false));
  }, []);

  const withSaving = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      if (!startSaving()) {
        throw new Error("Already saving");
      }
      try {
        return await fn();
      } finally {
        stopSaving();
      }
    },
    [startSaving, stopSaving]
  );

  return {
    isSaving,
    startSaving,
    stopSaving,
    withSaving,
  };
}
