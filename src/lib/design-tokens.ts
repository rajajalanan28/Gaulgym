/**
 * Design tokens dari Flutter app gym management
 * Apple-inspired clean, minimalist theme
 */

export const colors = {
  // Linear Theme Colors
  primary: '#5E6AD2', // Lavender Blue
  secondary: '#888888', // Charcoal text
  background: '#000000', // Pure Black
  surface: '#0A0A0A', // Very Dark Gray for panels
  surfaceVariant: '#111111', // Slightly lighter for borders/cards
  
  // Text
  textPrimary: '#EEEEEE',
  textSecondary: '#888888',
  textHint: '#555555',
  textInverse: '#000000',
  
  // Semantic
  error: '#E5484D',
  success: '#30A46C',
  warning: '#F5A623',
} as const;

export const gradients = {
  primary: 'linear-gradient(135deg, #5E6AD2 0%, #4755C5 100%)',
  surface: 'linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(10,10,10,0.8) 100%)',
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '64px', // larger for linear layout
} as const;

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;
