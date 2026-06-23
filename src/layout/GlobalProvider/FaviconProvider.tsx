'use client';

import { type ReactNode } from 'react';
import { createContext, memo, use, useCallback, useMemo, useState } from 'react';

export type FaviconState = 'default' | 'done' | 'error' | 'progress';

interface FaviconStateContextValue {
  currentState: FaviconState;
  isDevMode: boolean;
}

interface FaviconSettersContextValue {
  setFavicon: (state: FaviconState) => void;
  setIsDevMode: (isDev: boolean) => void;
}

const FaviconStateContext = createContext<FaviconStateContextValue | null>(null);
const FaviconSettersContext = createContext<FaviconSettersContextValue | null>(null);

export const useFaviconState = () => {
  const context = use(FaviconStateContext);
  if (!context) {
    throw new Error('useFaviconState must be used within FaviconProvider');
  }
  return context;
};

export const useFaviconSetters = () => {
  const context = use(FaviconSettersContext);
  if (!context) {
    throw new Error('useFaviconSetters must be used within FaviconProvider');
  }
  return context;
};

const defaultFaviconPath = '/icons/naiyunhub-logo.png';

const getFaviconPath = () => defaultFaviconPath;

const getFaviconType = (path: string) => (path.endsWith('.png') ? 'image/png' : 'image/x-icon');

const updateFaviconDOM = () => {
  if (typeof document === 'undefined') return;

  const timestamp = Date.now();
  const head = document.head;
  const existingLinks = document.querySelectorAll<HTMLLinkElement>(
    'link[rel="icon"], link[rel="shortcut icon"]',
  );

  if (existingLinks.length === 0) {
    // No favicon links found — create them
    const iconLink = document.createElement('link');
    const iconPath = getFaviconPath();
    iconLink.rel = 'icon';
    iconLink.type = getFaviconType(iconPath);
    iconLink.href = `${iconPath}?v=${timestamp}`;
    head.append(iconLink);

    const shortcutLink = document.createElement('link');
    const shortcutPath = getFaviconPath();
    shortcutLink.rel = 'shortcut icon';
    shortcutLink.type = getFaviconType(shortcutPath);
    shortcutLink.href = `${shortcutPath}?v=${timestamp}`;
    head.append(shortcutLink);
    return;
  }

  // Remove existing favicon links and create new ones to bust cache
  existingLinks.forEach((link) => {
    const rel = link.rel;

    // Remove old link
    link.remove();

    // Create new link with cache-busting query param
    const newLink = document.createElement('link');
    const faviconPath = getFaviconPath();
    newLink.rel = rel;
    newLink.type = getFaviconType(faviconPath);
    newLink.href = `${faviconPath}?v=${timestamp}`;
    head.append(newLink);
  });
};

export const FaviconProvider = memo<{ children: ReactNode }>(({ children }) => {
  const [currentState, setCurrentState] = useState<FaviconState>('default');
  const [isDevMode, setIsDevModeState] = useState<boolean>(__DEV__);

  const setFavicon = useCallback((state: FaviconState) => {
    setCurrentState(state);
    setIsDevModeState((isDev) => {
      updateFaviconDOM();
      return isDev;
    });
  }, []);

  const setIsDevMode = useCallback((isDev: boolean) => {
    setIsDevModeState(isDev);
    setCurrentState((state) => {
      updateFaviconDOM();
      return state;
    });
  }, []);

  const stateValue = useMemo(() => ({ currentState, isDevMode }), [currentState, isDevMode]);

  const settersValue = useMemo(() => ({ setFavicon, setIsDevMode }), [setFavicon, setIsDevMode]);

  return (
    <FaviconStateContext value={stateValue}>
      <FaviconSettersContext value={settersValue}>{children}</FaviconSettersContext>
    </FaviconStateContext>
  );
});

FaviconProvider.displayName = 'FaviconProvider';
