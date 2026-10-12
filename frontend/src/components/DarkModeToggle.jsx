import React, { useState, useEffect } from 'react';

/**
 * Hook to manage dark mode theme with 'sms_theme' localStorage persistence
 * and data-theme="dark" attribute on <html> element.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('sms_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // Storage access disabled or quota exceeded
    }
    return 'light';
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('sms_theme', theme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme, isDark: theme === 'dark' };
}

/**
 * DarkModeToggle Component
 * Button placed in the Header to switch between light and dark themes.
 */
export default function DarkModeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="btn-theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {isDark ? '☀️' : '🌙'}
      </span>
      <span className="theme-toggle-text">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}
