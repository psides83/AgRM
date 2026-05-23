'use client';

import { createContext, use, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getItemFromStore, setItemToStore } from 'lib/utils';

const VisionFilters = () => {
  return (
    <div
      id="vision-filters"
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              in="SourceGraphic"
              values="
        0.10889,0.89111,-0.00000,0,0
        0.10889,0.89111,0.00000,0,0
        0.00447,-0.00447,1.00000,0,0
        0,0,0,1,0"
            />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0.4251 0.6934 -0.1147 0 0
                           0.3417 0.5882 0.0692 0 0
                           -0.0105 0.0234 0.9870 0 0
                           0 0 0 1 0"
            />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0.95, 0.05, 0, 0, 0
                       0,    0.433, 0.567, 0, 0
                       0,    0.475, 0.525, 0, 0
                       0,    0,     0,     1, 0"
            />
          </filter>
          <filter id="achromatopsia-filter">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0.299, 0.587, 0.114, 0, 0
                       0.299, 0.587, 0.114, 0, 0
                       0.299, 0.587, 0.114, 0, 0
                       0,     0,     0,     1, 0"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

const VisionModeProvider = ({ children }) => {
  const [mode, setModeState] = useState(getItemFromStore('visionMode', 'normal'));
  const [needsFilters, setNeedsFilters] = useState(false);

  useEffect(() => {
    // Check if filters exist, if not render them
    if (typeof document !== 'undefined' && !document.getElementById('vision-filters')) {
      setNeedsFilters(true);
    }
  }, []);

  const setMode = (newMode) => {
    setModeState(newMode);
    setItemToStore('visionMode', JSON.stringify(newMode));
  };

  useEffect(() => {
    // Apply dataset attribute for global CSS filter
    if (mode === 'normal') {
      document.documentElement.removeAttribute('data-vision');
    } else {
      document.documentElement.dataset.vision = mode;
    }
  }, [mode]);

  return (
    <VisionModeContext.Provider value={{ mode, setMode }}>
      {needsFilters && typeof document !== 'undefined' && document.body
        ? createPortal(<VisionFilters />, document.body)
        : null}
      {children}
    </VisionModeContext.Provider>
  );
};

export const VisionModeContext = createContext({
  mode: 'normal',
  setMode: () => {},
});

export const useVisionMode = () => {
  const context = use(VisionModeContext);
  if (!context) {
    throw new Error('useVisionMode must be used within a VisionModeProvider');
  }
  return context;
};

export default VisionModeProvider;
