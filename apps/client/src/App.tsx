import React, { useEffect, useState } from 'react';
import GameWorld from './components/GameWorld';

function App(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGame = async (): Promise<void> => {
      try {
        console.log('Loading game content...');
        
        // Load all game data files
        const [locationsRes, charactersRes, dialoguesRes, questsRes, itemsRes] = await Promise.all([
          fetch('/data/locations.json'),
          fetch('/data/characters.json'),
          fetch('/data/dialogues.json'),
          fetch('/data/quests.json'),
          fetch('/data/items.json')
        ]);

        // Check if all requests were successful
        if (!locationsRes.ok || !charactersRes.ok || !dialoguesRes.ok || !questsRes.ok || !itemsRes.ok) {
          throw new Error('Failed to fetch game data files');
        }

        // Parse JSON data
        const gameData = {
          locations: await locationsRes.json(),
          characters: await charactersRes.json(),
          dialogues: await dialoguesRes.json(),
          quests: await questsRes.json(),
          items: await itemsRes.json()
        };

        // Store game data globally for components to access
        (window as any).gameData = gameData;
        
        console.log('Game content loaded successfully:', gameData);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize game:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsLoading(false);
      }
    };

    initializeGame();
  }, []);

  if (error) {
    return (
      <div style={errorScreenStyle}>
        <h2>Failed to Load Game</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={loadingScreenStyle}>
        <h2>Loading English Learning Town...</h2>
        <div style={loadingSpinnerStyle}></div>
        <p>Please wait while we prepare your adventure</p>
      </div>
    );
  }

  return (
    <div style={appStyle}>
      <GameWorld />
    </div>
  );
}

// Styles
const appStyle: React.CSSProperties = {
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const loadingScreenStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: '#2C3E50',
  color: 'white',
  fontFamily: 'Arial, sans-serif'
};

const loadingSpinnerStyle: React.CSSProperties = {
  border: '4px solid #f3f3f3',
  borderTop: '4px solid #3498db',
  borderRadius: '50%',
  width: '50px',
  height: '50px',
  animation: 'spin 2s linear infinite',
  margin: '20px'
};

const errorScreenStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: '#E74C3C',
  color: 'white',
  fontFamily: 'Arial, sans-serif',
  textAlign: 'center',
  padding: '20px'
};

// Add CSS keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(styleSheet);

export default App;