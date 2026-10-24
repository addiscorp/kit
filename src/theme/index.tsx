'use client';
// Light, dark, or the system's: a `theme` cookie wins, else the system.
import { useEffect, useState } from 'react';

const COOKIE = 'theme';

/**
 * Runs before paint (put it in an inline <script> in <head>) so the page
 * never flashes the wrong theme: sets <html data-theme>.
 */
export const themeBoot = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=(light|dark)(?:;|$)/);var dark=matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=m?m[1]:(dark?'dark':'light');}catch(e){}})()`;

function savedTheme(): 'light' | 'dark' | null {
  const match = document.cookie.match(/(?:^|; )theme=(light|dark)(?:;|$)/);
  return match ? (match[1] as 'light' | 'dark') : null;
}

function systemTheme(): 'light' | 'dark' {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** The light/dark switch; remembers the choice in the `theme` cookie. */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const apply = (theme: 'light' | 'dark') => {
      document.documentElement.dataset.theme = theme;
      setDark(theme === 'dark');
    };
    apply(savedTheme() ?? systemTheme());
    const media = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (!savedTheme()) apply(systemTheme());
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button
      className="ak-theme-toggle"
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={dark}
      onClick={() => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.cookie = `${COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
        document.documentElement.dataset.theme = next;
        setDark(next === 'dark');
      }}
    >
      <svg className="ak-moon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" /></svg>
      <svg className="ak-sun" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></svg>
    </button>
  );
}
