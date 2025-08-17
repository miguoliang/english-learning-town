/**
 * Design System Theme for @elt/ui components
 */

export const theme = {
  colors: {
    // Primary brand colors
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#45B7D1',
    
    // Neutral colors
    surface: '#FFFFFF',
    surfaceLight: '#F1F3F4',
    background: '#F8F9FA',
    backgroundDark: '#1A1A1A',
    
    // Text colors
    text: '#2C3E50',
    textLight: '#6C757D',
    textDark: '#495057',
    textSecondary: '#6C757D',
    
    // Status colors
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#FF4D4F',
    info: '#1890FF',
    
    // Educational theme colors
    magical: '#9B59B6',
    ocean: '#3498DB',
    forest: '#27AE60',
    sunset: '#E67E22',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #FF6B6B 0%, #FF8787 100%)',
    secondary: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
    accent: 'linear-gradient(135deg, #45B7D1 0%, #2980B9 100%)',
    magical: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
    ocean: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
    success: 'linear-gradient(135deg, #52C41A 0%, #389E0D 100%)',
    warning: 'linear-gradient(135deg, #FAAD14 0%, #D48806 100%)',
    error: 'linear-gradient(135deg, #FF4D4F 0%, #CF1322 100%)',
    background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
    celebration: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 33%, #45B7D1 66%, #52C41A 100%)',
  },
  
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.15)',
    large: '0 8px 24px rgba(0, 0, 0, 0.2)',
    fun: '0 4px 15px rgba(255, 107, 107, 0.4)',
  },
  
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeights: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },
  
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  },
  
  fonts: {
    body: "'Inter', 'Segoe UI', system-ui, sans-serif",
    heading: "'Comic Neue', 'Fredoka One', sans-serif",
    mono: "'Fira Code', 'Monaco', monospace",
  },
  
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    overlay: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
  
  transitions: {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '300ms ease',
    bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

export type Theme = typeof theme;

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}