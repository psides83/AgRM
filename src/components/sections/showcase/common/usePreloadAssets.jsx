'use client';

import { useEffect } from 'react';

const preloadCache = new Set();

function preloadUrl(url) {
  if (preloadCache.has(url)) return;
  preloadCache.add(url);
  const img = new Image();
  img.src = url;
}

export function usePreloadAssets(urls) {
  useEffect(() => {
    urls.forEach(preloadUrl);
  }, []);
}
