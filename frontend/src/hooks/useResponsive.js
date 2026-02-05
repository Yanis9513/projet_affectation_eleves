/**
 * Hook pour les media queries et responsive design
 */
import { useState, useEffect, useMemo } from 'react';

// Points de rupture Tailwind par defaut
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Hook pour verifier si un media query correspond
 * @param {string} query - Media query CSS
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event) => setMatches(event.matches);
    
    // Utiliser addEventListener si disponible (moderne)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Fallback pour les anciens navigateurs
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

/**
 * Hook pour obtenir le breakpoint actuel
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('');
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWidth(w);
      
      if (w >= breakpoints['2xl']) setBreakpoint('2xl');
      else if (w >= breakpoints.xl) setBreakpoint('xl');
      else if (w >= breakpoints.lg) setBreakpoint('lg');
      else if (w >= breakpoints.md) setBreakpoint('md');
      else if (w >= breakpoints.sm) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg;

  return {
    breakpoint,
    width,
    isMobile,
    isTablet,
    isDesktop,
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2xl: breakpoint === '2xl',
  };
}

/**
 * Hook pour le mode sombre
 */
export function useDarkMode() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored !== null ? stored === 'true' : prefersDark;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', isDark.toString());
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);
  const enable = () => setIsDark(true);
  const disable = () => setIsDark(false);

  return { isDark, toggle, enable, disable };
}

/**
 * Hook pour reduire les animations
 */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook pour la taille de la fenetre
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/**
 * Hook pour l'orientation de l'ecran
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState('');

  useEffect(() => {
    const handleChange = () => {
      if (window.screen?.orientation) {
        setOrientation(window.screen.orientation.type);
      } else if (window.innerWidth > window.innerHeight) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };

    handleChange();
    window.addEventListener('resize', handleChange);
    window.addEventListener('orientationchange', handleChange);
    
    return () => {
      window.removeEventListener('resize', handleChange);
      window.removeEventListener('orientationchange', handleChange);
    };
  }, []);

  const isPortrait = orientation.includes('portrait') || orientation === 'portrait';
  const isLandscape = orientation.includes('landscape') || orientation === 'landscape';

  return { orientation, isPortrait, isLandscape };
}

export default useBreakpoint;
