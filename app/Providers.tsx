'use client';

import { Provider } from 'react-redux';
import { store } from '../store'; // <- keep this; don't import store in layout
import { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';

// if you used the split files:
import { setTheme, markHydrated } from '../actions/themeActions';

type Theme = 'light' | 'dark';

function ThemeHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getInitialTheme = (): Theme => {
      try {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') return saved as Theme;
      } catch {}
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const t = getInitialTheme();
    dispatch(setTheme(t));
    document.documentElement.classList.toggle('dark', t === 'dark');
    dispatch(markHydrated());
  }, [dispatch]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <>
        <ThemeHydrator />
        {children}
      </>
    </Provider>
  );
}