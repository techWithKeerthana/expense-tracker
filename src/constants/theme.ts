export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  income: string;
  expense: string;
  danger: string;
  warning: string;
  success: string;
  overlay: string;
  tabBarInactive: string;
}

// Brand palette derived from the app logo: deep navy background with a
// teal-to-blue gradient accent (the bar-chart/arrow mark).
export const brand = {
  navy: '#0B1220',
  navyDeep: '#070C16',
  teal: '#2DD4BF',
  blue: '#3B82F6',
};

export const lightColors: ThemeColors = {
  background: '#F4F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EAF1F6',
  card: '#FFFFFF',
  text: '#0B1220',
  textSecondary: '#465066',
  textMuted: '#8B93A7',
  border: '#E1E7EF',
  primary: '#2A8FBD',
  primaryText: '#FFFFFF',
  income: '#12A575',
  expense: '#E4573D',
  danger: '#E4573D',
  warning: '#E8A93B',
  success: '#12A575',
  overlay: 'rgba(11,18,32,0.45)',
  tabBarInactive: '#9AA3B6',
};

export const darkColors: ThemeColors = {
  background: brand.navyDeep,
  surface: '#111A2E',
  surfaceAlt: '#182238',
  card: '#131C31',
  text: '#EEF2FA',
  textSecondary: '#AAB4CC',
  textMuted: '#6E7995',
  border: '#233150',
  primary: brand.teal,
  primaryText: '#04120F',
  income: '#34D399',
  expense: '#FF6B5E',
  danger: '#FF6B5E',
  warning: '#F0BB5C',
  success: '#34D399',
  overlay: 'rgba(3,6,12,0.65)',
  tabBarInactive: '#5C6786',
};

// Teal -> blue gradient, matching the logo's bar-chart/arrow mark. Use with
// expo-linear-gradient for primary buttons, balance cards, and chart accents.
export const gradients = {
  primary: [brand.teal, brand.blue] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
};

// Cross-platform card elevation preset (iOS shadow* props + Android elevation).
export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  raised: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
