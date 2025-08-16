import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Comic Neue', 'Fredoka One', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
    color: #2d3436;
    overflow: hidden;
    font-size: 16px;
    line-height: 1.6;
  }

  button {
    font-family: inherit;
  }

  /* Fun animations for kids */
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0, 0, 0);
    }
    40%, 43% {
      transform: translate3d(0, -15px, 0);
    }
    70% {
      transform: translate3d(0, -7px, 0);
    }
    90% {
      transform: translate3d(0, -3px, 0);
    }
  }

  @keyframes wiggle {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(5deg); }
    50% { transform: rotate(0deg); }
    75% { transform: rotate(-5deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes sparkle {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1);
      box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
    }
    50% { 
      opacity: 0.7; 
      transform: scale(1.1);
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes celebration {
    0% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.1) rotate(5deg); }
    50% { transform: scale(1.2) rotate(0deg); }
    75% { transform: scale(1.1) rotate(-5deg); }
    100% { transform: scale(1) rotate(0deg); }
  }

  @keyframes rainbow {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }

  .vocabulary-highlight {
    background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
    color: #2d3436;
    padding: 3px 8px;
    border-radius: 8px;
    font-weight: 600;
    cursor: help;
    box-shadow: 0 2px 4px rgba(253, 203, 110, 0.3);
    transition: all 0.3s ease;
  }

  .vocabulary-highlight:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(253, 203, 110, 0.5);
  }

  /* Kid-friendly scrollbar styling */
  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(78, 205, 196, 0.1);
    border-radius: 6px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
    border-radius: 6px;
    border: 2px solid #f8f9ff;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #44a08d 0%, #4ecdc4 100%);
    transform: scale(1.1);
  }

  /* Add some playful helper classes */
  .bounce {
    animation: bounce 0.6s ease-in-out;
  }

  .wiggle {
    animation: wiggle 0.8s ease-in-out;
  }

  .sparkle {
    animation: sparkle 1.5s ease-in-out infinite;
  }

  .celebration {
    animation: celebration 1s ease-in-out;
  }

  .pulse {
    animation: pulse 2s ease-in-out infinite;
  }
`;