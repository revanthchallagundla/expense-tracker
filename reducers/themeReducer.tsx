import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark';

type ThemeState = {
  value: Theme;
  hasHydrated: boolean;
};

const initialState: ThemeState = {
  value: 'light',
  hasHydrated: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.value = action.payload;
    },
    toggleTheme(state) {
      state.value = state.value === 'light' ? 'dark' : 'light';
    },
    markHydrated(state) {
      state.hasHydrated = true;
    },
  },
});

export const { setTheme, toggleTheme, markHydrated } = themeSlice.actions;
export default themeSlice.reducer;
