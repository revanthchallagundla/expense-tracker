import { RootState } from '../store';

export const selectTheme = (state: RootState) => state.theme.value;
export const selectHasHydrated = (state: RootState) => state.theme.hasHydrated;
