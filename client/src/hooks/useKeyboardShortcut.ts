import { useEffect } from 'react';

export interface KeyboardShortcutOptions {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
}

/**
 * Hook for handling keyboard shortcuts
 * Supports modifier keys (Ctrl, Meta/Cmd, Shift, Alt)
 */
export function useKeyboardShortcut({
  key,
  ctrlKey = false,
  metaKey = false,
  shiftKey = false,
  altKey = false,
  callback,
}: KeyboardShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the key matches
      if (event.key.toLowerCase() !== key.toLowerCase()) {
        return;
      }

      // Check modifier keys
      if (ctrlKey && !event.ctrlKey) return;
      if (metaKey && !event.metaKey) return;
      if (shiftKey && !event.shiftKey) return;
      if (altKey && !event.altKey) return;

      // If modifiers are specified but not pressed, return
      if (!ctrlKey && event.ctrlKey && !metaKey) return;
      if (!metaKey && event.metaKey && !ctrlKey) return;
      if (!shiftKey && event.shiftKey) return;
      if (!altKey && event.altKey) return;

      // Prevent default behavior and trigger callback
      event.preventDefault();
      callback();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, ctrlKey, metaKey, shiftKey, altKey, callback]);
}
