/**
 * Design tokens dari Flutter app gym management
 * Apple-inspired clean, minimalist theme
 */

export const colors = {
  // Apple Theme Colors
  primary: '#0066CC', // Apple Blue
  secondary: '#86868B', // System Gray
  background: '#F5F5F7', // Apple Background Gray
  surface: '#FFFFFF', // Pure White for cards/panels
  surfaceVariant: '#F5F5F7',
  
  // Text
  textPrimary: '#1D1D1F', // Deep almost black
  textSecondary: '#86868B',
  textHint: '#86868B',
  textInverse: '#FFFFFF',
  
  // Semantic
  error: '#FF3B30', // Apple Red
  success: '#34C759', // Apple Green
  warning: '#FF9500', // Apple Orange
} as const;

export const gradients = {
  primary: 'linear-gradient(135deg, #0066CC 0%, #005BB5 100%)',
  surface: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 100%)',
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
