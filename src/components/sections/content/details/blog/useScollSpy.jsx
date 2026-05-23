import { useEffect, useState } from 'react';

const useScrollSpy = (ids, offset = 0) => {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      let currentId = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top - offset <= 0 && rect.bottom >= 0) {
            currentId = id;
          }
        }
      }
      if (currentId !== activeId) {
        setActiveId(currentId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [ids, offset, activeId]);

  return activeId;
};

export default useScrollSpy;
