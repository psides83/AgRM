'use client';

import { createContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export const PreviousPageContext = createContext(null);

export default function PreviousPageProvider({ children }) {
  const pathname = usePathname();
  const lastPage = useRef(null);
  const [previous, setPrevious] = useState(null);

  useEffect(() => {
    const recordPage = (isHistoryTraversal) => {
      const { pathname: currentPath, search, hash } = window.location;
      const href = currentPath + search + hash;
      const state = window.history.state;
      const saved = state?.agrmPreviousPage;
      const source = saved?.pathname === currentPath
        ? saved.source
        : !isHistoryTraversal &&
            lastPage.current?.pathname !== currentPath &&
            !lastPage.current?.pathname.startsWith('/authentication/')
          ? lastPage.current?.href ?? null
          : null;

      if (saved?.pathname !== currentPath) {
        window.history.replaceState(
          { ...state, agrmPreviousPage: { pathname: currentPath, source } },
          '',
        );
      }
      lastPage.current = { pathname: currentPath, href };
      setPrevious({ pathname: currentPath, source });
    };

    recordPage(false);
    const handlePopState = () => recordPage(true);
    const rememberCurrentUrl = () => {
      const { pathname: currentPath, search, hash } = window.location;
      if (lastPage.current?.pathname === currentPath) {
        lastPage.current.href = currentPath + search + hash;
      }
    };
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', rememberCurrentUrl, true);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', rememberCurrentUrl, true);
    };
  }, [pathname]);

  return (
    <PreviousPageContext.Provider value={previous?.pathname === pathname ? previous.source : null}>
      {children}
    </PreviousPageContext.Provider>
  );
}
