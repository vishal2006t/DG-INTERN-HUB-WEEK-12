import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useContexts';
const ThemeToggle = ({ className = '' }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      className={`btn btn-secondary btn-sm theme-toggle-btn ${className}`}
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        padding: '0.45rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        color: isDark ? '#fbbf24' : '#64748b',
        transition: 'color 0.2s ease, transform 0.2s ease'
      }}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};

export default ThemeToggle;
