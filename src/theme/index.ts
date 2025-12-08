import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Color palette
export const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  
  // Secondary colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  
  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a'
  },
  
  // Success/Error/Warning
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d'
  },
  
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c'
  },
  
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309'
  },
  
  // Neutral grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712'
  }
};

// Typography scale
export const typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium', 
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold'
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48
  },
  
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 30,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
    '5xl': 48
  },
  
  letterSpacing: {
    tight: -0.025,
    normal: 0,
    wide: 0.025
  }
};

// Spacing scale (based on 4px grid)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999
};

// Shadow definitions
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12
  }
};

// Theme mode store
interface ThemeStore {
  mode: 'light' | 'dark' | 'system';
  setMode: (mode: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode })
    }),
    {
      name: 'theme-store',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

// Hook to get current theme
export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const { mode } = useThemeStore();
  
  const isDark = mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');
  
  return {
    isDark,
    mode,
    colors: getThemeColors(isDark),
    typography,
    spacing,
    borderRadius,
    shadows
  };
};

// Get theme-aware colors
const getThemeColors = (isDark: boolean) => {
  const base = {
    primary: colors.primary,
    secondary: colors.secondary,
    neutral: colors.neutral,
    gray: colors.gray,
    success: colors.success,
    error: colors.error,
    warning: colors.warning
  };
  
  if (isDark) {
    return {
      ...base,
      background: colors.gray[950],
      surface: colors.gray[900],
      card: colors.gray[800],
      border: colors.gray[700],
      text: {
        primary: colors.gray[50],
        secondary: colors.gray[300],
        muted: colors.gray[400],
        inverse: colors.gray[900]
      },
      input: {
        background: colors.gray[800],
        border: colors.gray[600],
        placeholder: colors.gray[400]
      }
    };
  }
  
  return {
    ...base,
    background: colors.gray[50],
    surface: '#ffffff',
    card: '#ffffff',
    border: colors.gray[200],
    text: {
      primary: colors.gray[900],
      secondary: colors.gray[600],
      muted: colors.gray[500],
      inverse: colors.gray[50]
    },
    input: {
      background: colors.gray[50],
      border: colors.gray[300],
      placeholder: colors.gray[400]
    }
  };
};

export type Theme = ReturnType<typeof useTheme>;
export type ThemeColors = ReturnType<typeof getThemeColors>;