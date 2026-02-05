/**
 * Hook pour les raccourcis clavier
 */
import { useEffect, useCallback } from 'react';

/**
 * Hook pour ecouter une combinaison de touches
 * @param {string} key - La touche principale (ex: 'k', 'Enter', 'Escape')
 * @param {Function} callback - La fonction a appeler
 * @param {Object} options - Options de configuration
 */
export function useKeyPress(key, callback, options = {}) {
  const {
    ctrl = false,
    meta = false,
    alt = false,
    shift = false,
    enabled = true,
    preventDefault = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Verifier les modificateurs
      if (ctrl && !event.ctrlKey) return;
      if (meta && !event.metaKey) return;
      if (alt && !event.altKey) return;
      if (shift && !event.shiftKey) return;

      // Verifier la touche principale
      if (event.key.toLowerCase() === key.toLowerCase()) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrl, meta, alt, shift, enabled, preventDefault]);
}

/**
 * Hook pour plusieurs raccourcis
 * @param {Object} shortcuts - Map de raccourcis -> callbacks
 */
export function useKeyboardShortcuts(shortcuts, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Ignorer si on est dans un input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
        // Sauf pour Escape
        if (event.key !== 'Escape') return;
      }

      for (const [shortcut, callback] of Object.entries(shortcuts)) {
        const parts = shortcut.toLowerCase().split('+');
        const key = parts.pop();
        const modifiers = new Set(parts);

        const needsCtrl = modifiers.has('ctrl') || modifiers.has('control');
        const needsMeta = modifiers.has('meta') || modifiers.has('cmd') || modifiers.has('command');
        const needsAlt = modifiers.has('alt') || modifiers.has('option');
        const needsShift = modifiers.has('shift');

        // Verifier les modificateurs
        if (needsCtrl && !event.ctrlKey) continue;
        if (needsMeta && !event.metaKey) continue;
        if (needsAlt && !event.altKey) continue;
        if (needsShift && !event.shiftKey) continue;

        // Verifier qu'on n'a pas de modificateurs supplementaires non voulus
        if (!needsCtrl && event.ctrlKey && key !== 'control') continue;
        if (!needsMeta && event.metaKey && key !== 'meta') continue;
        if (!needsAlt && event.altKey && key !== 'alt') continue;

        if (event.key.toLowerCase() === key) {
          event.preventDefault();
          callback(event);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Hook pour le raccourci Escape
 */
export function useEscape(callback, enabled = true) {
  useKeyPress('Escape', callback, { enabled, preventDefault: false });
}

/**
 * Hook pour les fleches
 */
export function useArrowKeys(callbacks, enabled = true) {
  const { onUp, onDown, onLeft, onRight } = callbacks;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;

      switch (event.key) {
        case 'ArrowUp':
          if (onUp) {
            event.preventDefault();
            onUp(event);
          }
          break;
        case 'ArrowDown':
          if (onDown) {
            event.preventDefault();
            onDown(event);
          }
          break;
        case 'ArrowLeft':
          if (onLeft) {
            event.preventDefault();
            onLeft(event);
          }
          break;
        case 'ArrowRight':
          if (onRight) {
            event.preventDefault();
            onRight(event);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUp, onDown, onLeft, onRight, enabled]);
}

export default useKeyPress;
