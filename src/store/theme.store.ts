import { create } from 'zustand';
import { Colors } from '../constants/colors';

interface ThemeStore {
    colors: typeof Colors;
}

export const useThemeStore = create<ThemeStore>(() => ({
    colors: Colors, // strictly dark theme per instructions
}));
