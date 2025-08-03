// Theme configuration for styled-components
export const theme = {
  colors: {
    primary: '#74b9ff',
    secondary: '#fd79a8',
    success: '#00b894',
    warning: '#fdcb6e',
    error: '#e17055',
    background: '#1a1a2e',
    surface: '#2d3436',
    text: '#ffffff',
    textSecondary: '#b2bec3'
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1440px'
  },
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.2)',
    large: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  animations: {
    transition: {
      fast: '0.15s ease',
      normal: '0.3s ease',
      slow: '0.5s ease'
    },
    spring: {
      stiffness: 300,
      damping: 30
    }
  },
  gradients: {
    primary: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    secondary: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
    success: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gameBackground: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
    townMap: 'linear-gradient(45deg, #00b894 0%, #00a085 50%, #fdcb6e 100%)'
  }
};

export type Theme = typeof theme;