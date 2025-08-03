import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { useGameStore } from './stores/gameStore';
import { useQuestStore } from './stores/questStore';
import MainMenu from './components/scenes/MainMenu';
import TownExploration from './components/scenes/TownExploration';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { AudioManager } from './hooks/useAudio';
import { GlobalStyle } from './styles/globalStyles';
import { theme } from './styles/theme';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
`;

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScene, setCurrentScene] = useState<'MainMenu' | 'TownExploration'>('MainMenu');
  
  const gameStore = useGameStore();
  const questStore = useQuestStore();

  useEffect(() => {
    // Initialize the application
    const initializeApp = async () => {
      try {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Load saved game state
        const savedScene = gameStore.currentScene;
        if (savedScene === 'TownExploration') {
          setCurrentScene('TownExploration');
        }

        // Initialize quest system
        questStore.loadQuests();

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [gameStore.currentScene, questStore]);

  // Handle scene transitions
  const handleStartGame = () => {
    AudioManager.playClick();
    setCurrentScene('TownExploration');
    gameStore.setCurrentScene('TownExploration');
  };

  const handleReturnToMenu = () => {
    AudioManager.playClick();
    setCurrentScene('MainMenu');
    gameStore.setCurrentScene('MainMenu');
  };

  // Add global click sound effect
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Play click sound for buttons
      if (target.tagName === 'BUTTON' && !target.hasAttribute('data-no-sound')) {
        AudioManager.playClick();
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <AppContainer>
          {currentScene === 'MainMenu' && (
            <MainMenu onStartGame={handleStartGame} />
          )}
          
          {currentScene === 'TownExploration' && (
            <TownExploration onReturnToMenu={handleReturnToMenu} />
          )}
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App
