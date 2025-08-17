import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';

// Create a complete theme for testing (matching the game-client component requirements)
const testTheme = {
  colors: {
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    accent: '#FFD700',
    surface: '#ffffff',
    text: '#2d3748',
    textLight: '#718096',
    error: '#e53e3e',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
    secondary: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
    accent: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    success: 'linear-gradient(90deg, #26de81 0%, #4ecdc4 100%)',
    fun: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'Nunito, sans-serif',
  },
  spacing: {
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '8': '2rem',
  },
  borderRadius: {
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    large: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
    fun: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
  lineHeights: {
    normal: 1.5,
    relaxed: 1.625,
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    base: '300ms ease-in-out',
  },
  zIndex: {
    fixed: 1000,
  },
  breakpoints: {
    mobile: '768px',
  },
};

/**
 * Test wrapper component that provides theme context
 */
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={testTheme}>{children}</ThemeProvider>
);

/**
 * Custom render function that includes theme provider
 */
export const renderWithTheme = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: TestWrapper, ...options })
  };
};

/**
 * Re-export everything from testing library
 */
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';