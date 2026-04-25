// Theme system based on Figma design - WorkFoce
// Supports light & dark modes with comprehensive color, spacing, and typography tokens
// All colors in hex format for React Native compatibility

export const colors = {
  light: {
    background: '#ffffff',
    foreground: '#1a1a1a',
    card: '#ffffff',
    cardForeground: '#1a1a1a',
    popover: '#ffffff',
    popoverForeground: '#1a1a1a',
    primary: '#8b5cf6', // Operador - Purple
    primaryForeground: '#ffffff',
    secondary: '#22c55e', // Supervisor - Green
    secondaryForeground: '#ffffff',
    muted: '#ececf0',
    mutedForeground: '#717182',
    accent: '#06b6d4', // Mantenedor - Cyan
    accentForeground: '#ffffff',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: 'rgba(0, 0, 0, 0.1)',
    input: 'transparent',
    inputBackground: '#f3f3f5',
    switchBackground: '#cbced4',
    // Chart colors
    chart1: '#d4860d',
    chart2: '#4a90e2',
    chart3: '#5b6ba8',
    chart4: '#d4d4a8',
    chart5: '#c4b87b',
  },
  dark: {
    background: '#0f0f0f',
    foreground: '#f5f5f5',
    card: '#1a1a1a',
    cardForeground: '#f5f5f5',
    popover: '#1a1a1a',
    popoverForeground: '#f5f5f5',
    primary: '#a78bfa', // Light purple for dark mode
    primaryForeground: '#030213',
    secondary: '#4ade80', // Light green for dark mode
    secondaryForeground: '#030213',
    muted: '#3a3a4a',
    mutedForeground: '#b0b0b0',
    accent: '#22d3ee', // Light cyan for dark mode
    accentForeground: '#030213',
    destructive: '#f87171',
    destructiveForeground: '#030213',
    border: '#333333',
    input: '#2a2a3a',
    switchBackground: '#555555',
    chart1: '#8b7dd4',
    chart2: '#6bb3e8',
    chart3: '#c4b87b',
    chart4: '#b895d4',
    chart5: '#d4860d',
  },
  // Role-based colors
  roles: {
    operador: '#8b5cf6', // Purple
    supervisor: '#22c55e', // Green
    mantenedor: '#06b6d4', // Cyan
  },
  // Connector status colors
  connectorStatus: {
    charging: '#1477FF',
    available: '#0ACDA9',
    finishing: '#a855f7',
    faulted: '#ef4444',
    suspended: '#eab308',
    online: '#22c55e',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  screen: {
    horizontal: 16,
  },
};

export const radius = {
  sm: 4,
  md: 10,
  lg: 14,
  xl: 18,
};

export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export type Theme = 'light' | 'dark';

export const getThemeColors = (theme: Theme) => colors[theme];
