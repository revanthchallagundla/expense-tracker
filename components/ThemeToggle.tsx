'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../actions/themeActions';
import { selectTheme, selectHasHydrated } from '../selectors/themeSelectors';

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const hasHydrated = useSelector(selectHasHydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!hasHydrated) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme, hasHydrated]);

  if (!mounted || !hasHydrated) {
    return (
      <div className='relative w-14 h-8 bg-gradient-to-r from-emerald-200/80 to-green-200/80 dark:from-emerald-900/80 dark:to-green-900/80 backdrop-blur-sm rounded-full shadow-lg border border-emerald-200/50 dark:border-emerald-700/50'>
        <div className='absolute top-0.5 left-0.5 w-7 h-7 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center transition-all duration-300'>
          <span className='text-sm'>🌙</span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className='relative w-14 h-8 bg-gradient-to-r from-emerald-200/80 to-green-200/80 dark:from-emerald-900/80 dark:to-green-900/80 hover:from-emerald-300/80 hover:to-green-300/80 dark:hover:from-emerald-800/80 dark:hover:to-green-800/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl border border-emerald-200/50 dark:border-emerald-700/50 transition-all duration-300 group'
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Thumb + icons same as before */}
      <div className={`absolute top-0.5 w-7 h-7 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ${
        theme === 'light' ? 'left-0.5 bg-white text-yellow-600' : 'left-6 bg-gray-800 text-emerald-400'
      }`}>
        <span className='text-sm'>{theme === 'light' ? '☀️' : '🌙'}</span>
      </div>
    </button>
  );
}
