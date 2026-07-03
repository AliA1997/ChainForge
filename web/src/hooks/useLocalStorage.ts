"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * SSR-safe localStorage state. Starts with `initial` on the server and first
 * client render (so hydration matches), then loads the stored value.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // corrupted entry — fall back to initial
    }
    setLoaded(true);
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage full / privacy mode — state still updates in memory
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, set, loaded] as const;
}
