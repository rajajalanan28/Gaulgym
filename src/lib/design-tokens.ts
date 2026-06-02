/**
 * Design tokens dari Flutter app gym management
 * Nike-inspired dark theme
 */

export const colors = {
  primary: '#FF5722',
  primaryLight: '#FF8A50',
  primaryDark: '#E64A19',
  secondary: '#00BCD4',
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  cardBackground: '#1A1A1A',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textHint: '#707070',
  success: '#4CAF50',
  error: '#EF5350',
  warning: '#FFB74D',
  info: '#29B6F6',
} as const;

export const gradients = {
  primary: 'linear-gradient(135deg, #FF5722 0%, #FF8A50 100%)',
  card: 'linear-gradient(180deg, #2C2C2C 0%, #1E1E1E 100%)',
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
} as const;
