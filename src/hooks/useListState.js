'use client';

import { useEffect, useState } from 'react';

export default function useListState(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`agrm:list:${key}`);
      if (saved !== null) setValue(JSON.parse(saved));
    } catch {
      // The list still works when browser storage is unavailable.
    }
    setRestored(true);
  }, [key]);

  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(`agrm:list:${key}`, JSON.stringify(value));
    } catch {
      // Keep the current view usable when browser storage is unavailable.
    }
  }, [key, restored, value]);

  return [value, setValue, restored];
}
