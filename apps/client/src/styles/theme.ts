// Kid-friendly theme configuration (Ages 7-12)
export const theme = {
  colors: {
    // Bright, playful primary colors
    primary: '#ff6b6b',      // Cheerful coral red
    secondary: '#4ecdc4',    // Turquoise 
    accent: '#45b7d1',       // Sky blue
    success: '#96ceb4',      // Mint green
    warning: '#ffeaa7',      // Sunny yellow
    error: '#fd79a8',        // Pink (less scary than red for kids)
    
    // Kid-friendly backgrounds
    background: '#f8f9ff',   // Very light blue-white
    surface: '#ffffff',      // Pure white surfaces
    surfaceLight: '#f1f3ff', // Light blue tint
    
    // Text colors optimized for readability
    text: '#2d3436',         // Dark gray (easier on eyes than pure black)
    textSecondary: '#636e72', // Medium gray
    textLight: '#b2bec3',    // Light gray
    
    // Fun accent colors for variety
    purple: '#a29bfe',       // Lavender
    orange: '#fab1a0',       // Peach
    lime: '#00d084',         // Bright green
    pink: '#fd79a8',         // Bubblegum pink
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1440px'
  },
  shadows: {
    small: '0 2px 8px rgba(45, 52, 54, 0.08)',      // Softer shadows for kids
    medium: '0 4px 16px rgba(45, 52, 54, 0.12)',
    large: '0 8px 32px rgba(45, 52, 54, 0.16)',
    fun: '0 6px 20px rgba(255, 107, 107, 0.25)',    // Colorful shadow for special elements
    glow: '0 0 20px rgba(78, 205, 196, 0.3)',       // Magical glow effect
  },
  animations: {
    transition: {
      fast: '0.15s ease',
      normal: '0.3s ease',
      slow: '0.5s ease',
      bounce: '0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Fun bounce for kids
      wiggle: '0.8s ease-in-out',  // Playful wiggle effect
    },
    spring: {
      stiffness: 300,
      damping: 30
    },
    keyframes: {
      bounce: 'bounce 0.6s ease-in-out',
      pulse: 'pulse 2s ease-in-out infinite',
      wiggle: 'wiggle 0.8s ease-in-out',
      sparkle: 'sparkle 1.5s ease-in-out infinite',
    }
  },
  gradients: {
    // Playful, bright gradients kids will love
    primary: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',           // Coral red
    secondary: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',         // Turquoise
    accent: 'linear-gradient(135deg, #45b7d1 0%, #3742fa 100%)',            // Sky blue
    success: 'linear-gradient(135deg, #96ceb4 0%, #7bed9f 100%)',           // Mint green
    warning: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',           // Sunny yellow
    
    // Fun themed gradients
    rainbow: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 25%, #45b7d1 50%, #96ceb4 75%, #ffeaa7 100%)',
    sunset: 'linear-gradient(135deg, #fab1a0 0%, #fd79a8 50%, #a29bfe 100%)',
    ocean: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #4ecdc4 100%)',
    forest: 'linear-gradient(135deg, #96ceb4 0%, #7bed9f 50%, #ffeaa7 100%)',
    
    // Background gradients
    background: 'linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%)',        // Very light blue
    gameBackground: 'linear-gradient(135deg, #74b9ff 0%, #667eea 100%)',    // Bright blue sky
    townMap: 'linear-gradient(45deg, #96ceb4 0%, #7bed9f 50%, #ffeaa7 100%)', // Nature theme
    
    // Special effects
    magical: 'linear-gradient(135deg, #a29bfe 0%, #fd79a8 50%, #fdcb6e 100%)', // Magical sparkle
    celebration: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 33%, #45b7d1 66%, #96ceb4 100%)', // Party colors
  }
};

export type Theme = typeof theme;