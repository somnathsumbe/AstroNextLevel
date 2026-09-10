'use client';

import { useEffect, useRef, useState } from 'react';

export const THEME_STORAGE_KEY = 'astro_theme';

const themes = [
  { id: 'professional-blue', label: 'Professional Blue', color: '#2f80ed' },
  { id: 'astro-purple', label: 'Astro Purple', color: '#9b7bea' },
  { id: 'dark-navy', label: 'Dark Navy', color: '#e8b85c' },
  { id: 'emerald-green', label: 'Emerald Green', color: '#36c98f' },
  { id: 'teal', label: 'Teal', color: '#39c6c0' },
  { id: 'sunset-orange', label: 'Sunset Orange', color: '#f28b52' },
  { id: 'light-minimal', label: 'Light Minimal', color: '#2563a8' },
  { id: 'dark-mode', label: 'Dark Mode', color: '#cbd5e1' },
];

function applyTheme(themeName) {
  document.documentElement.dataset.theme = themeName;
}

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('dark-navy');
  const containerRef = useRef(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) || 'dark-navy';
    setSelectedTheme(savedTheme);
    applyTheme(savedTheme);

    function closeOnOutsideClick(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    }

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  function selectTheme(themeName) {
    setSelectedTheme(themeName);
    applyTheme(themeName);
    window.localStorage.setItem(THEME_STORAGE_KEY, themeName);
  }

  function resetTheme() {
    selectTheme('dark-navy');
    window.localStorage.removeItem(THEME_STORAGE_KEY);
  }

  return (
    <div className="theme-switcher" ref={containerRef}>
      <button type="button" className="theme-trigger" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-haspopup="true" title="Theme settings">
        <i className="bi bi-palette2" /> <span className="d-none d-lg-inline">Theme</span>
      </button>
      {isOpen && <div className="theme-menu" role="menu" aria-label="Theme settings">
        <div className="theme-menu-heading"><div><span className="eyebrow">APPEARANCE</span><strong>Theme Settings</strong></div><i className="bi bi-sliders" /></div>
        <div className="theme-options">{themes.map((theme) => <button type="button" role="menuitem" className={`theme-option ${selectedTheme === theme.id ? 'selected' : ''}`} key={theme.id} onClick={() => selectTheme(theme.id)}><span className="theme-swatch" style={{ backgroundColor: theme.color }} /><span>{theme.label}</span>{selectedTheme === theme.id && <i className="bi bi-check2" />}</button>)}</div>
        <button type="button" className="theme-reset" onClick={resetTheme}><i className="bi bi-arrow-counterclockwise" /> Default Theme</button>
      </div>}
    </div>
  );
}
