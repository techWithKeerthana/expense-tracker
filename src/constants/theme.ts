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

export const lightColors: ThemeColors = {
  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F1F6',
  card: '#FFFFFF',
  text: '#1A1D29',
  textSecondary: '#5A5F73',
  textMuted: '#9498A8',
  border: '#E4E6EE',
  primary: '#4C6FFF',
  primaryText: '#FFFFFF',
  income: '#2E9E5B',
  expense: '#D64545',
  danger: '#D64545',
  warning: '#E8A93B',
  success: '#2E9E5B',
  overlay: 'rgba(0,0,0,0.45)',
  tabBarInactive: '#A5A9BA',
};

export const darkColors: ThemeColors = {
  background: '#12141C',
  surface: '#1B1E2A',
  surfaceAlt: '#242838',
  card: '#1F2230',
  text: '#F1F2F8',
  textSecondary: '#B4B8CC',
  textMuted: '#7A7F94',
  border: '#2C2F40',
  primary: '#6C8AFF',
  primaryText: '#FFFFFF',
  income: '#4CC97F',
  expense: '#FF6B6B',
  danger: '#FF6B6B',
  warning: '#F0BB5C',
  success: '#4CC97F',
  overlay: 'rgba(0,0,0,0.6)',
  tabBarInactive: '#5F6377',
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
